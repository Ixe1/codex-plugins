#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const DEFAULT_WIDTHS = [390, 768, 1024, 1280, 1440];
const DEFAULT_HEIGHT = 1400;

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node audit-responsive-layout.mjs <page.html or URL> [options]",
    "",
    "Options:",
    "  --json <path>             Write full JSON audit output",
    "  --screenshots-dir <path>  Capture full-page screenshots for each viewport",
    "  --widths <csv>            Viewport widths, default 390,768,1024,1280,1440",
    "  --height <px>             Viewport height, default 1400",
    "  --allow-document-overflow Do not exit nonzero for page-wide overflow",
    "  --allow-nav-failures      Do not exit nonzero for responsive nav failures",
  ].join("\n"));
}

let targetArg;
let jsonPath;
let screenshotsDir;
let widths = DEFAULT_WIDTHS;
let height = DEFAULT_HEIGHT;
let allowDocumentOverflow = false;
let allowNavFailures = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (!targetArg && !arg.startsWith("--")) {
    targetArg = arg;
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else if (arg === "--screenshots-dir") {
    screenshotsDir = args[++index];
  } else if (arg === "--widths") {
    widths = args[++index].split(",").map((value) => Number.parseInt(value.trim(), 10)).filter(Number.isFinite);
  } else if (arg === "--height") {
    height = Number.parseInt(args[++index], 10);
  } else if (arg === "--allow-document-overflow") {
    allowDocumentOverflow = true;
  } else if (arg === "--allow-nav-failures") {
    allowNavFailures = true;
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

if (!targetArg || widths.length === 0 || !Number.isFinite(height)) {
  usage();
  process.exit(1);
}

const outputJsonPath = jsonPath ? path.resolve(jsonPath) : null;
const outputScreenshotsDir = screenshotsDir ? path.resolve(screenshotsDir) : null;
screenshotsDir = outputScreenshotsDir;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  try {
    const requireFromProject = createRequire(path.join(process.cwd(), "package.json"));
    ({ chromium } = requireFromProject("playwright"));
  } catch (fallbackError) {
    console.error("Playwright is not installed in the project. Run `npm --prefix <projectRoot> i -D playwright` and `npm --prefix <projectRoot> exec playwright install chromium`, or run a manual responsive overflow audit.");
    process.exit(2);
  }
}

const targetUrl = /^https?:\/\//.test(targetArg)
  ? targetArg
  : pathToFileURL(path.resolve(targetArg)).href;

async function collectResponsiveNavigation(page, compactExpected) {
  return await page.evaluate((isCompact) => {
    function cssPath(element) {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const parts = [];
      let current = element;
      while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
        let part = current.localName;
        if (current.id) {
          part += `#${current.id}`;
          parts.unshift(part);
          break;
        }

        const classNames = Array.from(current.classList || []).slice(0, 3);
        if (classNames.length > 0) {
          part += `.${classNames.join(".")}`;
        }

        const parent = current.parentElement;
        if (parent) {
          const sameTagSiblings = Array.from(parent.children).filter((child) => child.localName === current.localName);
          if (sameTagSiblings.length > 1) {
            part += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
          }
        }

        parts.unshift(part);
        current = current.parentElement;
      }

      return parts.join(" > ");
    }

    function isVisible(element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }

    const viewportWidth = window.innerWidth;
    const navRoots = Array.from(document.querySelectorAll([
      "header nav",
      "nav",
      '[role="navigation"]',
      ".site-nav",
      ".navbar",
      ".primary-nav",
      ".main-nav",
    ].join(",")));

    const visibleNavControls = Array.from(new Set(navRoots.flatMap((root) => Array.from(root.querySelectorAll("a[href], button, [role='button']")))))
      .filter(isVisible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const clipped = rect.left < -1 || rect.right > viewportWidth + 1;
        const smallTapTarget = rect.width < 40 || rect.height < 40;
        return {
          selector: cssPath(element),
          tag: element.localName,
          text: (element.innerText || element.getAttribute("aria-label") || "").trim().slice(0, 80),
          left: Number(rect.left.toFixed(2)),
          right: Number(rect.right.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
          clipped,
          smallTapTarget,
        };
      });

    const toggleCandidates = Array.from(document.querySelectorAll([
      "button[aria-controls][aria-expanded]",
      "[role='button'][aria-controls][aria-expanded]",
      "[data-nav-toggle]",
      ".nav-toggle",
      ".menu-toggle",
      ".hamburger",
    ].join(",")))
      .filter(isVisible)
      .map((element, index) => {
        element.setAttribute("data-maquette-audit-nav-toggle", String(index));
        const rect = element.getBoundingClientRect();
        const controls = element.getAttribute("aria-controls") || "";
        const controlledElement = controls ? document.getElementById(controls) : null;
        return {
          index,
          selector: `[data-maquette-audit-nav-toggle="${index}"]`,
          cssPath: cssPath(element),
          ariaControls: controls,
          ariaExpanded: element.getAttribute("aria-expanded"),
          accessibleLabel: element.getAttribute("aria-label") || element.getAttribute("title") || (element.innerText || "").trim(),
          targetExists: Boolean(controlledElement),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
          smallTapTarget: rect.width < 40 || rect.height < 40,
        };
      });

    const clippedControls = visibleNavControls.filter((item) => item.clipped);
    const smallTapTargets = visibleNavControls.filter((item) => item.smallTapTarget);
    const hasPrimaryNav = navRoots.length > 0 && (visibleNavControls.length > 0 || toggleCandidates.length > 0);
    const documentOverflowPx = Math.max(
      document.documentElement.scrollWidth - viewportWidth,
      document.body.scrollWidth - viewportWidth,
      0,
    );

    return {
      compactExpected: isCompact,
      navRootCount: navRoots.length,
      visibleNavControlCount: visibleNavControls.length,
      hasPrimaryNav,
      toggleCandidateCount: toggleCandidates.length,
      toggleCandidates,
      clippedControls,
      smallTapTargets,
      documentOverflowPx,
      passNoClippedControls: clippedControls.length === 0,
      passTapTargets: !isCompact || smallTapTargets.length === 0,
      passDocumentOverflow: documentOverflowPx <= 1,
    };
  }, compactExpected);
}

async function auditResponsiveNavigation(page, width, screenshotsDir) {
  const compactExpected = width <= 1024;
  const before = await collectResponsiveNavigation(page, compactExpected);
  let toggleCheck = null;
  let afterOpen = null;
  let drawerScrollability = null;
  let openScreenshotPath = null;

  if (compactExpected && before.toggleCandidates.length > 0) {
    const toggle = before.toggleCandidates[0];
    await page.click(toggle.selector);
    await page.waitForTimeout(150);
    afterOpen = await collectResponsiveNavigation(page, compactExpected);
    const afterToggle = afterOpen.toggleCandidates.find((candidate) => candidate.index === toggle.index) ?? afterOpen.toggleCandidates[0];
    toggleCheck = {
      selector: toggle.cssPath,
      ariaControls: toggle.ariaControls,
      targetExists: toggle.targetExists,
      beforeAriaExpanded: toggle.ariaExpanded,
      afterAriaExpanded: afterToggle?.ariaExpanded ?? null,
      ariaExpandedChanged: toggle.ariaExpanded !== (afterToggle?.ariaExpanded ?? null),
    };

    drawerScrollability = await page.evaluate((controlsId) => {
      function isVisible(element) {
        if (!element) {
          return false;
        }
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      }

      function inViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
      }

      const drawer = controlsId ? document.getElementById(controlsId) : null;
      if (!drawer) {
        return {
          targetExists: false,
          passDrawerScrollability: true,
          notes: "No controlled drawer element found; aria-controls validation handles this failure.",
        };
      }

      const style = window.getComputedStyle(drawer);
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      const rect = drawer.getBoundingClientRect();
      const hasInternalOverflow = drawer.scrollHeight > drawer.clientHeight + 1;
      const contentExceedsViewport = drawer.scrollHeight > window.innerHeight + 1 || rect.height > window.innerHeight + 1;
      const overflowAllowsScroll = ["auto", "scroll"].includes(style.overflowY) || ["auto", "scroll"].includes(style.overflow);
      const bodyScrollLocked = bodyStyle.overflow === "hidden" || bodyStyle.overflowY === "hidden" || htmlStyle.overflow === "hidden" || htmlStyle.overflowY === "hidden";
      const overscrollContained = ["contain", "none"].includes(style.overscrollBehaviorY) || ["contain", "none"].includes(style.overscrollBehavior);

      const controls = Array.from(document.querySelectorAll("button, [role='button']"));
      const closeControl = controls.find((element) => {
        const label = `${element.getAttribute("aria-label") || ""} ${element.getAttribute("title") || ""} ${element.textContent || ""}`.toLowerCase();
        return (element.getAttribute("aria-controls") === controlsId || label.includes("close") || label.includes("menu")) && isVisible(element);
      });

      const visibleDrawerLinks = Array.from(drawer.querySelectorAll("a[href], button, [role='button']"))
        .filter(isVisible);
      const unreachableLinks = visibleDrawerLinks.filter((element) => !inViewport(element));
      const closeControlReachable = closeControl ? inViewport(closeControl) : true;
      const linksReachable = unreachableLinks.length === 0 || overflowAllowsScroll;
      const scrollableWhenNeeded = !hasInternalOverflow || overflowAllowsScroll;
      const bodyLockDoesNotBlockDrawer = !(bodyScrollLocked && contentExceedsViewport) || overflowAllowsScroll;

      return {
        targetExists: true,
        drawerVisible: isVisible(drawer),
        clientHeight: drawer.clientHeight,
        scrollHeight: drawer.scrollHeight,
        viewportHeight: window.innerHeight,
        overflowY: style.overflowY,
        overscrollBehaviorY: style.overscrollBehaviorY,
        hasInternalOverflow,
        contentExceedsViewport,
        bodyScrollLocked,
        overscrollContained,
        closeControlReachable,
        visibleDrawerLinkCount: visibleDrawerLinks.length,
        unreachableLinkCount: unreachableLinks.length,
        scrollableWhenNeeded,
        bodyLockDoesNotBlockDrawer,
        passDrawerScrollability: isVisible(drawer) && scrollableWhenNeeded && bodyLockDoesNotBlockDrawer && closeControlReachable && linksReachable,
      };
    }, toggle.ariaControls);

    if (screenshotsDir) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
      openScreenshotPath = path.resolve(screenshotsDir, `responsive-nav-open-${width}.png`);
      await page.screenshot({ path: openScreenshotPath, fullPage: true });
    }
  }

  const compactNavNeedsToggle = compactExpected && before.hasPrimaryNav;
  const passToggle = !compactNavNeedsToggle || (toggleCheck?.ariaExpandedChanged === true && toggleCheck?.targetExists !== false);
  const states = [before, afterOpen].filter(Boolean);
  const passStates = states.every((state) => state.passNoClippedControls && state.passTapTargets && state.passDocumentOverflow);
  const passDrawerScrollability = drawerScrollability?.passDrawerScrollability !== false;

  return {
    compactExpected,
    before,
    afterOpen,
    toggleCheck,
    drawerScrollability,
    openScreenshotPath,
    passResponsiveNavigation: passToggle && passStates && passDrawerScrollability,
  };
}

let browser;
const startedAt = new Date().toISOString();
const results = [];

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const width of widths) {
    await page.setViewportSize({ width, height });
    await page.goto(targetUrl, { waitUntil: "load", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});

    const audit = await page.evaluate(() => {
      const wideSelector = [
        "table",
        '[role="grid"]',
        '[role="table"]',
        '[data-maquette-wide]',
        ".table",
        ".data-table",
        ".data-grid",
        ".grid-table",
        ".timeline",
        ".calendar",
        ".chart",
        ".map",
        ".editor",
        ".comparison-matrix",
        "pre",
        "code",
      ].join(",");

      function cssPath(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
          return "";
        }

        const parts = [];
        let current = element;
        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
          let part = current.localName;
          if (current.id) {
            part += `#${current.id}`;
            parts.unshift(part);
            break;
          }

          const classNames = Array.from(current.classList || []).slice(0, 3);
          if (classNames.length > 0) {
            part += `.${classNames.join(".")}`;
          }

          const parent = current.parentElement;
          if (parent) {
            const sameTagSiblings = Array.from(parent.children).filter((child) => child.localName === current.localName);
            if (sameTagSiblings.length > 1) {
              part += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
            }
          }

          parts.unshift(part);
          current = current.parentElement;
        }

        return parts.join(" > ");
      }

      const viewportWidth = window.innerWidth;
      const allElements = Array.from(document.body.querySelectorAll("*"));
      function hasScrollableWideAncestor(element) {
        let current = element;
        while (current && current !== document.body && current !== document.documentElement) {
          const style = window.getComputedStyle(current);
          const overflowAllowsScroll = ["auto", "scroll"].includes(style.overflowX)
            || ["auto", "scroll"].includes(style.overflow);
          const markedWide = current.matches(wideSelector);
          if ((overflowAllowsScroll || markedWide) && current.scrollWidth > current.clientWidth + 1) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      }

      function closedOffscreenDrawerAncestor(element) {
        const elementRect = element.getBoundingClientRect();
        const elementIsOffscreen = elementRect.right <= 0
          || elementRect.left >= viewportWidth
          || elementRect.bottom <= 0
          || elementRect.top >= window.innerHeight;
        let current = element;
        while (current && current !== document.body && current !== document.documentElement) {
          if (current.id) {
            const control = document.querySelector(`[aria-controls="${CSS.escape(current.id)}"][aria-expanded="false"]`);
            if (control && elementIsOffscreen) {
              return current;
            }
          }
          current = current.parentElement;
        }
        return null;
      }

      const overflowOffenders = allElements
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const rightOverflow = Math.max(0, rect.right - viewportWidth);
          const leftOverflow = Math.max(0, -rect.left);
          const overflow = Math.max(rightOverflow, leftOverflow);
          const acceptedInternalScroll = hasScrollableWideAncestor(element);
          const offscreenDrawer = closedOffscreenDrawerAncestor(element);
          const acceptedClosedOffscreenDrawer = Boolean(offscreenDrawer);
          return {
            selector: cssPath(element),
            tag: element.localName,
            className: typeof element.className === "string" ? element.className : "",
            left: Number(rect.left.toFixed(2)),
            right: Number(rect.right.toFixed(2)),
            width: Number(rect.width.toFixed(2)),
            overflow: Number(overflow.toFixed(2)),
            acceptedInternalScroll,
            acceptedClosedOffscreenDrawer,
            offscreenDrawerSelector: offscreenDrawer ? cssPath(offscreenDrawer) : "",
          };
        })
        .filter((item) => item.overflow > 1 && item.width > 0)
        .sort((a, b) => b.overflow - a.overflow)
        .slice(0, 10);

      const wideComponents = Array.from(document.querySelectorAll(wideSelector))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            selector: cssPath(element),
            tag: element.localName,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            rectWidth: Number(rect.width.toFixed(2)),
            hasInternalHorizontalScroll: element.scrollWidth > element.clientWidth + 1,
          };
        })
        .filter((item) => item.clientWidth > 0 || item.scrollWidth > 0);

      const trueOverflowOffenders = overflowOffenders.filter((item) => !item.acceptedInternalScroll && !item.acceptedClosedOffscreenDrawer);
      const acceptedInternalScrollOffenders = overflowOffenders.filter((item) => item.acceptedInternalScroll);
      const acceptedClosedOffscreenDrawerOffenders = overflowOffenders.filter((item) => item.acceptedClosedOffscreenDrawer);

      return {
        windowInnerWidth: viewportWidth,
        documentElementScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        documentOverflowPx: Math.max(
          document.documentElement.scrollWidth - viewportWidth,
          document.body.scrollWidth - viewportWidth,
          0,
        ),
        wideComponents,
        overflowOffenders,
        trueOverflowOffenders,
        acceptedInternalScrollOffenders,
        acceptedClosedOffscreenDrawerOffenders,
      };
    });

    let screenshotPath = null;
    if (screenshotsDir) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
      screenshotPath = path.resolve(screenshotsDir, `responsive-${width}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    const responsiveNavigation = await auditResponsiveNavigation(page, width, screenshotsDir);

    results.push({
      viewport: { width, height },
      screenshotPath,
      ...audit,
      responsiveNavigation,
      passDocumentOverflow: audit.documentOverflowPx <= 1,
      passResponsiveNavigation: responsiveNavigation.passResponsiveNavigation,
    });
  }
} finally {
  if (browser) {
    await browser.close();
  }
}

const output = {
  target: targetArg,
  targetUrl,
  startedAt,
  finishedAt: new Date().toISOString(),
  allowDocumentOverflow,
  allowNavFailures,
  results,
  pass: (results.every((result) => result.passDocumentOverflow) || allowDocumentOverflow)
    && (results.every((result) => result.passResponsiveNavigation) || allowNavFailures),
};

if (outputJsonPath) {
  fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });
  fs.writeFileSync(outputJsonPath, `${JSON.stringify(output, null, 2)}\n`);
}

for (const result of results) {
  const wideScrollCount = result.wideComponents.filter((item) => item.hasInternalHorizontalScroll).length;
  const acceptedInternalScrollCount = result.acceptedInternalScrollOffenders?.length ?? 0;
  const acceptedClosedDrawerCount = result.acceptedClosedOffscreenDrawerOffenders?.length ?? 0;
  const status = result.passDocumentOverflow && result.passResponsiveNavigation ? "PASS" : "FAIL";
  const navStatus = result.passResponsiveNavigation ? "nav=pass" : "nav=fail";
  console.log(`${status} ${result.windowInnerWidth}px: docEl=${result.documentElementScrollWidth}, body=${result.bodyScrollWidth}, overflow=${result.documentOverflowPx}px, wideScroll=${wideScrollCount}, acceptedInternalScroll=${acceptedInternalScrollCount}, acceptedClosedDrawer=${acceptedClosedDrawerCount}, ${navStatus}`);
  if (result.trueOverflowOffenders?.length > 0) {
    const top = result.trueOverflowOffenders[0];
    console.log(`  top offender: ${top.selector || top.tag} (${top.overflow}px)`);
  } else if (acceptedInternalScrollCount > 0) {
    const top = result.acceptedInternalScrollOffenders[0];
    console.log(`  accepted internal scroll: ${top.selector || top.tag} (${top.overflow}px)`);
  } else if (acceptedClosedDrawerCount > 0) {
    const top = result.acceptedClosedOffscreenDrawerOffenders[0];
    console.log(`  accepted closed drawer: ${top.offscreenDrawerSelector || top.selector || top.tag} (${top.overflow}px)`);
  }
  if (result.responsiveNavigation?.toggleCheck) {
    const check = result.responsiveNavigation.toggleCheck;
    console.log(`  nav toggle: aria-expanded ${check.beforeAriaExpanded} -> ${check.afterAriaExpanded}, controls=${check.ariaControls || "missing"}`);
  } else if (result.responsiveNavigation?.compactExpected && result.responsiveNavigation?.before?.hasPrimaryNav) {
    console.log("  nav toggle: missing compact navigation toggle");
  }
  if (result.responsiveNavigation?.drawerScrollability) {
    const drawer = result.responsiveNavigation.drawerScrollability;
    const drawerStatus = drawer.passDrawerScrollability ? "pass" : "fail";
    console.log(`  nav drawer scrollability: ${drawerStatus}, overflowY=${drawer.overflowY || "n/a"}, scrollHeight=${drawer.scrollHeight ?? "n/a"}, clientHeight=${drawer.clientHeight ?? "n/a"}`);
  }
  if (result.responsiveNavigation?.openScreenshotPath) {
    console.log(`  nav open screenshot: ${result.responsiveNavigation.openScreenshotPath}`);
  }
  if (result.screenshotPath) {
    console.log(`  screenshot: ${result.screenshotPath}`);
  }
}

if (outputJsonPath) {
  console.log(`JSON: ${outputJsonPath}`);
}

if (!output.pass) {
  process.exit(1);
}

#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const DEFAULT_REQUIRED_SELECTORS = [
  ".btn",
  ".input|.field__input|input",
];

const DEFAULT_RECOMMENDED_SELECTORS = [
  ".icon-btn",
  ".site-nav",
  ".data-table",
  ".service-card",
  ".pricing-card",
  ".newsletter",
  ".footer-module",
];

const DEFAULT_CONTRAST_SAMPLES = {
  lightActive: ".site-nav:not(.nav--dark) .site-nav__link.is-active",
  darkActive: ".site-nav.nav--dark .site-nav__link.is-active",
  darkDefault: ".site-nav.nav--dark .site-nav__link:not(.is-active)",
  iconSelected: ".icon-btn.is-selected",
};

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node check-component-gallery.mjs <component-reference.html or URL> [options]",
    "",
    "Options:",
    "  --json <path>                 Write JSON output",
    "  --required-selectors <csv>    Required selectors to smoke-check; use a|b for alternatives",
    "  --min-contrast <ratio>        Minimum contrast ratio, default 4.5",
    "  --allow-missing-contrast      Do not fail when default contrast samples are absent",
  ].join("\n"));
}

let targetArg;
let jsonPath;
let requiredSelectors = DEFAULT_REQUIRED_SELECTORS;
let minContrast = 4.5;
let allowMissingContrast = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (!arg.startsWith("--") && !targetArg) {
    targetArg = arg;
  } else if (arg === "--json") {
    jsonPath = args[++index];
  } else if (arg === "--required-selectors") {
    requiredSelectors = args[++index].split(",").map((value) => value.trim()).filter(Boolean);
  } else if (arg === "--min-contrast") {
    minContrast = Number.parseFloat(args[++index]);
  } else if (arg === "--allow-missing-contrast") {
    allowMissingContrast = true;
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

targetArg ??= ".maquette/components/replica-gallery.html";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  try {
    const requireFromProject = createRequire(path.join(process.cwd(), "package.json"));
    ({ chromium } = requireFromProject("playwright"));
  } catch (fallbackError) {
    console.error("Playwright is not installed. Run `npm i -D playwright` and `npx playwright install chromium`, or run a manual component reference check.");
    process.exit(2);
  }
}

const targetUrl = /^https?:\/\//.test(targetArg)
  ? targetArg
  : pathToFileURL(path.resolve(targetArg)).href;

let browser;
let result;

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(targetUrl, { waitUntil: "load", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 2000 }).catch(() => {});

  result = await page.evaluate(({ selectors, recommendedSelectors, samples, contrastFloor, allowMissing }) => {
    function rgba(value) {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(",").map((part) => Number.parseFloat(part));
      return [parts[0], parts[1], parts[2], parts[3] ?? 1];
    }

    function blend(foreground, background) {
      const alpha = foreground[3];
      return [
        foreground[0] * alpha + background[0] * (1 - alpha),
        foreground[1] * alpha + background[1] * (1 - alpha),
        foreground[2] * alpha + background[2] * (1 - alpha),
        1,
      ];
    }

    function luminance(channelValues) {
      return channelValues.slice(0, 3)
        .map((value) => {
          const normalized = value / 255;
          return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, value, itemIndex) => sum + value * [0.2126, 0.7152, 0.0722][itemIndex], 0);
    }

    function contrast(foreground, background) {
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));
      return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
    }

    function resolvedBackground(element) {
      let current = element;
      let color = rgba(getComputedStyle(current).backgroundColor);
      while ((!color || color[3] === 0) && current.parentElement) {
        current = current.parentElement;
        color = rgba(getComputedStyle(current).backgroundColor);
      }
      return color ?? [255, 255, 255, 1];
    }

    function sample(selector) {
      const element = document.querySelector(selector);
      if (!element) {
        return { selector, found: false, ratio: null, pass: allowMissing };
      }

      const style = getComputedStyle(element);
      const foreground = rgba(style.color);
      const rawBackground = rgba(style.backgroundColor);
      const parentBackground = resolvedBackground(element.parentElement ?? element);
      const renderedBackground = rawBackground && rawBackground[3] > 0 && rawBackground[3] < 1
        ? blend(rawBackground, parentBackground)
        : rawBackground && rawBackground[3] === 1
          ? rawBackground
          : parentBackground;
      const ratio = contrast(foreground, renderedBackground);

      return {
        selector,
        found: true,
        text: style.color,
        background: style.backgroundColor,
        renderedBackground: `rgb(${Math.round(renderedBackground[0])}, ${Math.round(renderedBackground[1])}, ${Math.round(renderedBackground[2])})`,
        ratio,
        pass: ratio >= contrastFloor,
      };
    }

    const requiredSelectorResults = selectors.map((selector) => {
      const alternatives = selector.split("|").map((value) => value.trim()).filter(Boolean);
      const matchedSelector = alternatives.find((alternative) => document.querySelector(alternative));
      return {
        selector,
        alternatives,
        matchedSelector: matchedSelector ?? null,
        found: Boolean(matchedSelector),
      };
    });
    const recommendedSelectorResults = recommendedSelectors.map((selector) => ({
      selector,
      found: Boolean(document.querySelector(selector)),
    }));
    const contrastSamples = Object.fromEntries(
      Object.entries(samples).map(([name, selector]) => [name, sample(selector)]),
    );
    const navToggle = document.querySelector("[data-nav-toggle][aria-controls][aria-expanded]");
    const stylesheetHrefs = Array.from(document.querySelectorAll('link[rel~="stylesheet"][href]'))
      .map((element) => element.getAttribute("href") ?? "");
    const scriptSrcs = Array.from(document.querySelectorAll("script[src]"))
      .map((element) => element.getAttribute("src") ?? "");
    const hasComponentCss = stylesheetHrefs.some((href) => /(^|\/)css\/[^/]*components\.css$/.test(href) || /(^|\/)components\.css$/.test(href));
    const hasComponentJs = scriptSrcs.some((src) => /(^|\/)js\/[^/]*components\.js$/.test(src) || /(^|\/)components\.js$/.test(src));
    const apiSmoke = {
      reusableFilesLinked: hasComponentCss && hasComponentJs,
      stylesheetHrefs,
      scriptSrcs,
      navToggle: Boolean(navToggle),
      navApiReady: !navToggle || navToggle.getAttribute("aria-expanded") === "false",
      componentClasses: requiredSelectorResults.every((item) => item.found),
    };

    return {
      requiredSelectors: requiredSelectorResults,
      recommendedSelectors: recommendedSelectorResults,
      contrastSamples,
      apiSmoke,
      pass: apiSmoke.reusableFilesLinked
        && apiSmoke.navApiReady
        && apiSmoke.componentClasses
        && Object.values(contrastSamples).every((item) => item.pass),
    };
  }, {
    selectors: requiredSelectors,
    recommendedSelectors: DEFAULT_RECOMMENDED_SELECTORS,
    samples: DEFAULT_CONTRAST_SAMPLES,
    contrastFloor: minContrast,
    allowMissing: allowMissingContrast,
  });
} finally {
  if (browser) {
    await browser.close();
  }
}

const output = {
  target: targetArg,
  targetUrl,
  minContrast,
  allowMissingContrast,
  ...result,
};

if (jsonPath) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
}

console.log(JSON.stringify(output, null, 2));

if (!output.pass) {
  process.exit(1);
}

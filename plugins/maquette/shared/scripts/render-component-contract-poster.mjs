#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function usage() {
  console.error([
    "Usage: node render-component-contract-poster.mjs <contract.json> <poster.svg> [options]",
    "",
    "Options:",
    "  --width <px>       SVG width, default 1400",
    "  --height <px>      SVG height, default 1400",
  ].join("\n"));
}

if (args.includes("--help") || args.includes("-h") || args.length < 2) {
  usage();
  process.exit(args.length < 2 ? 1 : 0);
}

const inputPath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);
let width = 1400;
let height = 1400;

for (let index = 2; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--width") {
    width = Number(args[++index]);
  } else if (arg === "--height") {
    height = Number(args[++index]);
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(1);
  }
}

if (!Number.isFinite(width) || !Number.isFinite(height) || width < 400 || height < 400) {
  console.error("Width and height must be numbers >= 400.");
  process.exit(1);
}

const contract = JSON.parse(fs.readFileSync(inputPath, "utf8"));

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function wrapLine(line, maxChars) {
  const chunks = [];
  let rest = String(line);
  while (rest.length > maxChars) {
    let breakAt = rest.lastIndexOf(" ", maxChars);
    if (breakAt < maxChars * 0.5) breakAt = maxChars;
    chunks.push(rest.slice(0, breakAt));
    rest = rest.slice(breakAt).trimStart();
  }
  chunks.push(rest);
  return chunks;
}

function pushWrapped(lines, value, maxChars = 82) {
  for (const line of String(value).split("\n")) {
    lines.push(...wrapLine(line, maxChars));
  }
}

const textLines = [];
const title = contract.meta?.contract_name ?? "Maquette Component Contract";
const batchSlug = contract.batch?.slug ?? "component-batch";
textLines.push(`${title}`);
textLines.push(`batch: ${batchSlug} | category: ${contract.batch?.category ?? "unknown"} | status: ${contract.meta?.status ?? "draft"}`);
textLines.push("");
textLines.push("selector allowlist:");
for (const selector of contract.batch?.selector_allowlist ?? []) {
  textLines.push(`  ${selector}`);
}
textLines.push("");
textLines.push("selectors:");
for (const selector of contract.selectors ?? []) {
  textLines.push(`${selector.selector} /* ${selector.role ?? "component"} */ {`);
  for (const rule of selector.rules ?? []) {
    textLines.push(`  ${rule.property}: ${rule.value};`);
  }
  if (selector.slots?.length) {
    textLines.push(`  /* slots: ${selector.slots.join(", ")} */`);
  }
  textLines.push("}");
  textLines.push("");
}
if (contract.states?.length) {
  textLines.push("states:");
  for (const state of contract.states) {
    textLines.push(`${state.selector} /* ${state.state} */ {`);
    for (const rule of state.rules ?? []) {
      textLines.push(`  ${rule.property}: ${rule.value};`);
    }
    textLines.push("}");
  }
  textLines.push("");
}
if (contract.accessibility?.length) {
  textLines.push("accessibility:");
  for (const note of contract.accessibility) {
    pushWrapped(textLines, `- ${note}`);
  }
  textLines.push("");
}
if (contract.responsive?.length) {
  textLines.push("responsive:");
  for (const note of contract.responsive) {
    pushWrapped(textLines, `- ${note}`);
  }
  textLines.push("");
}
if (contract.implementation_notes?.length) {
  textLines.push("implementation notes:");
  for (const note of contract.implementation_notes) {
    pushWrapped(textLines, `- ${note}`);
  }
}

const margin = 52;
const fontSize = Math.max(10, Math.min(23, Math.floor((height - margin * 2) / Math.max(textLines.length, 1) / 1.42)));
const lineHeight = Math.round(fontSize * 1.42);
const maxVisibleLines = Math.floor((height - margin * 2) / lineHeight);
const visibleLines = textLines.slice(0, maxVisibleLines);
if (textLines.length > visibleLines.length) {
  visibleLines[visibleLines.length - 1] = `... ${textLines.length - visibleLines.length + 1} lines omitted; use the JSON contract as authority`;
}

const textNodes = visibleLines.map((line, index) => {
  const y = margin + index * lineHeight;
  const fill = index === 0 ? "#F9FAFB" : line.endsWith("{") || line === "selectors:" || line === "states:" ? "#B9FBC0" : "#E5E7EB";
  const weight = index === 0 ? "700" : "500";
  return `<text x="${margin}" y="${y}" fill="${fill}" font-weight="${weight}">${escapeXml(line)}</text>`;
}).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <rect width="100%" height="100%" fill="#05070A"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="28" fill="#0A0F16" stroke="#263241"/>
  <g font-family="JetBrains Mono, ui-monospace, SFMono-Regular, Consolas, monospace" font-size="${fontSize}">
${textNodes}
  </g>
</svg>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, svg);
console.log(JSON.stringify({
  inputPath,
  outputPath,
  width,
  height,
  totalLines: textLines.length,
  visibleLines: visibleLines.length,
  truncated: textLines.length > visibleLines.length,
}, null, 2));

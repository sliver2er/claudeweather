#!/usr/bin/env node

import { renderClaudeWeatherScreen } from "./index.js";

async function readStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main() {
  const raw = await readStdin();

  try {
    const input = raw ? JSON.parse(raw) : {};
    const result = renderClaudeWeatherScreen(input);
    process.stdout.write(`${result.lines.join("\n")}\n`);
  } catch {
    const fallback = renderClaudeWeatherScreen({});
    process.stdout.write(`${fallback.lines.join("\n")}\n`);
  }
}

main();

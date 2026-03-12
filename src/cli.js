#!/usr/bin/env node

import { generateWelcomeScreen } from "./index.js";

async function readStdin() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main() {
  const raw = await readStdin();

  if (!raw) {
    process.stdout.write(
      `${JSON.stringify(generateWelcomeScreen({}), null, 2)}\n`
    );
    return;
  }

  try {
    const input = JSON.parse(raw);
    process.stdout.write(
      `${JSON.stringify(generateWelcomeScreen(input), null, 2)}\n`
    );
  } catch {
    process.stdout.write(
      `${JSON.stringify(generateWelcomeScreen({}), null, 2)}\n`
    );
  }
}

main();

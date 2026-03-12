#!/usr/bin/env node

import childProcess from "node:child_process";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { renderClaudeWeatherScreen } from "./index.js";
import {
  doctorIntegration,
  installIntegration,
  loadConfig,
  resolveIntegrationPaths,
  uninstallIntegration
} from "./integration.js";

function printHelp() {
  process.stdout.write(
    [
      "claudeweather",
      "",
      "Usage:",
      "  claudeweather preview [--config <path>]",
      "  claudeweather install [--shell zsh|bash] [--rc-file <path>]",
      "  claudeweather uninstall [--shell zsh|bash] [--rc-file <path>] [--purge]",
      "  claudeweather doctor [--shell zsh|bash] [--rc-file <path>]",
      ""
    ].join("\n")
  );
}

function hasClaudeCommand() {
  const result = childProcess.spawnSync("bash", ["-lc", "command -v claude"], {
    stdio: "ignore"
  });

  return result.status === 0;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0]?.startsWith("--") ? "preview" : args[0] ?? "preview";
  const options = {};

  for (let index = command === "preview" && args[0]?.startsWith("--") ? 0 : 1; index < args.length; index += 1) {
    const token = args[index];

    if (token === "--config" || token === "--shell" || token === "--rc-file") {
      options[token.slice(2).replace("-", "")] = args[index + 1];
      index += 1;
      continue;
    }

    if (token === "--purge" || token === "--force") {
      options[token.slice(2)] = true;
    }
  }

  return { command, options };
}

async function readStdin() {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8").trim();
}

async function loadPreviewInput(options) {
  const paths = resolveIntegrationPaths({
    shell: options.shell,
    rcPath: options.rcfile
  });
  const configPath = options.config ?? paths.configPath;
  let baseConfig = {};

  try {
    await fs.access(configPath);
    baseConfig = await loadConfig(configPath);
  } catch {
    baseConfig = {};
  }

  const stdin = await readStdin();

  if (!stdin) {
    return baseConfig;
  }

  const parsedStdin = JSON.parse(stdin);

  return {
    ...baseConfig,
    ...parsedStdin,
    weather: {
      ...(baseConfig.weather ?? {}),
      ...(parsedStdin.weather ?? {})
    },
    panel: {
      ...(baseConfig.panel ?? {}),
      ...(parsedStdin.panel ?? {})
    }
  };
}

async function runPreview(options) {
  const input = await loadPreviewInput(options);
  const result = renderClaudeWeatherScreen(input);

  process.stdout.write(`${result.lines.join("\n")}\n`);
}

async function runInstall(options) {
  const result = await installIntegration({
    shell: options.shell,
    rcPath: options.rcfile,
    cliPath: fileURLToPath(import.meta.url),
    nodePath: process.execPath,
    force: options.force
  });

  process.stdout.write(
    [
      `Installed claudeweather for ${result.shell}.`,
      `Config: ${result.configPath}`,
      `Shell hook: ${result.hookPath}`,
      `RC file: ${result.rcPath}`,
      "Reload the shell or run: source " + result.rcPath
    ].join("\n") + "\n"
  );
}

async function runUninstall(options) {
  const result = await uninstallIntegration({
    shell: options.shell,
    rcPath: options.rcfile,
    purge: options.purge
  });

  process.stdout.write(
    [
      `Removed claudeweather shell integration for ${result.shell}.`,
      `RC file: ${result.rcPath}`,
      options.purge ? `Purged: ${result.configDir}` : `Preserved config: ${result.configPath}`
    ].join("\n") + "\n"
  );
}

async function runDoctor(options) {
  const status = await doctorIntegration({
    shell: options.shell,
    rcPath: options.rcfile
  });
  const claudeAvailable = hasClaudeCommand();

  process.stdout.write(
    [
      `Shell: ${status.shell}`,
      `Config file: ${status.configExists ? "present" : "missing"} (${status.paths.configPath})`,
      `Shell hook: ${status.hookExists ? "present" : "missing"} (${status.paths.hookPath})`,
      `RC block: ${status.rcHasBlock ? "installed" : "missing"} (${status.paths.rcPath})`,
      `Claude in PATH: ${claudeAvailable ? "yes" : "no"}`
    ].join("\n") + "\n"
  );
}

async function main() {
  const { command, options } = parseArgs(process.argv);

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "preview") {
    await runPreview(options);
    return;
  }

  if (command === "install") {
    await runInstall(options);
    return;
  }

  if (command === "uninstall") {
    await runUninstall(options);
    return;
  }

  if (command === "doctor") {
    await runDoctor(options);
    return;
  }

  printHelp();
  process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});

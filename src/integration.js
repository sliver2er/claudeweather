import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const MANAGED_BLOCK_START = "# >>> claudeweather >>>";
const MANAGED_BLOCK_END = "# <<< claudeweather <<<";

export function detectShell(shellPath = process.env.SHELL ?? "") {
  const shellName = path.basename(shellPath);

  if (shellName === "zsh") {
    return "zsh";
  }

  return "bash";
}

export function resolveIntegrationPaths(options = {}) {
  const homeDir = options.homeDir ?? os.homedir();
  const shell = options.shell ?? detectShell(options.shellPath);
  const configDir = path.join(homeDir, ".claudeweather");
  const configPath = path.join(configDir, "config.json");
  const hookPath = path.join(configDir, "claude-shell.sh");
  const rcPath =
    options.rcPath ??
    path.join(homeDir, shell === "zsh" ? ".zshrc" : ".bashrc");

  return {
    homeDir,
    shell,
    configDir,
    configPath,
    hookPath,
    rcPath
  };
}

export function createDefaultConfig() {
  return {
    width: 95,
    height: 17,
    seed: 7,
    weather: {
      condition: "clouds",
      is_daytime: true
    },
    panel: {
      title: "Claude Code v2.1.73",
      welcome: "Welcome back!",
      tipTitle: "Tips for getting started",
      tipBody: "Run /init to create a CLAUDE.md",
      recentTitle: "Recent activity",
      recentBody: "No recent activity",
      modelLine: "Sonnet 4.6 · Claude Pro · account",
      orgLine: "Organization",
      cwd: "~/"
    }
  };
}

export function isEphemeralInstall(cliPath) {
  return /([/\\]_npx[/\\])|([/\\]pnpm[/\\]dlx[/\\])/.test(cliPath);
}

export function buildShellHook({ nodePath, cliPath, configPath }) {
  return [
    "#!/usr/bin/env bash",
    "",
    "claude() {",
    `  "${nodePath}" "${cliPath}" preview --config "${configPath}"`,
    "  command claude \"$@\"",
    "}"
  ].join("\n");
}

export function buildManagedBlock(hookPath) {
  return [
    MANAGED_BLOCK_START,
    `[ -f "${hookPath}" ] && . "${hookPath}"`,
    MANAGED_BLOCK_END
  ].join("\n");
}

export function upsertManagedBlock(content, block) {
  const trimmed = content.trimEnd();
  const nextContent = removeManagedBlock(trimmed);

  if (!nextContent) {
    return `${block}\n`;
  }

  return `${nextContent}\n\n${block}\n`;
}

export function removeManagedBlock(content) {
  return content
    .replace(
      new RegExp(
        `${escapeForRegExp(MANAGED_BLOCK_START)}[\\s\\S]*?${escapeForRegExp(
          MANAGED_BLOCK_END
        )}\\n?`,
        "g"
      ),
      ""
    )
    .trimEnd();
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readTextIfPresent(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function installIntegration(options = {}) {
  const paths = resolveIntegrationPaths(options);
  const nodePath = options.nodePath ?? process.execPath;
  const cliPath = path.resolve(options.cliPath ?? process.argv[1]);

  if (isEphemeralInstall(cliPath) && !options.force) {
    throw new Error(
      "Install requires a stable package path. Use npm install -g claudeweather first."
    );
  }

  await fs.mkdir(paths.configDir, { recursive: true });

  const configExists = await exists(paths.configPath);
  if (!configExists) {
    await fs.writeFile(
      paths.configPath,
      `${JSON.stringify(createDefaultConfig(), null, 2)}\n`,
      "utf8"
    );
  }

  await fs.writeFile(
    paths.hookPath,
    `${buildShellHook({
      nodePath,
      cliPath,
      configPath: paths.configPath
    })}\n`,
    "utf8"
  );

  const rcContent = await readTextIfPresent(paths.rcPath);
  await fs.writeFile(
    paths.rcPath,
    upsertManagedBlock(rcContent, buildManagedBlock(paths.hookPath)),
    "utf8"
  );

  return {
    ...paths,
    configCreated: !configExists
  };
}

export async function uninstallIntegration(options = {}) {
  const paths = resolveIntegrationPaths(options);
  const rcContent = await readTextIfPresent(paths.rcPath);

  await fs.writeFile(paths.rcPath, `${removeManagedBlock(rcContent)}\n`, "utf8");

  try {
    await fs.unlink(paths.hookPath);
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw error;
    }
  }

  if (options.purge) {
    await fs.rm(paths.configDir, { recursive: true, force: true });
  }

  return paths;
}

export async function loadConfig(configPath) {
  const raw = await readTextIfPresent(configPath);

  if (!raw.trim()) {
    return createDefaultConfig();
  }

  return JSON.parse(raw);
}

export async function doctorIntegration(options = {}) {
  const paths = resolveIntegrationPaths(options);
  const rcContent = await readTextIfPresent(paths.rcPath);
  const configExists = await exists(paths.configPath);
  const hookExists = await exists(paths.hookPath);
  const rcHasBlock =
    rcContent.includes(MANAGED_BLOCK_START) && rcContent.includes(MANAGED_BLOCK_END);

  return {
    shell: paths.shell,
    paths,
    configExists,
    hookExists,
    rcHasBlock
  };
}

export { MANAGED_BLOCK_END, MANAGED_BLOCK_START };

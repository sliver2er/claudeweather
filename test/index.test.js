import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  createWeatherBackdrop,
  mapSkyLabel,
  renderClaudeWeatherScreen
} from "../src/index.js";
import {
  doctorIntegration,
  installIntegration,
  isEphemeralInstall,
  uninstallIntegration
} from "../src/integration.js";

test("sky label mapping still follows weather categories", () => {
  assert.equal(mapSkyLabel("thunderstorm", true), "stormy");
  assert.equal(mapSkyLabel("snow", false), "snowy");
  assert.equal(mapSkyLabel("mist", true), "foggy");
  assert.equal(mapSkyLabel("clouds", false), "cloudy");
});

test("backdrop renderer respects requested dimensions", () => {
  const result = createWeatherBackdrop({
    weather: { condition: "rain", is_daytime: true },
    width: 64,
    height: 18,
    seed: 7
  });

  assert.equal(result.lines.length, 18);
  assert.ok(result.lines.every((line) => line.length === 64));
  assert.equal(result.skyLabel, "rainy");
});

test("scene renderer overlays a Claude-style panel", () => {
  const result = renderClaudeWeatherScreen({
    weather: { condition: "clouds", is_daytime: true },
    width: 80,
    height: 17,
    seed: 11,
    panel: {
      title: "Claude Code v2.1.73",
      welcome: "Welcome back Seunghyun!",
      cwd: "~/Documents/etl_sync"
    }
  });

  const screen = result.lines.join("\n");

  assert.match(screen, /Claude Code v2\.1\.73/);
  assert.match(screen, /Welcome back Seunghyun!/);
  assert.match(screen, /~\/Documents\/etl_sync/);
});

test("same seed produces stable output", () => {
  const first = renderClaudeWeatherScreen({
    weather: { condition: "snow", is_daytime: false },
    width: 72,
    height: 15,
    seed: 3
  });

  const second = renderClaudeWeatherScreen({
    weather: { condition: "snow", is_daytime: false },
    width: 72,
    height: 15,
    seed: 3
  });

  assert.deepEqual(first, second);
});

test("different weather modes produce visibly different backgrounds", () => {
  const rainy = createWeatherBackdrop({
    weather: { condition: "rain", is_daytime: true },
    width: 60,
    height: 14,
    seed: 5
  });

  const sunny = createWeatherBackdrop({
    weather: { condition: "clear", is_daytime: true },
    width: 60,
    height: 14,
    seed: 5
  });

  assert.notDeepEqual(rainy.lines, sunny.lines);
});

test("install writes config, hook, and rc block into the chosen home", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "claudeweather-test-"));
  const rcPath = path.join(homeDir, ".zshrc");

  await fs.writeFile(rcPath, "export PATH=\"$HOME/bin:$PATH\"\n", "utf8");

  const result = await installIntegration({
    homeDir,
    shell: "zsh",
    rcPath,
    nodePath: "/usr/local/bin/node",
    cliPath: "/usr/local/lib/node_modules/claudeweather/src/cli.js"
  });

  const rcContent = await fs.readFile(rcPath, "utf8");
  const hookContent = await fs.readFile(result.hookPath, "utf8");
  const configRaw = await fs.readFile(result.configPath, "utf8");

  assert.equal(result.configCreated, true);
  assert.match(rcContent, /# >>> claudeweather >>>/);
  assert.match(rcContent, /claude-shell\.sh/);
  assert.match(hookContent, /preview --config/);
  assert.doesNotThrow(() => JSON.parse(configRaw));
});

test("uninstall removes rc block and hook while preserving config by default", async () => {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), "claudeweather-test-"));
  const rcPath = path.join(homeDir, ".bashrc");

  await installIntegration({
    homeDir,
    shell: "bash",
    rcPath,
    nodePath: "/usr/local/bin/node",
    cliPath: "/usr/local/lib/node_modules/claudeweather/src/cli.js"
  });

  const statusBefore = await doctorIntegration({ homeDir, shell: "bash", rcPath });
  assert.equal(statusBefore.rcHasBlock, true);

  const result = await uninstallIntegration({
    homeDir,
    shell: "bash",
    rcPath
  });

  const rcContent = await fs.readFile(result.rcPath, "utf8");
  const statusAfter = await doctorIntegration({ homeDir, shell: "bash", rcPath });

  assert.equal(statusAfter.rcHasBlock, false);
  assert.equal(statusAfter.configExists, true);
  assert.equal(statusAfter.hookExists, false);
  assert.doesNotMatch(rcContent, /# >>> claudeweather >>>/);
});

test("install rejects ephemeral npx-style paths by default", async () => {
  await assert.rejects(
    () =>
      installIntegration({
        homeDir: "/tmp/claudeweather-test",
        shell: "zsh",
        cliPath: "/Users/me/Library/Caches/pnpm/dlx/1234/node_modules/claudeweather/src/cli.js"
      }),
    /stable package path/
  );

  assert.equal(isEphemeralInstall("/tmp/x/_npx/1234/cli.js"), true);
});

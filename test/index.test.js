import test from "node:test";
import assert from "node:assert/strict";

import {
  createWeatherBackdrop,
  mapSkyLabel,
  renderClaudeWeatherScreen
} from "../src/index.js";

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

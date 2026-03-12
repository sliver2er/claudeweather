import test from "node:test";
import assert from "node:assert/strict";

import {
  FALLBACK_LINE,
  generateWelcomeScreen,
  mapSkyLabel
} from "../src/index.js";

test("daytime clouds with city renders calm English lines", () => {
  const result = generateWelcomeScreen({
    current_city: "Seoul",
    weather: {
      temp_c: 23,
      feels_like_c: 25,
      humidity: 58,
      condition: "clouds",
      is_daytime: true
    }
  });

  assert.equal(result.lines.length, 3);
  assert.equal(result.lines[0], "Seoul, Partly cloudy daylight.");
  assert.equal(result.lines[1], "Temp 23°C, Feels like 25°C, Humidity 58%.");
  assert.equal(result.lines[2], "A calm pace under a moving sky.");
});

test("invalid numeric values are omitted", () => {
  const result = generateWelcomeScreen({
    current_city: "Busan",
    weather: {
      temp_c: 82,
      feels_like_c: NaN,
      humidity: 44,
      condition: "clear",
      is_daytime: false
    }
  });

  assert.equal(result.lines[0], "Busan, Clear night air.");
  assert.equal(result.lines[1], "Humidity 44%.");
  assert.equal(result.lines[2], "Light air, steady focus.");
});

test("fully unusable weather falls back to a single line", () => {
  const result = generateWelcomeScreen({
    current_city: "Seoul",
    weather: {
      temp_c: 200,
      feels_like_c: null,
      humidity: -10,
      condition: "",
      is_daytime: true
    }
  });

  assert.deepEqual(result, { lines: [FALLBACK_LINE] });
});

test("sky label mapping follows weather categories", () => {
  assert.equal(mapSkyLabel("thunderstorm", true), "stormy");
  assert.equal(mapSkyLabel("snow", false), "snowy");
  assert.equal(mapSkyLabel("mist", true), "foggy");
  assert.equal(mapSkyLabel("clouds", false), "cloudy");
});

test("output never exceeds six lines", () => {
  const result = generateWelcomeScreen({
    current_city: "Incheon",
    weather: {
      temp_c: 18,
      feels_like_c: 17,
      humidity: 61,
      condition: "rain",
      is_daytime: true
    }
  });

  assert.ok(result.lines.length <= 6);
});

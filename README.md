[한국어 README](./README-ko.md)

# claudeweather

[![CI](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml/badge.svg)](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f172a.svg)](./LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-2f855a.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f59e0b.svg)](https://pnpm.io/)

A small Node.js helper that turns current weather data into calm, terminal-friendly welcome lines.

## Demo

Demo slot is ready. Drop a terminal capture at `assets/demo.gif` and replace the placeholder reference below when recording is available.

![claudeweather demo placeholder](./assets/demo-placeholder.svg)

## Features

- Accepts JSON input and returns `{ "lines": string[] }`
- Produces short, calm English copy
- Validates temperature, feels-like temperature, and humidity
- Enforces the 6-line maximum
- Uses only built-in Node.js features
- Ships with a CLI and a small programmatic API

## Quick Start

```bash
pnpm install
printf '%s' '{"current_city":"Seoul","weather":{"temp_c":23,"feels_like_c":25,"humidity":58,"condition":"clouds","is_daytime":true}}' | pnpm start
```

Expected output:

```json
{
  "lines": [
    "Seoul, Partly cloudy daylight.",
    "Temp 23°C, Feels like 25°C, Humidity 58%.",
    "A calm pace under a moving sky."
  ]
}
```

## Usage

Pass JSON through standard input and receive JSON on standard output.

```bash
echo '{"current_city":"Seoul","weather":{"temp_c":23,"feels_like_c":25,"humidity":58,"condition":"clouds","is_daytime":true}}' | node src/cli.js
```

You can also use the generator directly.

```js
import { generateWelcomeScreen } from "./src/index.js";

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
```

## Input Shape

```ts
{
  current_city: string | null,
  weather: {
    temp_c: number,
    feels_like_c: number,
    humidity: number,
    condition: string,
    is_daytime: boolean
  }
}
```

## Publish

This package is configured for public npm publishing.

```bash
pnpm publish --access public
```

## Development

```bash
pnpm test
```

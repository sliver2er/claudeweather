![claudeweather demo placeholder](./assets/demo-placeholder.svg)

[English](./README.md) | [简体中文](./README-zh-CN.md) | [繁體中文](./README-zh-TW.md) | [日本語](./README-ja.md) | [한국어](./README-ko.md) | [Français](./README-fr.md) | [Русский](./README-ru.md) | [Español](./README-es.md) | [العربية](./README-ar.md)

# claudeweather

[![CI](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml/badge.svg)](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f172a.svg)](./LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-2f855a.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f59e0b.svg)](https://pnpm.io/)

A small Node.js renderer for adding weather motion and atmosphere behind a Claude Code-style terminal welcome panel.

## Demo

The top slot is reserved for the final demo capture. Replace `assets/demo-placeholder.svg` with `assets/demo.gif` when the terminal recording is ready.

## What It Does

- Renders a deterministic text-mode weather backdrop
- Composes a centered Claude Code-style panel over the background
- Supports rainy, snowy, foggy, cloudy, stormy, sunny, and fallback moods
- Works as a CLI preview and as a small programmatic renderer
- Uses only built-in Node.js features

## Positioning

The goal of this project is not to patch Claude Code internals directly.
It renders a terminal scene that can be used in:

- a wrapper around `claude`
- a forked TUI screen
- a startup preview layer before handing control to the main app

## Quick Start

```bash
pnpm install
printf '%s' '{"weather":{"condition":"rain","is_daytime":true},"width":95,"height":17,"seed":7,"panel":{"title":"Claude Code v2.1.73","welcome":"Welcome back Seunghyun!","cwd":"~/Documents/etl_sync"}}' | pnpm start
```

This prints a text-mode screen preview directly to stdout.

## CLI Input

```bash
echo '{"weather":{"condition":"snow","is_daytime":false},"seed":3}' | node src/cli.js
```

## Programmatic Usage

```js
import { renderClaudeWeatherScreen } from "./src/index.js";

const result = renderClaudeWeatherScreen({
  weather: {
    condition: "clouds",
    is_daytime: true
  },
  width: 95,
  height: 17,
  seed: 9,
  panel: {
    title: "Claude Code v2.1.73",
    welcome: "Welcome back Seunghyun!",
    cwd: "~/Documents/etl_sync"
  }
});

console.log(result.lines.join("\n"));
```

## Input Shape

```ts
{
  weather: {
    condition: string,
    is_daytime: boolean
  },
  width?: number,
  height?: number,
  seed?: number,
  panel?: {
    title?: string,
    welcome?: string,
    tipTitle?: string,
    tipBody?: string,
    recentTitle?: string,
    recentBody?: string,
    modelLine?: string,
    orgLine?: string,
    cwd?: string
  }
}
```

## Public API

- `mapSkyLabel(condition, isDaytime)`
- `createWeatherBackdrop(options)`
- `renderClaudeWeatherScreen(options)`

## Publish

This package is configured for public npm publishing.

```bash
pnpm publish --access public
```

## Development

```bash
pnpm test
```

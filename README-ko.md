![claudeweather demo placeholder](./assets/demo-placeholder.svg)

[English](./README.md) | [简体中文](./README-zh-CN.md) | [繁體中文](./README-zh-TW.md) | [日本語](./README-ja.md) | [한국어](./README-ko.md) | [Français](./README-fr.md) | [Русский](./README-ru.md) | [Español](./README-es.md) | [العربية](./README-ar.md)

# claudeweather

[![CI](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml/badge.svg)](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f172a.svg)](./LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-2f855a.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f59e0b.svg)](https://pnpm.io/)

Claude Code 스타일의 터미널 웰컴 패널 뒤에 날씨 분위기와 움직임을 깔아 주는 작은 Node.js 렌더러입니다.

## 데모

상단 슬롯은 최종 데모 영상 자리입니다. 터미널 녹화가 준비되면 `assets/demo-placeholder.svg` 대신 `assets/demo.gif`를 연결하면 됩니다.

## 하는 일

- 결정적인 시드 기반의 텍스트 날씨 배경을 렌더링합니다
- 중앙에 Claude Code 스타일 패널을 합성합니다
- 비, 눈, 안개, 흐림, 폭풍, 맑음, 기본 상태를 지원합니다
- CLI 프리뷰와 프로그래매틱 API 둘 다 제공합니다
- Node.js 기본 기능만 사용합니다

## 위치

이 프로젝트는 Claude Code 내부를 직접 패치하는 용도라기보다, 아래 같은 곳에 붙이기 위한 렌더러입니다.

- `claude` 래퍼 실행기
- 포크한 TUI 시작 화면
- 메인 앱으로 넘기기 전 프리뷰 레이어

## 빠른 시작

```bash
pnpm install
printf '%s' '{"weather":{"condition":"rain","is_daytime":true},"width":95,"height":17,"seed":7,"panel":{"title":"Claude Code v2.1.73","welcome":"Welcome back Seunghyun!","cwd":"~/Documents/etl_sync"}}' | pnpm start
```

이 명령은 텍스트 기반 화면 프리뷰를 그대로 stdout에 출력합니다.

## CLI 입력

```bash
echo '{"weather":{"condition":"snow","is_daytime":false},"seed":3}' | node src/cli.js
```

## 코드에서 사용

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

## 입력 형태

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

## 공개 API

- `mapSkyLabel(condition, isDaytime)`
- `createWeatherBackdrop(options)`
- `renderClaudeWeatherScreen(options)`

## 배포

이 패키지는 npm 공개 배포 기준으로 설정되어 있습니다.

```bash
pnpm publish --access public
```

## 개발

```bash
pnpm test
```

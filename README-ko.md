![claudeweather demo placeholder](./assets/demo-placeholder.svg)

[English](./README.md) | [한국어](./README-ko.md)

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

한 번만 미리보기:

```bash
npx claudeweather preview
```

지속 설치:

```bash
npm install -g claudeweather
claudeweather install
```

쉘을 다시 불러오면 `claude` 실행 전에 프리뷰가 먼저 뜨고, 그다음 실제 Claude Code 명령으로 넘어갑니다.

## 명령어

```bash
claudeweather preview
claudeweather install
claudeweather uninstall
claudeweather doctor
```

## 프리뷰 입력

`preview`는 `~/.claudeweather/config.json`이 있으면 먼저 읽습니다.
stdin JSON으로 일부 값을 덮어쓸 수도 있습니다.

```bash
printf '%s' '{"weather":{"condition":"rain","is_daytime":true},"seed":7,"panel":{"title":"Claude Code v2.1.73","welcome":"Welcome back Seunghyun!","cwd":"~/Documents/etl_sync"}}' | claudeweather preview
```

## 설치 흐름

`claudeweather install`은 아래를 만듭니다.

- `~/.claudeweather/config.json`
- `~/.claudeweather/claude-shell.sh`
- `~/.zshrc` 또는 `~/.bashrc` 안의 관리 블록

쉘 훅은 `claude`를 감싸서 날씨 프리뷰를 먼저 출력하고, 이어서 `command claude "$@"`로 실제 명령을 실행합니다.

## 상태 확인

```bash
claudeweather doctor
```

다음을 점검합니다.

- 설정 파일 존재 여부
- 쉘 훅 존재 여부
- rc 파일의 관리 블록 존재 여부
- 현재 `PATH`에 `claude`가 잡히는지 여부

## 제거

```bash
claudeweather uninstall
claudeweather uninstall --purge
```

`uninstall`은 쉘 통합 블록과 훅 파일을 제거합니다.
`--purge`는 `~/.claudeweather`까지 함께 삭제합니다.

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

## 개발

```bash
pnpm test
```

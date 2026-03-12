[English README](./README.md)

# claudeweather

[![CI](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml/badge.svg)](https://github.com/sliver2er/claudeweather/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f172a.svg)](./LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-2f855a.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f59e0b.svg)](https://pnpm.io/)

현재 날씨 데이터를 받아 터미널 상단에 어울리는 짧고 차분한 환영 문구로 바꿔 주는 작은 Node.js 헬퍼입니다.

## 데모

데모 영상 위치를 미리 잡아뒀습니다. 터미널 녹화가 준비되면 `assets/demo.gif`에 넣고 아래 플레이스홀더를 교체하면 됩니다.

![claudeweather demo placeholder](./assets/demo-placeholder.svg)

## 특징

- 입력 JSON을 받아 `{ "lines": string[] }` 형태로 반환
- 짧고 차분한 영어 문구 생성
- 온도, 체감온도, 습도의 유효성 검사
- 최대 6줄 제한
- 의존성 없이 Node.js 기본 기능만 사용
- CLI와 간단한 프로그래매틱 API 제공

## 빠른 시작

```bash
pnpm install
printf '%s' '{"current_city":"Seoul","weather":{"temp_c":23,"feels_like_c":25,"humidity":58,"condition":"clouds","is_daytime":true}}' | pnpm start
```

예상 출력:

```json
{
  "lines": [
    "Seoul, Partly cloudy daylight.",
    "Temp 23°C, Feels like 25°C, Humidity 58%.",
    "A calm pace under a moving sky."
  ]
}
```

## 사용법

표준입력으로 JSON을 넘기면 표준출력으로 결과 JSON을 반환합니다.

```bash
echo '{"current_city":"Seoul","weather":{"temp_c":23,"feels_like_c":25,"humidity":58,"condition":"clouds","is_daytime":true}}' | node src/cli.js
```

또는 함수로 직접 사용할 수 있습니다.

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

## 입력 형태

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

## 배포

이 패키지는 npm 공개 배포 기준으로 설정되어 있습니다.

```bash
pnpm publish --access public
```

## 개발

```bash
pnpm test
```

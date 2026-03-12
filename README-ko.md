[English README](./README.md)

# claudeweather

터미널 기반 개발 도구 상단에 표시할 짧은 날씨 환영 문구를 생성하는 작은 헬퍼입니다.

## 특징

- 입력 JSON을 받아 `{ "lines": string[] }` 형태로 반환
- 짧고 차분한 영어 문구 생성
- 온도, 체감온도, 습도의 유효성 검사
- 최대 6줄 제한
- 의존성 없이 Node.js 기본 기능만 사용

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

## 개발

```bash
pnpm test
```

[Korean README](./README-ko.md)

# claudeweather

A small helper that generates short weather-themed welcome lines for terminal-based developer tools.

## Features

- Accepts JSON input and returns `{ "lines": string[] }`
- Produces short, calm English copy
- Validates temperature, feels-like temperature, and humidity
- Enforces the 6-line maximum
- Uses only built-in Node.js features

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

## Development

```bash
pnpm test
```

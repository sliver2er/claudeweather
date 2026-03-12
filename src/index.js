const DEFAULT_WIDTH = 95;
const DEFAULT_HEIGHT = 17;
const MIN_WIDTH = 56;
const MIN_HEIGHT = 13;

const BACKGROUND_THEMES = {
  sunny: {
    base: " ",
    particles: [
      { char: ".", probability: 0.014 },
      { char: "·", probability: 0.018 },
      { char: "✦", probability: 0.0025 }
    ]
  },
  "partly cloudy": {
    base: " ",
    particles: [
      { char: ".", probability: 0.014 },
      { char: "·", probability: 0.02 },
      { char: "~", probability: 0.01 }
    ]
  },
  cloudy: {
    base: " ",
    particles: [
      { char: ".", probability: 0.012 },
      { char: "░", probability: 0.02 },
      { char: "~", probability: 0.01 }
    ]
  },
  rainy: {
    base: " ",
    particles: [
      { char: "╲", probability: 0.026 },
      { char: ".", probability: 0.015 },
      { char: "'", probability: 0.012 }
    ]
  },
  snowy: {
    base: " ",
    particles: [
      { char: "*", probability: 0.024 },
      { char: "·", probability: 0.02 },
      { char: "•", probability: 0.01 }
    ]
  },
  stormy: {
    base: " ",
    particles: [
      { char: "╲", probability: 0.024 },
      { char: "'", probability: 0.016 },
      { char: "⚡", probability: 0.002 }
    ]
  },
  foggy: {
    base: " ",
    particles: [
      { char: "░", probability: 0.05 },
      { char: "▒", probability: 0.014 },
      { char: ".", probability: 0.012 }
    ]
  },
  unknown: {
    base: " ",
    particles: [
      { char: ".", probability: 0.012 },
      { char: "·", probability: 0.01 }
    ]
  }
};

const CONDITION_RULES = [
  { label: "stormy", keywords: ["thunder", "lightning", "storm"] },
  { label: "snowy", keywords: ["snow", "sleet", "blizzard", "flurr"] },
  { label: "rainy", keywords: ["rain", "drizzle", "shower"] },
  { label: "foggy", keywords: ["mist", "fog", "haze", "smoke", "dust"] },
  { label: "cloudy", keywords: ["overcast"] },
  {
    label: "partly cloudy",
    keywords: ["cloud"],
    matches: (_condition, isDaytime) => isDaytime
  },
  {
    label: "cloudy",
    keywords: ["cloud"],
    matches: (_condition, isDaytime) => !isDaytime
  },
  { label: "sunny", keywords: ["clear", "sun"] }
];

function clampInteger(value, fallback, minimum) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(minimum, Math.floor(value));
}

function normalizeCondition(condition) {
  if (typeof condition !== "string") {
    return "";
  }

  return condition.trim().toLowerCase();
}

function includesAnyKeyword(condition, keywords) {
  return keywords.some((keyword) => condition.includes(keyword));
}

function createSeededRandom(seed = 1) {
  let state = (Math.abs(Math.trunc(seed)) || 1) >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createGrid(width, height, fill = " ") {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

function writeText(grid, x, y, text) {
  if (!grid[y]) {
    return;
  }

  for (let index = 0; index < text.length; index += 1) {
    const targetX = x + index;

    if (targetX < 0 || targetX >= grid[y].length) {
      continue;
    }

    grid[y][targetX] = text[index];
  }
}

function drawBox(grid, x, y, width, height, title) {
  const right = x + width - 1;
  const bottom = y + height - 1;
  const safeTitle = title ? ` ${title} ` : "";
  const topLine = `╭${"─".repeat(Math.max(0, width - 2))}╮`;
  const bottomLine = `╰${"─".repeat(Math.max(0, width - 2))}╯`;

  writeText(grid, x, y, topLine);
  writeText(grid, x, bottom, bottomLine);

  if (safeTitle && width > safeTitle.length + 4) {
    writeText(grid, x + 2, y, safeTitle);
  }

  for (let row = y + 1; row < bottom; row += 1) {
    if (!grid[row]) {
      continue;
    }

    grid[row][x] = "│";
    grid[row][right] = "│";
  }
}

function padLine(value, width, align = "left") {
  const text = String(value ?? "");

  if (text.length >= width) {
    return text.slice(0, width);
  }

  if (align === "center") {
    const left = Math.floor((width - text.length) / 2);
    const right = width - text.length - left;
    return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
  }

  return text.padEnd(width, " ");
}

function toColumnLine(left, right, leftWidth, rightWidth) {
  return `${padLine(left, leftWidth)} ${padLine(right, rightWidth)}`;
}

function buildClaudePanelContent(panel = {}, innerWidth) {
  const leftWidth = Math.max(28, Math.floor(innerWidth * 0.58));
  const rightWidth = Math.max(18, innerWidth - leftWidth - 1);
  const welcome = panel.welcome ?? "Welcome back!";
  const tipTitle = panel.tipTitle ?? "Tips for getting started";
  const tipBody = panel.tipBody ?? "Run /init to create a CLAUDE.md";
  const recentTitle = panel.recentTitle ?? "Recent activity";
  const recentBody = panel.recentBody ?? "No recent activity";
  const modelLine =
    panel.modelLine ?? "Sonnet 4.6 · Claude Pro · shpaul2001@gmail.com's";
  const orgLine = panel.orgLine ?? "Organization";
  const cwd = panel.cwd ?? "~/Documents/etl_sync";

  return [
    toColumnLine("", tipTitle, leftWidth, rightWidth),
    toColumnLine(padLine(welcome, leftWidth, "center"), tipBody, leftWidth, rightWidth),
    toColumnLine("", "────────────────────", leftWidth, rightWidth),
    toColumnLine(padLine("▐▛███▜▌", leftWidth, "center"), recentTitle, leftWidth, rightWidth),
    toColumnLine(padLine("▝▜█████▛▘", leftWidth, "center"), recentBody, leftWidth, rightWidth),
    toColumnLine(padLine("▘▘ ▝▝", leftWidth, "center"), "", leftWidth, rightWidth),
    padLine(modelLine, innerWidth),
    padLine(orgLine, innerWidth),
    padLine(cwd, innerWidth, "center")
  ];
}

function overlayPanel(grid, options = {}) {
  const width = grid[0].length;
  const height = grid.length;
  const panelWidth = Math.min(width - 4, options.width ?? width - 6);
  const panelHeight = Math.min(height - 2, options.height ?? 11);
  const panelX = Math.max(1, Math.floor((width - panelWidth) / 2));
  const panelY = Math.max(1, Math.floor((height - panelHeight) / 2));
  const title = options.title ?? "Claude Code Weather Preview";
  const innerWidth = panelWidth - 2;
  const innerHeight = panelHeight - 2;
  const contentLines = buildClaudePanelContent(options, innerWidth).slice(
    0,
    innerHeight
  );

  drawBox(grid, panelX, panelY, panelWidth, panelHeight, title);

  for (let index = 0; index < contentLines.length; index += 1) {
    writeText(grid, panelX + 1, panelY + 1 + index, contentLines[index]);
  }
}

function decorateBackground(grid, label, seed) {
  const width = grid[0].length;
  const height = grid.length;
  const theme = BACKGROUND_THEMES[label] ?? BACKGROUND_THEMES.unknown;
  const random = createSeededRandom(seed);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      grid[y][x] = theme.base;

      for (const particle of theme.particles) {
        if (random() < particle.probability) {
          grid[y][x] = particle.char;
          break;
        }
      }
    }
  }
}

export function mapSkyLabel(condition, isDaytime) {
  const normalized = normalizeCondition(condition);

  if (!normalized) {
    return "unknown";
  }

  const matchedRule = CONDITION_RULES.find((rule) => {
    const matchesKeywords = includesAnyKeyword(normalized, rule.keywords);
    const matchesPeriod = rule.matches?.(normalized, isDaytime) ?? true;

    return matchesKeywords && matchesPeriod;
  });

  return matchedRule?.label ?? "unknown";
}

export function createWeatherBackdrop(options = {}) {
  const weather = options.weather ?? {};
  const width = clampInteger(options.width, DEFAULT_WIDTH, MIN_WIDTH);
  const height = clampInteger(options.height, DEFAULT_HEIGHT, MIN_HEIGHT);
  const seed = clampInteger(options.seed, 1, 1);
  const isDaytime = weather?.is_daytime !== false;
  const label = mapSkyLabel(weather?.condition, isDaytime);
  const grid = createGrid(width, height);

  decorateBackground(grid, label, seed);

  return {
    skyLabel: label,
    lines: grid.map((line) => line.join(""))
  };
}

export function renderClaudeWeatherScreen(options = {}) {
  const weather = options.weather ?? {};
  const backdrop = createWeatherBackdrop(options);
  const grid = backdrop.lines.map((line) => [...line]);

  overlayPanel(grid, options.panel);

  return {
    skyLabel: backdrop.skyLabel,
    lines: grid.map((line) => line.join("")),
    meta: {
      width: clampInteger(options.width, DEFAULT_WIDTH, MIN_WIDTH),
      height: clampInteger(options.height, DEFAULT_HEIGHT, MIN_HEIGHT),
      condition: normalizeCondition(weather?.condition) || "unknown"
    }
  };
}

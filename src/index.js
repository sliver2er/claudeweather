const FALLBACK_LINE = "Quiet sky, weather details are still unavailable.";
const TEMPERATURE_RANGE = { min: -60, max: 60 };
const HUMIDITY_RANGE = { min: 0, max: 100 };
const DAY_PERIOD = "day";
const NIGHT_PERIOD = "night";

const SKY_SCENES = {
  sunny: {
    day: "Sunny daylight.",
    night: "Clear night air."
  },
  "partly cloudy": {
    day: "Partly cloudy daylight.",
    night: "Partly cloudy evening."
  },
  cloudy: {
    day: "Cloudy daylight.",
    night: "Cloudy evening."
  },
  rainy: {
    day: "Rainy daylight.",
    night: "Rainy evening."
  },
  snowy: {
    day: "Snowy daylight.",
    night: "Snowy evening."
  },
  stormy: {
    day: "Stormy daylight.",
    night: "Stormy evening."
  },
  foggy: {
    day: "Foggy daylight.",
    night: "Foggy evening."
  },
  unknown: {
    day: "Quiet sky.",
    night: "Quiet night sky."
  }
};

const MOOD_LINES = {
  sunny: "Light air, steady focus.",
  "partly cloudy": "A calm pace under a moving sky.",
  cloudy: "Soft light, settled air.",
  rainy: "Damp air, low rhythm.",
  snowy: "Cold air, quiet motion.",
  stormy: "Heavy sky, brief concentration.",
  foggy: "Muted edges, calm atmosphere.",
  unknown: "A quiet start beneath an open sky."
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

const STAT_FIELDS = [
  {
    value: (weather) => weather?.temp_c,
    isValid: isValidTemperature,
    format: (value) => formatTemperature("Temp", value)
  },
  {
    value: (weather) => weather?.feels_like_c,
    isValid: isValidTemperature,
    format: (value) => formatTemperature("Feels like", value)
  },
  {
    value: (weather) => weather?.humidity,
    isValid: isValidHumidity,
    format: (value) => `Humidity ${Math.round(value)}%`
  }
];

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidTemperature(value) {
  return (
    isFiniteNumber(value) &&
    value >= TEMPERATURE_RANGE.min &&
    value <= TEMPERATURE_RANGE.max
  );
}

function isValidHumidity(value) {
  return (
    isFiniteNumber(value) &&
    value >= HUMIDITY_RANGE.min &&
    value <= HUMIDITY_RANGE.max
  );
}

function formatTemperature(label, value) {
  return `${label} ${Math.round(value)}°C`;
}

function normalizeCity(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
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

function mapSkyLabel(condition, isDaytime) {
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

function getPeriod(isDaytime) {
  return isDaytime ? DAY_PERIOD : NIGHT_PERIOD;
}

function buildSkyLine(city, label, isDaytime) {
  const period = getPeriod(isDaytime);
  const scene = SKY_SCENES[label]?.[period] ?? SKY_SCENES.unknown[period];

  return city ? `${city}, ${scene}` : scene;
}

function collectStats(weather) {
  return STAT_FIELDS.flatMap((field) => {
    const value = field.value(weather);

    return field.isValid(value) ? [field.format(value)] : [];
  });
}

function buildStatsLine(weather) {
  const stats = collectStats(weather);

  if (stats.length === 0) {
    return null;
  }

  return `${stats.join(", ")}.`;
}

function hasUsableWeatherSignal(weather, skyLabel) {
  return (
    skyLabel !== "unknown" ||
    isValidTemperature(weather?.temp_c) ||
    isValidTemperature(weather?.feels_like_c) ||
    isValidHumidity(weather?.humidity)
  );
}

export function generateWelcomeScreen(input = {}) {
  const weather = input?.weather ?? {};
  const isDaytime = weather?.is_daytime !== false;
  const city = normalizeCity(input?.current_city);
  const skyLabel = mapSkyLabel(weather?.condition, isDaytime);

  if (!hasUsableWeatherSignal(weather, skyLabel)) {
    return { lines: [FALLBACK_LINE] };
  }

  const lines = [
    buildSkyLine(city, skyLabel, isDaytime),
    buildStatsLine(weather),
    MOOD_LINES[skyLabel] ?? MOOD_LINES.unknown
  ].filter(Boolean);

  return { lines: lines.slice(0, 6) };
}

export { FALLBACK_LINE, mapSkyLabel };

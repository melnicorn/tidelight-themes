/* ============================================================================
 * Tidelight Palette Demo (TypeScript)
 * - keywords, types, generics
 * - strings + template strings
 * - numbers, booleans, null
 * - functions, methods, parameters
 * - objects, arrays, properties
 * - regex, TODO/FIXME
 * ========================================================================== */

// TODO: Try swapping between Deep / Dusk / Fog / Dawn to compare contrast.
// FIXME: Confirm JSON key/value overrides in settings.json preview.

type HexColor = `#${string}`;
type ThemeMode = "dark" | "light";

interface ThemeMeta {
  name: string;
  version: `${number}.${number}.${number}`;
  author: "Slow Clap Software";
  mode: ThemeMode;
  accent: HexColor;
}

type TokenKind =
  | "keyword"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "function"
  | "type"
  | "property"
  | "comment"
  | "regex";

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error; meta?: { code: number; hint?: string } };

const meta: ThemeMeta = {
  name: "Tidelight",
  version: "1.0.0",
  author: "Slow Clap Software",
  mode: "dark",
  accent: "#22d3ee"
};

const palette = {
  cyan: "#22d3ee" as HexColor,
  sky: "#38bdf8" as HexColor,
  indigo: "#a5b4fc" as HexColor,
  green: "#34d399" as HexColor,
  amber: "#f59e0b" as HexColor,
  pink: "#f472b6" as HexColor,
  rose: "#fb7185" as HexColor
} as const;

const isHexColor = (value: string): value is HexColor => /^#[0-9a-f]{3,8}$/i.test(value);

function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

function formatTitle(name: string, mode: ThemeMode): string {
  return `${name} • ${mode.toUpperCase()}`;
}

function pickAccent(mode: ThemeMode): HexColor {
  return mode === "dark" ? palette.cyan : palette.sky;
}

function safeJsonParse<T>(input: string): Result<T> {
  try {
    return { ok: true, value: JSON.parse(input) as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err : new Error("Unknown parse error"),
      meta: { code: 400, hint: "Check trailing commas and quotes." }
    };
  }
}

class ThemeEngine {
  readonly name: string;
  readonly mode: ThemeMode;

  constructor(name: string, mode: ThemeMode) {
    this.name = name;
    this.mode = mode;
  }

  get accent(): HexColor {
    return pickAccent(this.mode);
  }

  describe(): string {
    const title = formatTitle(this.name, this.mode);
    return `${title} (accent: ${this.accent})`;
  }

  tokenize(source: string): Array<{ kind: TokenKind; value: string }> {
    const tokens: Array<{ kind: TokenKind; value: string }> = [];

    // super basic demo tokenizer
    const words = source.split(/\s+/g);
    for (const word of words) {
      if (/^(const|let|function|class|return|type|interface|extends)$/.test(word)) {
        tokens.push({ kind: "keyword", value: word });
      } else if (/^".*"$/.test(word) || /^'.*'$/.test(word) || /^`.*`$/.test(word)) {
        tokens.push({ kind: "string", value: word });
      } else if (/^\d+(\.\d+)?$/.test(word)) {
        tokens.push({ kind: "number", value: word });
      } else if (/^(true|false)$/.test(word)) {
        tokens.push({ kind: "boolean", value: word });
      } else if (word === "null") {
        tokens.push({ kind: "null", value: word });
      } else if (/^\/.*\/[gimsuy]*$/.test(word)) {
        tokens.push({ kind: "regex", value: word });
      } else {
        tokens.push({ kind: "property", value: word });
      }
    }

    return tokens;
  }
}

const engine = new ThemeEngine(meta.name, meta.mode);

const sample = `
const user = { name: "Ada", id: 42, active: true, lastLogin: null };
function greet(name: string) { return \`Hello, \${name}!\`; }
const email = "ada@example.com";
const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$/i;
`;

const tokens = engine.tokenize(sample);

const output = {
  meta,
  title: engine.describe(),
  accent: engine.accent,
  validAccent: isHexColor(engine.accent),
  counts: tokens.reduce<Record<TokenKind, number>>((acc, t) => {
    acc[t.kind] = (acc[t.kind] ?? 0) + 1;
    return acc;
  }, {} as Record<TokenKind, number>)
};

const parsed = safeJsonParse<typeof output>(JSON.stringify(output, null, 2));

if (!parsed.ok) {
  console.error(parsed.error.message);
} else {
  console.log(parsed.value.title);
}

// A little “kitchen sink” expression block:
const ratio = clamp(1.25, 0, 1);
const values = [0, 1, 2, 3, 4].map((n) => n * 2).filter((n) => n % 3 !== 0);

export { ThemeEngine, clamp, safeJsonParse, meta, palette, values, ratio };
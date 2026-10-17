
"use client";

import { useState } from "react";
import {
  Check,
  Clipboard,
  Copy,
  Palette,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(value: string): string | null {
  let hex = value.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split("").map((char) => char + char).join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;

  return `#${hex.toUpperCase()}`;
}

function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex)!;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }: RGB) {
  return (
    "#" +
    [r, g, b]
      .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === red) {
      h = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      h = 60 * ((blue - red) / delta + 2);
    } else {
      h = 60 * ((red - green) / delta + 4);
    }
  }

  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) [red, green, blue] = [chroma, x, 0];
  else if (hue < 120) [red, green, blue] = [x, chroma, 0];
  else if (hue < 180) [red, green, blue] = [0, chroma, x];
  else if (hue < 240) [red, green, blue] = [0, x, chroma];
  else if (hue < 300) [red, green, blue] = [x, 0, chroma];
  else [red, green, blue] = [chroma, 0, x];

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
  };
}

function formatRgb(rgb: RGB) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function formatHsl(hsl: HSL) {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

const INITIAL_HEX = "#2563EB";

export default function ColorConverter() {
  const [hexInput, setHexInput] = useState(INITIAL_HEX);
  const [rgbInput, setRgbInput] = useState("rgb(37, 99, 235)");
  const [hslInput, setHslInput] = useState("hsl(221, 83%, 53%)");
  const [hex, setHex] = useState(INITIAL_HEX);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const rgbValue = formatRgb(rgb);
  const hslValue = formatHsl(hsl);

  function updateFromHex(value: string) {
    setHexInput(value);
    setError("");
    setNotice("");

    const normalized = normalizeHex(value);
    if (!normalized) {
      setError("Enter a valid HEX color, such as #2563EB or #FFF.");
      return;
    }

    const nextRgb = hexToRgb(normalized);
    const nextHsl = rgbToHsl(nextRgb);

    setHex(normalized);
    setRgbInput(formatRgb(nextRgb));
    setHslInput(formatHsl(nextHsl));
  }

  function updateFromRgb(value: string) {
    setRgbInput(value);
    setError("");
    setNotice("");

    const match = value.trim().match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i
    );

    if (!match) {
      setError("Use RGB format such as rgb(37, 99, 235).");
      return;
    }

    const values = match.slice(1, 4).map(Number);

    if (values.some((value) => value < 0 || value > 255)) {
      setError("Each RGB channel must be between 0 and 255.");
      return;
    }

    const nextRgb = {
      r: values[0],
      g: values[1],
      b: values[2],
    };

    const nextHex = rgbToHex(nextRgb);

    setHex(nextHex);
    setHexInput(nextHex);
    setHslInput(formatHsl(rgbToHsl(nextRgb)));
  }

  function updateFromHsl(value: string) {
    setHslInput(value);
    setError("");
    setNotice("");

    const match = value.trim().match(
      /^hsla?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i
    );

    if (!match) {
      setError("Use HSL format such as hsl(221, 83%, 53%).");
      return;
    }

    const values = match.slice(1, 4).map(Number);
    const [h, s, l] = values;

    if (s < 0 || s > 100 || l < 0 || l > 100) {
      setError("HSL saturation and lightness must be between 0% and 100%.");
      return;
    }

    const nextRgb = hslToRgb({ h, s, l });
    const nextHex = rgbToHex(nextRgb);

    setHex(nextHex);
    setHexInput(nextHex);
    setRgbInput(formatRgb(nextRgb));
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
      setError("");
    } catch {
      setError("Clipboard access failed. Please copy the value manually.");
      setNotice("");
    }
  }

  function resetColor() {
    setHex(INITIAL_HEX);
    setHexInput(INITIAL_HEX);
    setRgbInput("rgb(37, 99, 235)");
    setHslInput("hsl(221, 83%, 53%)");
    setError("");
    setNotice("Color reset to the default.");
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-500">
            <Palette size={20} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Color Tools
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Color Converter
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Convert colors between HEX, RGB, and HSL with a live preview and
            one-click copying.
          </p>
        </div>

        <button
          type="button"
          onClick={resetColor}
          className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      {(error || notice) && (
        <div
          role={error ? "alert" : "status"}
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-500/30 bg-red-500/10 text-red-500"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div
            className="flex h-48 items-center justify-center border-b border-[var(--border)] p-6 transition-colors"
            style={{ backgroundColor: hex }}
          >
            <div className="rounded-xl bg-black/20 px-4 py-2 text-center text-white backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-widest">
                Live preview
              </p>
              <p className="mt-1 font-mono text-lg font-semibold">{hex}</p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Pick a color</span>
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3">
                <input
                  type="color"
                  aria-label="Choose a color"
                  value={hex}
                  onChange={(event) => updateFromHex(event.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-lg border-0 bg-transparent"
                />
                <div>
                  <p className="text-sm font-medium">Color picker</p>
                  <p className="text-xs text-[var(--muted)]">
                    Choose any color to update all formats.
                  </p>
                </div>
              </div>
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="hex-color" className="text-sm font-medium">
                  HEX
                </label>
                <button
                  type="button"
                  onClick={() => copyValue(hex, "HEX")}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                >
                  <Clipboard size={13} />
                  Copy
                </button>
              </div>
              <input
                id="hex-color"
                value={hexInput}
                onChange={(event) => updateFromHex(event.target.value)}
                placeholder="#2563EB"
                spellCheck={false}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">RGB</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Red, Green, Blue
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyValue(rgbValue, "RGB")}
                aria-label="Copy RGB value"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
            <input
              value={rgbInput}
              onChange={(event) => updateFromRgb(event.target.value)}
              spellCheck={false}
              aria-label="RGB color value"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Red", value: rgb.r },
                { label: "Green", value: rgb.g },
                { label: "Blue", value: rgb.b },
              ].map((channel) => (
                <div
                  key={channel.label}
                  className="rounded-lg bg-[var(--surface-muted)] p-3"
                >
                  <p className="text-xs text-[var(--muted)]">
                    {channel.label}
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">
                    {channel.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">HSL</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Hue, Saturation, Lightness
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyValue(hslValue, "HSL")}
                aria-label="Copy HSL value"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
            <input
              value={hslInput}
              onChange={(event) => updateFromHsl(event.target.value)}
              spellCheck={false}
              aria-label="HSL color value"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Hue", value: `${hsl.h}°` },
                { label: "Saturation", value: `${hsl.s}%` },
                { label: "Lightness", value: `${hsl.l}%` },
              ].map((channel) => (
                <div
                  key={channel.label}
                  className="rounded-lg bg-[var(--surface-muted)] p-3"
                >
                  <p className="text-xs text-[var(--muted)]">
                    {channel.label}
                  </p>
                  <p className="mt-1 font-mono text-lg font-semibold">
                    {channel.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            <Sparkles size={17} className="mt-0.5 shrink-0 text-blue-500" />
            <p>
              <span className="font-medium text-[var(--foreground)]">
                Tip:
              </span>{" "}
              Enter a HEX value such as #FF5733, an RGB value such as
              rgb(255, 87, 51), or an HSL value such as hsl(11, 100%, 60%).
              Valid input updates the other formats automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

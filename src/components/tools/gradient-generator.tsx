
"use client";

import { useState } from "react";
import {
  Check,
  Clipboard,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";
type GradientType = "linear" | "radial";

type ColorStop = {
  id: number;
  color: string;
  position: number;
};

const PRESETS = [
  {
    name: "Ocean",
    colors: ["#2563EB", "#06B6D4"],
    angle: 135,
  },
  {
    name: "Sunset",
    colors: ["#F97316", "#EC4899", "#8B5CF6"],
    angle: 135,
  },
  {
    name: "Forest",
    colors: ["#15803D", "#84CC16"],
    angle: 120,
  },
  {
    name: "Midnight",
    colors: ["#0F172A", "#4338CA"],
    angle: 135,
  },
  {
    name: "Candy",
    colors: ["#F472B6", "#C084FC", "#60A5FA"],
    angle: 90,
  },
];

export default function GradientGenerator() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: "#2563EB", position: 0 },
    { id: 2, color: "#06B6D4", position: 100 },
  ]);
  const [nextId, setNextId] = useState(3);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const sortedStops = [...stops].sort(
    (a, b) => a.position - b.position
  );

  const gradientValue =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${sortedStops
          .map((stop) => `${stop.color} ${stop.position}%`)
          .join(", ")})`
      : `radial-gradient(circle, ${sortedStops
          .map((stop) => `${stop.color} ${stop.position}%`)
          .join(", ")})`;

  const cssOutput = `background: ${gradientValue};`;

  function updateStop(
    id: number,
    field: "color" | "position",
    value: string | number
  ) {
    setStops((current) =>
      current.map((stop) =>
        stop.id === id
          ? {
              ...stop,
              [field]: field === "position"
                ? Math.min(100, Math.max(0, Number(value)))
                : value,
            }
          : stop
      )
    );
    setNotice("");
    setError("");
  }

  function addStop() {
    if (stops.length >= 6) {
      setError("You can add up to six color stops.");
      setNotice("");
      return;
    }

    setStops((current) => [
      ...current,
      {
        id: nextId,
        color: "#A855F7",
        position: 50,
      },
    ]);
    setNextId((current) => current + 1);
    setNotice("");
    setError("");
  }

  function removeStop(id: number) {
    if (stops.length <= 2) {
      setError("A gradient needs at least two color stops.");
      setNotice("");
      return;
    }

    setStops((current) => current.filter((stop) => stop.id !== id));
    setNotice("");
    setError("");
  }

  function loadPreset(preset: (typeof PRESETS)[number]) {
    setStops(
      preset.colors.map((color, index) => ({
        id: index + 1,
        color,
        position: Math.round(
          (index / (preset.colors.length - 1)) * 100
        ),
      }))
    );
    setNextId(preset.colors.length + 1);
    setAngle(preset.angle);
    setType("linear");
    setNotice(`${preset.name} preset loaded.`);
    setError("");
  }

  function resetGradient() {
    setType("linear");
    setAngle(135);
    setStops([
      { id: 1, color: "#2563EB", position: 0 },
      { id: 2, color: "#06B6D4", position: 100 },
    ]);
    setNextId(3);
    setNotice("Gradient reset.");
    setError("");
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssOutput);
      setNotice("CSS copied to clipboard.");
      setError("");
    } catch {
      setError("Clipboard access failed. Copy the CSS manually.");
      setNotice("");
    }
  }

  function downloadCss() {
    const blob = new Blob([cssOutput + "\n"], {
      type: "text/css;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "gradient.css";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("CSS file downloaded.");
    setError("");
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-500">
            <Sparkles size={20} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              CSS Tools
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            CSS Gradient Generator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Create beautiful CSS gradients, customize color stops, and
            copy the CSS directly into your project.
          </p>
        </div>

        <button
          type="button"
          onClick={resetGradient}
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

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div
              className="flex h-64 items-end justify-between p-5 sm:h-80"
              style={{ background: gradientValue }}
            >
              <span className="rounded-lg bg-black/30 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                Live preview
              </span>
              <span className="rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-white backdrop-blur-sm">
                {type === "linear" ? `${angle}°` : "Radial"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">Your gradient</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Preview updates as you change the settings.
                </p>
              </div>
              <button
                type="button"
                onClick={copyCss}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Copy size={15} />
                Copy CSS
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Presets</h2>
              <span className="text-xs text-[var(--muted)]">
                Quick starting points
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] text-left hover:border-blue-500"
                >
                  <span
                    className="block h-16 w-full"
                    style={{
                      background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})`,
                    }}
                  />
                  <span className="block px-3 py-2 text-xs font-medium">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-4 font-semibold">Gradient settings</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Gradient type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["linear", "radial"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setType(value);
                        setNotice("");
                        setError("");
                      }}
                      className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium capitalize ${
                        type === value
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-[var(--border)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {type === "linear" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="gradient-angle"
                      className="text-sm font-medium"
                    >
                      Direction
                    </label>
                    <span className="font-mono text-sm text-blue-500">
                      {angle}°
                    </span>
                  </div>
                  <input
                    id="gradient-angle"
                    type="range"
                    min={0}
                    max={360}
                    value={angle}
                    onChange={(event) => {
                      setAngle(Number(event.target.value));
                      setNotice("");
                    }}
                    className="w-full cursor-pointer accent-blue-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
                    <span>0°</span>
                    <span>180°</span>
                    <span>360°</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Color stops</h3>
                  <button
                    type="button"
                    onClick={addStop}
                    disabled={stops.length >= 6}
                    className="cursor-pointer rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + Add color
                  </button>
                </div>

                {sortedStops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="rounded-xl border border-[var(--border)] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[var(--muted)]">
                        Color {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStop(stop.id)}
                        disabled={stops.length <= 2}
                        className="cursor-pointer text-xs text-red-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        aria-label={`Color ${index + 1}`}
                        value={stop.color}
                        onChange={(event) =>
                          updateStop(stop.id, "color", event.target.value)
                        }
                        className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
                      />
                      <span className="min-w-0 flex-1 font-mono text-sm">
                        {stop.color.toUpperCase()}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {stop.position}%
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <label
                        htmlFor={`stop-position-${stop.id}`}
                        className="text-xs text-[var(--muted)]"
                      >
                        Position
                      </label>
                      <input
                        id={`stop-position-${stop.id}`}
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(event) =>
                          updateStop(
                            stop.id,
                            "position",
                            Number(event.target.value)
                          )
                        }
                        className="min-w-0 flex-1 cursor-pointer accent-blue-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.position}
                        aria-label={`Position for color ${index + 1}`}
                        onChange={(event) =>
                          updateStop(
                            stop.id,
                            "position",
                            event.target.value
                          )
                        }
                        className="w-16 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-right font-mono text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clipboard size={15} className="text-blue-500" />
                Generated CSS
              </div>
              <button
                type="button"
                onClick={downloadCss}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
              >
                <Download size={13} />
                Download
              </button>
            </div>

            <pre className="overflow-auto whitespace-pre-wrap break-words bg-[var(--background)] p-4 font-mono text-xs leading-6 sm:text-sm">
              <code>{cssOutput}</code>
            </pre>

            <div className="border-t border-[var(--border)] p-3">
              <button
                type="button"
                onClick={copyCss}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)]"
              >
                <Clipboard size={15} />
                Copy CSS to clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

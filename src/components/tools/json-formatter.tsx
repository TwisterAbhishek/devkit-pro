
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  FileJson,
  Indent,
  Minimize2,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";

const SAMPLE_JSON = `{
  "name": "DevKit Pro",
  "version": "1.0.0",
  "description": "Developer tools in one workspace",
  "features": [
    "JSON Formatter",
    "JSON Validator",
    "JSON Minifier"
  ],
  "settings": {
    "theme": "dark",
    "enabled": true,
    "maxItems": 100
  }
}`;

type ParseResult = {
  valid: boolean;
  formatted: string;
  error: string | null;
  lineCount: number;
  characterCount: number;
};

function parseJson(input: string, indent: number): ParseResult {
  if (!input.trim()) {
    return {
      valid: false,
      formatted: "",
      error: null,
      lineCount: 0,
      characterCount: 0,
    };
  }

  try {
    const parsed: unknown = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indent);

    return {
      valid: true,
      formatted,
      error: null,
      lineCount: formatted.split("\n").length,
      characterCount: formatted.length,
    };
  } catch (error) {
    return {
      valid: false,
      formatted: "",
      error:
        error instanceof Error
          ? error.message
          : "Invalid JSON syntax.",
      lineCount: 0,
      characterCount: 0,
    };
  }
}

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState("2");
  const [output, setOutput] = useState(SAMPLE_JSON);
  const [status, setStatus] = useState("ready");
  const [notice, setNotice] = useState("");

  const result = useMemo(
    () => parseJson(input, Number(indent)),
    [input, indent]
  );

  const isValid = result.valid;
  const hasInput = input.trim().length > 0;

  function formatJson() {
    if (!hasInput) {
      setOutput("");
      setStatus("error");
      setNotice("Enter JSON to format.");
      return;
    }

    if (!result.valid) {
      setOutput("");
      setStatus("error");
      setNotice(result.error ?? "Invalid JSON.");
      return;
    }

    setOutput(result.formatted);
    setStatus("success");
    setNotice("JSON formatted successfully.");
  }

  function minifyJson() {
    if (!hasInput) {
      setOutput("");
      setStatus("error");
      setNotice("Enter JSON to minify.");
      return;
    }

    if (!result.valid) {
      setOutput("");
      setStatus("error");
      setNotice(result.error ?? "Invalid JSON.");
      return;
    }

    setOutput(JSON.stringify(JSON.parse(input)));
    setStatus("success");
    setNotice("JSON minified successfully.");
  }

  function validateJson() {
    if (!hasInput) {
      setStatus("error");
      setNotice("Enter JSON to validate.");
      return;
    }

    if (!result.valid) {
      setStatus("error");
      setNotice(result.error ?? "Invalid JSON.");
      return;
    }

    setOutput(result.formatted);
    setStatus("success");
    setNotice("Your JSON is valid.");
  }

  async function copyOutput() {
    if (!output) {
      setNotice("There is no output to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setNotice("Output copied to clipboard.");
    } catch {
      setNotice("Clipboard access failed. Select and copy the output manually.");
    }
  }

  function downloadOutput() {
    if (!output) {
      setNotice("There is no output to download.");
      return;
    }

    const blob = new Blob([output], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "formatted.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("JSON download started.");
  }

  function loadSample() {
    setInput(SAMPLE_JSON);
    setOutput(SAMPLE_JSON);
    setStatus("ready");
    setNotice("Sample JSON loaded.");
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setStatus("ready");
    setNotice("");
  }

  async function loadFile(file?: File) {
    if (!file) return;

    try {
      const text = await file.text();
      setInput(text);
      setOutput("");
      setStatus("ready");
      setNotice(`Loaded ${file.name}. Validate or format it to continue.`);
    } catch {
      setNotice("Unable to read this file.");
    }
  }

  const inputLineCount = input ? input.split("\n").length : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center
              justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <FileJson size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                JSON Formatter
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6
                text-[var(--muted)]">
                Format, validate and minify JSON instantly.
                Your data stays in your browser.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center gap-2 rounded-xl
              border border-[var(--border)] px-3 py-2 text-sm
              font-medium transition hover:bg-[var(--surface-muted)]"
          >
            <Sparkles size={16} />
            Load sample
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3
          border-t border-[var(--border)] pt-5">
          <div className="flex items-center gap-2 text-sm">
            {isValid ? (
              <>
                <CheckCircle2 size={17} className="text-emerald-500" />
                <span className="font-medium text-emerald-500">
                  Valid JSON
                </span>
              </>
            ) : (
              <>
                <AlertCircle
                  size={17}
                  className={hasInput ? "text-rose-500" : "text-[var(--muted)]"}
                />
                <span className={`font-medium ${
                  hasInput ? "text-rose-500" : "text-[var(--muted)]"
                }`}>
                  {hasInput ? "Invalid JSON" : "Waiting for input"}
                </span>
              </>
            )}
          </div>

          <span className="text-[var(--border)]">|</span>

          <span className="text-xs text-[var(--muted)]">
            {input.length.toLocaleString()} characters
          </span>

          <span className="text-xs text-[var(--muted)]">
            {inputLineCount} lines
          </span>

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="json-indent" className="text-xs text-[var(--muted)]">
              Indentation
            </label>
            <select
              id="json-indent"
              value={indent}
              onChange={(event) => setIndent(event.target.value)}
              className="rounded-lg border border-[var(--border)]
                bg-[var(--surface)] px-2 py-1.5 text-xs outline-none
                focus:border-blue-500"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border
          border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[60px] flex-wrap items-center
            justify-between gap-3 border-b border-[var(--border)]
            px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <h2 className="text-sm font-semibold">Input JSON</h2>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center
                gap-1.5 rounded-lg border border-[var(--border)]
                px-2.5 py-2 text-xs font-medium hover:bg-[var(--surface-muted)]">
                <Upload size={14} />
                Import
                <input
                  type="file"
                  accept=".json,application/json,.txt,text/plain"
                  className="hidden"
                  onChange={(event) => {
                    void loadFile(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              <button
                type="button"
                onClick={clearAll}
                title="Clear all"
                aria-label="Clear all"
                className="rounded-lg p-2 text-[var(--muted)]
                  hover:bg-[var(--surface-muted)] hover:text-rose-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setStatus("ready");
                setNotice("");
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Input JSON editor"
              placeholder={'Paste your JSON here...\n\n{\n  "hello": "world"\n}'}
              className="min-h-[360px] max-h-[440px] w-full resize-y
                overflow-auto bg-transparent px-4 py-4 font-mono
                text-[13px] leading-6 text-[var(--foreground)]
                outline-none placeholder:text-[var(--muted)]
                sm:min-h-[440px] sm:px-5"
            />
          </div>

          <div className="flex items-center justify-between gap-3
            border-t border-[var(--border)] px-4 py-3 text-xs
            text-[var(--muted)] sm:px-5">
            <span>Paste or type JSON</span>
            <span>{input.length.toLocaleString()} chars</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border
          border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[60px] flex-wrap items-center
            justify-between gap-3 border-b border-[var(--border)]
            px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold">Output JSON</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copyOutput()}
                disabled={!output}
                className="inline-flex items-center gap-1.5 rounded-lg
                  border border-[var(--border)] px-2.5 py-2 text-xs
                  font-medium transition hover:bg-[var(--surface-muted)]
                  disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Copy size={14} />
                Copy
              </button>

              <button
                type="button"
                onClick={downloadOutput}
                disabled={!output}
                aria-label="Download JSON"
                title="Download JSON"
                className="rounded-lg border border-[var(--border)]
                  p-2 transition hover:bg-[var(--surface-muted)]
                  disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          <pre className="min-h-[360px] max-h-[440px] overflow-auto
  whitespace-pre px-4 py-4 font-mono text-[13px]
  leading-6 sm:min-h-[440px] sm:px-5">
            {output ? (
              <code className="whitespace-pre text-[var(--foreground)]">
                {output}
              </code>
            ) : (
              <span className="text-[var(--muted)]">
                Your formatted JSON will appear here...
              </span>
            )}
          </pre>

          <div className="flex items-center justify-between gap-3
            border-t border-[var(--border)] px-4 py-3 text-xs
            text-[var(--muted)] sm:px-5">
            <span>{output ? "JSON output ready" : "No output yet"}</span>
            <span>{output.length.toLocaleString()} chars</span>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">Actions</h2>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={formatJson}
            className="inline-flex items-center gap-2 rounded-xl
              bg-blue-600 px-4 py-3 text-sm font-semibold text-white
              shadow-lg shadow-blue-600/15 transition hover:bg-blue-700"
          >
            <Indent size={17} />
            Format JSON
          </button>

          <button
            type="button"
            onClick={minifyJson}
            className="inline-flex items-center gap-2 rounded-xl
              border border-[var(--border)] bg-[var(--surface)]
              px-4 py-3 text-sm font-medium transition
              hover:bg-[var(--surface-muted)]"
          >
            <Minimize2 size={17} />
            Minify JSON
          </button>

          <button
            type="button"
            onClick={validateJson}
            className="inline-flex items-center gap-2 rounded-xl
              border border-[var(--border)] bg-[var(--surface)]
              px-4 py-3 text-sm font-medium transition
              hover:bg-[var(--surface-muted)]"
          >
            <CheckCircle2 size={17} />
            Validate
          </button>

          <button
            type="button"
            onClick={() => {
              setInput("");
              setOutput("");
              setStatus("ready");
              setNotice("");
            }}
            className="inline-flex items-center gap-2 rounded-xl
              px-4 py-3 text-sm font-medium text-[var(--muted)]
              transition hover:bg-[var(--surface-muted)]"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-2 rounded-xl
              border p-3 text-sm ${
                status === "error"
                  ? "border-rose-500/20 bg-rose-500/5 text-rose-500"
                  : "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              }`}
          >
            {status === "error" ? (
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            )}
            <span className="break-words">{notice}</span>
          </div>
        )}

        {hasInput && !isValid && result.error && (
          <div className="mt-4 rounded-xl border border-rose-500/20
            bg-rose-500/5 p-4">
            <div className="flex items-center gap-2 text-sm
              font-semibold text-rose-500">
              <AlertCircle size={17} />
              JSON syntax error
            </div>
            <p className="mt-2 break-words font-mono text-xs leading-6
              text-[var(--muted)]">
              {result.error}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Check commas, quotes, brackets and values in your input.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-lg font-bold">How to use the JSON Formatter</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Paste your JSON",
              description: "Enter JSON or import a local JSON file.",
            },
            {
              number: "02",
              title: "Choose an action",
              description: "Format, minify or validate your input.",
            },
            {
              number: "03",
              title: "Copy or download",
              description: "Use the output in your project immediately.",
            },
          ].map((item) => (
            <div key={item.number} className="rounded-xl
              bg-[var(--surface-muted)] p-4">
              <span className="text-xs font-bold text-blue-500">
                {item.number}
              </span>
              <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

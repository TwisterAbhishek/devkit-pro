
"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileCode2,
  Fingerprint,
  Link2,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";
import * as prettier from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import * as htmlPlugin from "prettier/plugins/html";
import * as postcssPlugin from "prettier/plugins/postcss";

type ToolSlug = "code-beautifier" | "base64" | "url-encoder" | "uuid-generator";

const toolInfo: Record<ToolSlug, {
  title: string;
  description: string;
  icon: typeof Code2;
}> = {
  "code-beautifier": {
    title: "Code Beautifier",
    description: "Format HTML, CSS and JavaScript with consistent indentation.",
    icon: Code2,
  },
  base64: {
    title: "Base64 Encoder / Decoder",
    description: "Encode text to Base64 or decode Base64 into readable text.",
    icon: ArrowLeftRight,
  },
  "url-encoder": {
    title: "URL Encoder / Decoder",
    description: "Encode or decode URL components safely.",
    icon: Link2,
  },
  "uuid-generator": {
    title: "UUID Generator",
    description: "Generate unique identifiers using your browser's cryptographic API.",
    icon: Fingerprint,
  },
};

const sampleCode = `function greet(name){const message="Hello, "+name+"!";return message;}console.log(greet("DevKit Pro"));`;

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function UtilityTool({ slug }: { slug: ToolSlug }) {
  const info = toolInfo[slug];
  const Icon = info.icon;

  const [input, setInput] = useState(
    slug === "code-beautifier" ? sampleCode : ""
  );
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [language, setLanguage] = useState("javascript");
  const [count, setCount] = useState("5");
  const [uppercase, setUppercase] = useState(false);

  function report(text: string, failed = false) {
    setMessage(text);
    setError(failed);
  }

  async function runTool() {
    setMessage("");
    setError(false);

    try {
      if (slug === "code-beautifier") {
        if (!input.trim()) {
          setOutput("");
          report("Enter some code to format.", true);
          return;
        }

        let parser: "babel" | "html" | "css" = "babel";
        let plugins: object[] = [babelPlugin, estreePlugin];

        if (language === "html") {
          parser = "html";
          plugins = [htmlPlugin];
        } else if (language === "css") {
          parser = "css";
          plugins = [postcssPlugin];
        }

        const formatted = await prettier.format(input, {
          parser,
          plugins: plugins as NonNullable<
            Parameters<typeof prettier.format>[1]
            >["plugins"],
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
        });

        setOutput(formatted);
        report("Code formatted successfully.");
        return;
      }

      if (slug === "base64") {
        if (!input) {
          report("Enter text to continue.", true);
          return;
        }

        const result =
          direction === "encode" ? encodeBase64(input) : decodeBase64(input);
        setOutput(result);
        report(direction === "encode" ? "Text encoded successfully." : "Base64 decoded successfully.");
        return;
      }

      if (slug === "url-encoder") {
        if (!input) {
          report("Enter text to continue.", true);
          return;
        }

        const result =
          direction === "encode"
            ? encodeURIComponent(input)
            : decodeURIComponent(input);
        setOutput(result);
        report(direction === "encode" ? "URL component encoded." : "URL component decoded.");
        return;
      }

      if (slug === "uuid-generator") {
        const total = Number(count);
        if (!Number.isInteger(total) || total < 1 || total > 100) {
          report("Choose a number between 1 and 100.", true);
          return;
        }

        if (!globalThis.crypto?.randomUUID) {
          report("UUID generation is not supported by this browser.", true);
          return;
        }

        const uuids = Array.from({ length: total }, () => {
          const id = crypto.randomUUID();
          return uppercase ? id.toUpperCase() : id;
        });

        setOutput(uuids.join("\n"));
        report(`${total} UUID${total === 1 ? "" : "s"} generated.`);
      }
    } catch (err) {
      setOutput("");
      report(
        err instanceof Error ? err.message : "Unable to process this input.",
        true
      );
    }
  }

  async function copyOutput() {
    if (!output) {
      report("There is no output to copy.", true);
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      report("Copied to clipboard.");
    } catch {
      report("Clipboard access failed. Select and copy the output manually.", true);
    }
  }

  function downloadOutput() {
    if (!output) {
      report("There is no output to download.", true);
      return;
    }

    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = slug === "uuid-generator" ? "uuids.txt" : "devkit-output.txt";
    link.click();
    URL.revokeObjectURL(url);
    report("Download started.");
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setMessage("");
    setError(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center
            rounded-xl bg-blue-500/10 text-blue-500">
            <Icon size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{info.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {info.description}
            </p>
          </div>
        </div>

        {slug === "code-beautifier" && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label htmlFor="code-language" className="text-sm text-[var(--muted)]">
              Language
            </label>
            <select
              id="code-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-xl border border-[var(--border)]
                bg-[var(--surface)] px-3 py-2 text-sm outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
        )}

        {(slug === "base64" || slug === "url-encoder") && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDirection("encode");
                setMessage("");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                direction === "encode"
                  ? "bg-blue-600 text-white"
                  : "border border-[var(--border)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("decode");
                setMessage("");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                direction === "decode"
                  ? "bg-blue-600 text-white"
                  : "border border-[var(--border)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              Decode
            </button>
          </div>
        )}

        {slug === "uuid-generator" && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              Quantity
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(event) => setCount(event.target.value)}
                className="w-20 rounded-lg border border-[var(--border)]
                  bg-[var(--surface)] px-2 py-2 outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(event) => setUppercase(event.target.checked)}
                className="accent-blue-600"
              />
              Uppercase
            </label>
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {slug !== "uuid-generator" && (
          <section className="overflow-hidden rounded-2xl border
            border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-sm font-semibold">Input</h2>
            </div>
            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setMessage("");
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={
                slug === "code-beautifier"
                  ? "Paste your HTML, CSS or JavaScript..."
                  : direction === "encode"
                    ? "Enter text to encode..."
                    : "Paste encoded text to decode..."
              }
              aria-label="Tool input"
              className="min-h-[330px] max-h-[440px] w-full resize-y
  overflow-auto bg-transparent p-5 font-mono text-sm
  leading-6 outline-none placeholder:text-[var(--muted)]"
            />
          </section>
        )}

        <section className={`overflow-hidden rounded-2xl border
          border-[var(--border)] bg-[var(--surface)]
          ${slug === "uuid-generator" ? "xl:col-span-2" : ""}`}>
          <div className="flex items-center justify-between gap-3
            border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold">Output</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void copyOutput()}
                disabled={!output}
                className="inline-flex items-center gap-1.5 rounded-lg
                  border border-[var(--border)] px-3 py-2 text-xs
                  hover:bg-[var(--surface-muted)] disabled:opacity-40"
              >
                <Copy size={14} /> Copy
              </button>
              <button
                type="button"
                onClick={downloadOutput}
                disabled={!output}
                aria-label="Download output"
                className="rounded-lg border border-[var(--border)] p-2
                  hover:bg-[var(--surface-muted)] disabled:opacity-40"
              >
                <Download size={15} />
              </button>
            </div>
          </div>
          <pre className="min-h-[330px] max-h-[440px] overflow-auto
  whitespace-pre-wrap break-words p-5 font-mono text-sm
  leading-6">
            {output || (
              <span className="text-[var(--muted)]">
                Your result will appear here...
              </span>
            )}
          </pre>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void runTool()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600
              px-5 py-3 text-sm font-semibold text-white transition
              hover:bg-blue-700"
          >
            {slug === "code-beautifier" ? (
              <WandSparkles size={17} />
            ) : slug === "uuid-generator" ? (
              <Fingerprint size={17} />
            ) : (
              <ArrowLeftRight size={17} />
            )}
            {slug === "code-beautifier"
              ? "Format code"
              : slug === "uuid-generator"
                ? "Generate UUIDs"
                : direction === "encode"
                  ? "Encode"
                  : "Decode"}
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-2 rounded-xl
              border border-[var(--border)] px-4 py-3 text-sm
              font-medium hover:bg-[var(--surface-muted)]"
          >
            <RotateCcw size={16} /> Clear
          </button>

          {slug === "code-beautifier" && (
            <button
              type="button"
              onClick={() => {
                setInput(sampleCode);
                setOutput("");
                setMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-xl
                px-4 py-3 text-sm text-[var(--muted)]
                hover:bg-[var(--surface-muted)]"
            >
              <Sparkles size={16} /> Load sample
            </button>
          )}
        </div>

        {message && (
          <p role="status" className={`mt-4 flex items-center gap-2
            break-words text-sm ${error ? "text-rose-500" : "text-emerald-500"}`}>
            {error ? <RotateCcw size={16} /> : <Check size={16} />}
            {message}
          </p>
        )}
      </section>

      <p className="flex items-start gap-2 text-xs leading-5 text-[var(--muted)]">
        <Clipboard size={15} className="mt-0.5 shrink-0" />
        Processing happens in your browser. Avoid treating encoded text as
        encryption: Base64 and URL encoding do not protect sensitive data.
      </p>
    </div>
  );
}

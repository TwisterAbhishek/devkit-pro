
"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Fingerprint,
  RotateCcw,
  Upload,
} from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";
const ALGORITHMS = [
  { value: "SHA-1", label: "SHA-1", note: "Legacy" },
  { value: "SHA-256", label: "SHA-256", note: "Recommended default" },
  { value: "SHA-384", label: "SHA-384", note: "Strong" },
  { value: "SHA-512", label: "SHA-512", note: "Strong" },
] as const;

type Algorithm = (typeof ALGORITHMS)[number]["value"];

type HashResult = {
  algorithm: Algorithm;
  digest: string;
};

export default function HashGenerator() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Algorithm[]>(["SHA-256"]);
  const [results, setResults] = useState<HashResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);

  function report(message: string, failed = false) {
    setNotice(message);
    setError(failed);
  }

  function toggleAlgorithm(algorithm: Algorithm) {
    setSelected((current) =>
      current.includes(algorithm)
        ? current.filter((item) => item !== algorithm)
        : [...current, algorithm]
    );
    setResults([]);
    setNotice("");
  }

  async function generateHashes() {
    if (selected.length === 0) {
      report("Select at least one hash algorithm.", true);
      return;
    }

    if (mode === "text" && !input.length) {
      report("Enter some text to generate a hash.", true);
      return;
    }

    if (mode === "file" && !file) {
      report("Choose a file to generate its hash.", true);
      return;
    }

    if (!globalThis.crypto?.subtle) {
      report(
        "Web Crypto is unavailable. Use localhost or a secure HTTPS connection.",
        true
      );
      return;
    }

    setBusy(true);
    setResults([]);
    setNotice("");

    try {
      const data: BufferSource =
        mode === "file"
          ? await file!.arrayBuffer()
          : new TextEncoder().encode(input);

      const generated = await Promise.all(
        selected.map(async (algorithm) => {
          const digest = await crypto.subtle.digest(algorithm, data);
          const hex = Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");

          return { algorithm, digest: hex };
        })
      );

      setResults(generated);
      report(`Generated ${generated.length} hash${generated.length === 1 ? "" : "es"}.`);
    } catch (err) {
      report(
        err instanceof Error ? err.message : "Unable to generate hashes.",
        true
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyHash(result: HashResult) {
    try {
      await navigator.clipboard.writeText(result.digest);
      report(`${result.algorithm} hash copied.`);
    } catch {
      report("Clipboard access failed. Select and copy the hash manually.", true);
    }
  }

  async function copyAll() {
    if (!results.length) return;

    const text = results
      .map(({ algorithm, digest }) => `${algorithm}: ${digest}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      report("All hashes copied.");
    } catch {
      report("Clipboard access failed.", true);
    }
  }

  function downloadHashes() {
    if (!results.length) {
      report("Generate hashes before downloading.", true);
      return;
    }

    const content = results
      .map(({ algorithm, digest }) => `${algorithm}: ${digest}`)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "devkit-hashes.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    report("Hash file download started.");
  }

  function clearAll() {
    setInput("");
    setFile(null);
    setResults([]);
    setNotice("");
    setError(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center
            rounded-xl bg-violet-500/10 text-violet-500">
            <Fingerprint size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Hash Generator</h1>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Generate SHA hashes from text or files locally in your browser.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("text");
              setResults([]);
              setNotice("");
            }}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium ${
              mode === "text"
                ? "bg-blue-600 text-white"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            Text input
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("file");
              setResults([]);
              setNotice("");
            }}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium ${
              mode === "file"
                ? "bg-blue-600 text-white"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            File input
          </button>
        </div>

        {mode === "text" ? (
          <div className="mt-5">
            <label htmlFor="hash-input" className="text-sm font-semibold">
              Text to hash
            </label>
            <textarea
              id="hash-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setResults([]);
                setNotice("");
              }}
              spellCheck={false}
              placeholder="Enter or paste your text..."
              className="mt-2 min-h-[180px] max-h-[440px] w-full
                resize-y overflow-auto rounded-xl border
                border-[var(--border)] bg-[var(--background)]
                p-4 font-mono text-sm leading-6 outline-none
                focus:border-blue-500"
            />
            <p className="mt-2 text-xs text-[var(--muted)]">
              {input.length.toLocaleString()} characters
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed
            border-[var(--border)] p-6 text-center sm:p-10">
            <FileText size={32} className="mx-auto text-[var(--muted)]" />
            <p className="mt-3 text-sm font-semibold">
              {file ? file.name : "Select a file"}
            </p>
            <p className="mt-1 break-all text-xs text-[var(--muted)]">
              {file
                ? `${file.size.toLocaleString()} bytes`
                : "The file is read locally; it is not uploaded to a server."}
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center
              gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5
              text-sm font-medium hover:bg-[var(--surface-muted)]">
              <Upload size={16} />
              Choose file
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setResults([]);
                  setNotice("");
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-base font-semibold">Hash algorithms</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Select one or more algorithms.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ALGORITHMS.map((algorithm) => (
            <label
              key={algorithm.value}
              className="flex cursor-pointer items-center gap-3
                rounded-xl border border-[var(--border)] p-4
                hover:bg-[var(--surface-muted)]"
            >
              <input
                type="checkbox"
                checked={selected.includes(algorithm.value)}
                onChange={() => toggleAlgorithm(algorithm.value)}
                className="h-4 w-4 accent-blue-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {algorithm.label}
                </span>
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  {algorithm.note}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void generateHashes()}
            className="inline-flex cursor-pointer items-center gap-2
              rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold
              text-white transition hover:bg-blue-700
              disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Fingerprint size={17} />
            {busy ? "Generating..." : "Generate hashes"}
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="inline-flex cursor-pointer items-center gap-2
              rounded-xl border border-[var(--border)] px-4 py-3
              text-sm hover:bg-[var(--surface-muted)]"
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>

        {notice && (
          <p role={error ? "alert" : "status"}
            className={`mt-4 break-words text-sm ${
              error ? "text-rose-500" : "text-emerald-500"
            }`}>
            {notice}
          </p>
        )}
      </section>

      {results.length > 0 && (
        <section className="rounded-2xl border border-[var(--border)]
          bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Generated hashes</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {results.length} result{results.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyAll()}
                className="inline-flex cursor-pointer items-center gap-2
                  rounded-lg border border-[var(--border)] px-3 py-2
                  text-xs hover:bg-[var(--surface-muted)]"
              >
                <Copy size={14} /> Copy all
              </button>
              <button
                type="button"
                onClick={downloadHashes}
                className="inline-flex cursor-pointer items-center gap-2
                  rounded-lg border border-[var(--border)] px-3 py-2
                  text-xs hover:bg-[var(--surface-muted)]"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {results.map((result) => (
              <div key={result.algorithm} className="rounded-xl border
                border-[var(--border)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {result.algorithm}
                  </h3>
                  <button
                    type="button"
                    onClick={() => void copyHash(result)}
                    aria-label={`Copy ${result.algorithm} hash`}
                    className="cursor-pointer rounded-lg p-2
                      text-[var(--muted)] hover:bg-[var(--surface-muted)]
                      hover:text-[var(--foreground)]"
                  >
                    <Copy size={15} />
                  </button>
                </div>
                <code className="mt-3 block break-all font-mono
                  text-xs leading-6 sm:text-sm">
                  {result.digest}
                </code>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs leading-5 text-[var(--muted)]">
        SHA-1 is provided for compatibility with legacy systems. Prefer SHA-256
        or stronger SHA-2 algorithms for modern integrity checks. Hashing is
        not encryption and does not make sensitive input secret.
      </p>
    </div>
  );
}

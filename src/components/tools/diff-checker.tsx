
"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Clipboard,
  Download,
  FileDiff,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { diffLines } from "diff";
import GlobalSidebar from "@/components/global-sidebar";

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello " + name);
  return true;
}

greet("Developer");`;

const SAMPLE_MODIFIED = `function greet(name, language = "en") {
  if (language === "en") {
    console.log(\`Hello \${name}\`);
  } else {
    console.log(\`Welcome \${name}\`);
  }

  return true;
}

greet("Developer", "en");`;

type DiffLine = {
  type: "added" | "removed" | "unchanged";
  text: string;
  lineNumber: number | null;
};

function normalizeLine(line: string, ignoreWhitespace: boolean) {
  return ignoreWhitespace ? line.replace(/\s+/g, "") : line;
}

function buildSideBySideDiff(
  original: string,
  modified: string,
  ignoreWhitespace: boolean
) {
  const changes = diffLines(original, modified);
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  let leftNumber = 1;
  let rightNumber = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const lines = change.value.replace(/\n$/, "").split("\n");

    if (change.added) {
      for (const line of lines) {
        right.push({
          type: "added",
          text: line,
          lineNumber: rightNumber++,
        });
      }
      continue;
    }

    if (change.removed) {
      const nextChange = changes[i + 1];

      if (nextChange?.added) {
        const removedLines = lines;
        const addedLines = nextChange.value.replace(/\n$/, "").split("\n");
        const pairedCount = Math.min(
          removedLines.length,
          addedLines.length
        );

        for (let j = 0; j < pairedCount; j++) {
          const same = ignoreWhitespace
            ? normalizeLine(removedLines[j], true) ===
              normalizeLine(addedLines[j], true)
            : removedLines[j] === addedLines[j];

          left.push({
            type: same ? "unchanged" : "removed",
            text: removedLines[j],
            lineNumber: leftNumber++,
          });

          right.push({
            type: same ? "unchanged" : "added",
            text: addedLines[j],
            lineNumber: rightNumber++,
          });
        }

        for (let j = pairedCount; j < removedLines.length; j++) {
          left.push({
            type: "removed",
            text: removedLines[j],
            lineNumber: leftNumber++,
          });
        }

        for (let j = pairedCount; j < addedLines.length; j++) {
          right.push({
            type: "added",
            text: addedLines[j],
            lineNumber: rightNumber++,
          });
        }

        i++;
      } else {
        for (const line of lines) {
          left.push({
            type: "removed",
            text: line,
            lineNumber: leftNumber++,
          });
        }
      }
      continue;
    }

    for (const line of lines) {
      left.push({
        type: "unchanged",
        text: line,
        lineNumber: leftNumber++,
      });
      right.push({
        type: "unchanged",
        text: line,
        lineNumber: rightNumber++,
      });
    }
  }

  return { left, right };
}

export default function DiffChecker() {
  const [original, setOriginal] = useState(SAMPLE_ORIGINAL);
  const [modified, setModified] = useState(SAMPLE_MODIFIED);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const comparison = useMemo(
    () => buildSideBySideDiff(original, modified, ignoreWhitespace),
    [original, modified, ignoreWhitespace]
  );

  const addedCount = comparison.right.filter(
    (line) => line.type === "added"
  ).length;

  const removedCount = comparison.left.filter(
    (line) => line.type === "removed"
  ).length;

  function loadSample() {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    setNotice("Sample comparison loaded.");
    setError("");
  }

  function clearAll() {
    setOriginal("");
    setModified("");
    setNotice("");
    setError("");
  }

  function swapInputs() {
    setOriginal(modified);
    setModified(original);
    setNotice("Inputs swapped.");
    setError("");
  }

  function getUnifiedDiff() {
    return [
      "--- Original",
      "+++ Modified",
      ...comparison.left.map((line) =>
        line.type === "removed" ? `-${line.text}` : ` ${line.text}`
      ),
      ...comparison.right
        .filter((line) => line.type === "added")
        .map((line) => `+${line.text}`),
    ].join("\n");
  }

  async function copyDiff() {
    const result = getUnifiedDiff();

    if (!original && !modified) {
      setError("Enter text in at least one editor first.");
      setNotice("");
      return;
    }

    try {
      await navigator.clipboard.writeText(result);
      setNotice("Diff copied to clipboard.");
      setError("");
    } catch {
      setError("Clipboard access failed. Copy the comparison manually.");
      setNotice("");
    }
  }

  function downloadDiff() {
    const result = getUnifiedDiff();

    if (!original && !modified) {
      setError("Enter text in at least one editor first.");
      setNotice("");
      return;
    }

    const blob = new Blob([result], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "diff.txt";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("Diff file downloaded.");
    setError("");
  }

  function renderLines(lines: DiffLine[]) {
    if (!lines.length) {
      return (
        <div className="px-4 py-6 text-sm text-[var(--muted)]">
          No lines to display.
        </div>
      );
    }

    return lines.map((line, index) => (
      <div
        key={`${line.lineNumber}-${index}`}
        className={`flex min-h-7 border-b border-[var(--border)]/50 font-mono text-xs sm:text-sm ${
          line.type === "added"
            ? "bg-emerald-500/10"
            : line.type === "removed"
              ? "bg-red-500/10"
              : ""
        }`}
      >
        <span className="w-10 shrink-0 select-none border-r border-[var(--border)] px-2 py-1 text-right text-[var(--muted)]">
          {line.lineNumber ?? ""}
        </span>
        <span
          className={`w-6 shrink-0 select-none px-1 py-1 text-center ${
            line.type === "added"
              ? "text-emerald-500"
              : line.type === "removed"
                ? "text-red-500"
                : "text-[var(--muted)]"
          }`}
        >
          {line.type === "added"
            ? "+"
            : line.type === "removed"
              ? "−"
              : " "}
        </span>
        <span className="min-w-0 flex-1 whitespace-pre-wrap break-all px-2 py-1">
          {line.text || " "}
        </span>
      </div>
    ));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-500">
            <FileDiff size={20} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Comparison Tools
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Diff Checker
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Compare text, code, SQL, or configuration files and spot
            additions and removals instantly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
          >
            <Sparkles size={15} />
            Sample
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
          >
            <Trash2 size={15} />
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(event) => setIgnoreWhitespace(event.target.checked)}
            className="size-4 cursor-pointer accent-blue-600"
          />
          Ignore whitespace-only changes
        </label>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-medium text-emerald-600">
            +{addedCount} added
          </span>
          <span className="font-medium text-red-500">
            −{removedCount} removed
          </span>
          <button
            type="button"
            onClick={swapInputs}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
          >
            <ArrowLeftRight size={14} />
            Swap
          </button>
        </div>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-sm font-semibold">Original text</span>
            <span className="text-xs text-[var(--muted)]">
              {original.length.toLocaleString()} characters
            </span>
          </div>
          <textarea
            value={original}
            onChange={(event) => {
              setOriginal(event.target.value);
              setNotice("");
              setError("");
            }}
            aria-label="Original text"
            spellCheck={false}
            placeholder="Paste the original text here..."
            className="h-[300px] w-full resize-y overflow-auto bg-[var(--background)] p-4 font-mono text-sm leading-6 outline-none placeholder:text-[var(--muted)]"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-sm font-semibold">Modified text</span>
            <span className="text-xs text-[var(--muted)]">
              {modified.length.toLocaleString()} characters
            </span>
          </div>
          <textarea
            value={modified}
            onChange={(event) => {
              setModified(event.target.value);
              setNotice("");
              setError("");
            }}
            aria-label="Modified text"
            spellCheck={false}
            placeholder="Paste the modified text here..."
            className="h-[300px] w-full resize-y overflow-auto bg-[var(--background)] p-4 font-mono text-sm leading-6 outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Check size={16} className="text-emerald-500" />
          Comparison updates automatically
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyDiff}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm hover:bg-[var(--surface-muted)]"
          >
            <Clipboard size={15} />
            Copy diff
          </button>
          <button
            type="button"
            onClick={downloadDiff}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download size={15} />
            Download
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileDiff size={16} className="text-blue-500" />
            Side-by-side diff
          </div>
          <span className="text-xs text-[var(--muted)]">
            Red: removed · Green: added
          </span>
        </div>

        <div className="grid min-w-0 lg:grid-cols-2">
          <div className="min-w-0 overflow-hidden border-b border-[var(--border)] lg:border-b-0 lg:border-r">
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold">
              Original
            </div>
            <div className="max-h-[500px] overflow-auto">
              {renderLines(comparison.left)}
            </div>
          </div>

          <div className="min-w-0 overflow-hidden">
            <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold">
              Modified
            </div>
            <div className="max-h-[500px] overflow-auto">
              {renderLines(comparison.right)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

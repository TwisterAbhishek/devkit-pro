
"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

type ChangeType = "added" | "removed" | "changed";

type Difference = {
  path: string;
  type: ChangeType;
  before?: unknown;
  after?: unknown;
};

function compareValues(
  before: unknown,
  after: unknown,
  path = "$",
  differences: Difference[] = [],
): Difference[] {
  if (Object.is(before, after)) return differences;

  if (
    before === null ||
    after === null ||
    typeof before !== "object" ||
    typeof after !== "object"
  ) {
    differences.push({
      path,
      type: "changed",
      before,
      after,
    });
    return differences;
  }

  if (Array.isArray(before) !== Array.isArray(after)) {
    differences.push({
      path,
      type: "changed",
      before,
      after,
    });
    return differences;
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);

    for (let index = 0; index < length; index++) {
      const itemPath = `${path}[${index}]`;

      if (index >= before.length) {
        differences.push({
          path: itemPath,
          type: "added",
          after: after[index],
        });
      } else if (index >= after.length) {
        differences.push({
          path: itemPath,
          type: "removed",
          before: before[index],
        });
      } else {
        compareValues(before[index], after[index], itemPath, differences);
      }
    }

    return differences;
  }

  const beforeObject = before as Record<string, unknown>;
  const afterObject = after as Record<string, unknown>;
  const keys = new Set([
    ...Object.keys(beforeObject),
    ...Object.keys(afterObject),
  ]);

  for (const key of keys) {
    const keyPath = `${path}.${key}`;
    const hasBefore = Object.prototype.hasOwnProperty.call(beforeObject, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(afterObject, key);

    if (!hasBefore && hasAfter) {
      differences.push({
        path: keyPath,
        type: "added",
        after: afterObject[key],
      });
    } else if (hasBefore && !hasAfter) {
      differences.push({
        path: keyPath,
        type: "removed",
        before: beforeObject[key],
      });
    } else {
      compareValues(beforeObject[key], afterObject[key], keyPath, differences);
    }
  }

  return differences;
}

function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const sampleBefore = JSON.stringify(
  {
    user: {
      id: 101,
      name: "Alex",
      email: "alex@example.com",
    },
    active: true,
  },
  null,
  2,
);

const sampleAfter = JSON.stringify(
  {
    user: {
      id: "101",
      name: "Alex Morgan",
      verified: true,
    },
    active: true,
  },
  null,
  2,
);

export default function ApiResponseComparison() {
  const [beforeText, setBeforeText] = useState(sampleBefore);
  const [afterText, setAfterText] = useState(sampleAfter);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const before: unknown = JSON.parse(beforeText);
      const after: unknown = JSON.parse(afterText);

      return {
        differences: compareValues(before, after),
        error: "",
      };
    } catch (error) {
      return {
        differences: [] as Difference[],
        error:
          error instanceof Error
            ? error.message
            : "Please provide valid JSON in both editors.",
      };
    }
  }, [beforeText, afterText]);

  const added = result.differences.filter((item) => item.type === "added");
  const removed = result.differences.filter((item) => item.type === "removed");
  const changed = result.differences.filter((item) => item.type === "changed");

  async function copyReport() {
    const report = result.differences
      .map(
        (item) =>
          `${item.type.toUpperCase()} ${item.path}\nBefore: ${formatValue(item.before)}\nAfter: ${formatValue(item.after)}`,
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(report || "No differences found.");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function loadSample() {
    setBeforeText(sampleBefore);
    setAfterText(sampleAfter);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Compare JSON responses</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Differences are calculated locally in your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSample}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
        >
          <RotateCcw size={15} />
          Load sample
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium">
            Response A · Original
          </span>
          <textarea
            value={beforeText}
            onChange={(event) => setBeforeText(event.target.value)}
            spellCheck={false}
            aria-label="Original JSON response"
            className="min-h-[260px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs leading-6 outline-none focus:border-blue-500"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium">
            Response B · New
          </span>
          <textarea
            value={afterText}
            onChange={(event) => setAfterText(event.target.value)}
            spellCheck={false}
            aria-label="New JSON response"
            className="min-h-[260px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs leading-6 outline-none focus:border-blue-500"
          />
        </label>
      </div>

      {result.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500"
        >
          Invalid JSON: {result.error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs text-[var(--muted)]">Added</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-500">
                {added.length}
              </p>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs text-[var(--muted)]">Removed</p>
              <p className="mt-1 text-2xl font-semibold text-red-500">
                {removed.length}
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-[var(--muted)]">Changed</p>
              <p className="mt-1 text-2xl font-semibold text-amber-500">
                {changed.length}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
              <div>
                <h3 className="font-semibold">Difference report</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {result.differences.length} differences found
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy report"}
              </button>
            </div>

            {result.differences.length === 0 ? (
              <p className="p-6 text-center text-sm text-[var(--muted)]">
                <ArrowLeftRight className="mx-auto mb-2" size={20} />
                The JSON responses are identical.
              </p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {result.differences.map((item) => (
                  <div key={`${item.path}-${item.type}`} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${
                          item.type === "added"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : item.type === "removed"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {item.type}
                      </span>

                      <code className="break-all text-xs">{item.path}</code>
                    </div>

                    {item.type !== "added" && (
                      <pre className="mt-3 overflow-x-auto rounded-lg bg-red-500/5 p-3 text-xs text-red-500">
                        - {formatValue(item.before)}
                      </pre>
                    )}

                    {item.type !== "removed" && (
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-emerald-500/5 p-3 text-xs text-emerald-500">
                        + {formatValue(item.after)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

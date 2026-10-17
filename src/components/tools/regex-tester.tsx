
"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Regex, RotateCcw } from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";
const SAMPLE = `Contact support@example.com or sales@devkit.pro.
Call +1 555-123-4567 for assistance.
Order ID: DK-2026-1042.`;

const FLAGS = ["g", "i", "m", "s", "u"] as const;

export default function RegexTester() {
  const [pattern, setPattern] = useState(
    String.raw`[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}`
  );
  const [text, setText] = useState(SAMPLE);
  const [enabledFlags, setEnabledFlags] = useState<string[]>(["g", "i"]);
  const [notice, setNotice] = useState("");

  const result = useMemo(() => {
    if (!pattern) {
      return { matches: [] as RegExpExecArray[], error: "" };
    }

    try {
      const regex = new RegExp(pattern, enabledFlags.join(""));
      const matches: RegExpExecArray[] = [];
      let match: RegExpExecArray | null;

      if (regex.global) {
        while ((match = regex.exec(text)) !== null) {
          matches.push(match);
          if (match[0] === "") regex.lastIndex++;
        }
      } else {
        match = regex.exec(text);
        if (match) matches.push(match);
      }

      return { matches, error: "" };
    } catch (error) {
      return {
        matches: [] as RegExpExecArray[],
        error: error instanceof Error ? error.message : "Invalid expression.",
      };
    }
  }, [pattern, text, enabledFlags]);

  const highlighted = useMemo(() => {
    if (!result.matches.length) return [{ value: text, matched: false }];

    const ranges = result.matches
      .filter((match) => match[0].length > 0)
      .map((match) => ({
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      }))
      .sort((a, b) => a.start - b.start);

    const parts: { value: string; matched: boolean }[] = [];
    let cursor = 0;

    for (const range of ranges) {
      if (range.start < cursor) continue;

      if (range.start > cursor) {
        parts.push({
          value: text.slice(cursor, range.start),
          matched: false,
        });
      }

      parts.push({
        value: text.slice(range.start, range.end),
        matched: true,
      });

      cursor = range.end;
    }

    if (cursor < text.length) {
      parts.push({ value: text.slice(cursor), matched: false });
    }

    return parts;
  }, [text, result.matches]);

  function toggleFlag(flag: string) {
    setEnabledFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag]
    );
    setNotice("");
  }

  async function copyPattern() {
    try {
      await navigator.clipboard.writeText(pattern);
      setNotice("Pattern copied.");
    } catch {
      setNotice("Unable to access the clipboard.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center
            rounded-xl bg-blue-500/10 text-blue-500">
            <Regex size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Regex Tester</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Test regular expressions and inspect matches in real time.
            </p>
          </div>
        </div>

        <label htmlFor="regex-pattern" className="mt-6 block text-sm font-semibold">
          Regular expression
        </label>
        <div className="mt-2 flex gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl
            border border-[var(--border)] bg-[var(--background)] px-3">
            <span className="mr-2 text-blue-500">/</span>
            <input
              id="regex-pattern"
              value={pattern}
              onChange={(event) => {
                setPattern(event.target.value);
                setNotice("");
              }}
              spellCheck={false}
              className="h-12 min-w-0 flex-1 bg-transparent font-mono
                text-sm outline-none"
              placeholder="Enter a pattern..."
            />
            <span className="ml-2 text-[var(--muted)]">/</span>
          </div>
          <button
            type="button"
            onClick={() => void copyPattern()}
            aria-label="Copy regular expression"
            className="cursor-pointer rounded-xl border
              border-[var(--border)] px-3 hover:bg-[var(--surface-muted)]"
          >
            <Copy size={17} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-[var(--muted)]">Flags</span>
          {FLAGS.map((flag) => (
            <label key={flag} className="flex cursor-pointer items-center gap-1.5
              rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={enabledFlags.includes(flag)}
                onChange={() => toggleFlag(flag)}
                className="accent-blue-600"
              />
              <code>{flag}</code>
              <span className="text-xs text-[var(--muted)]">
                {({ g: "Global", i: "Ignore case", m: "Multiline", s: "Dot all", u: "Unicode" } as Record<string, string>)[flag]}
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border
          border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold">Test string</h2>
          </div>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setNotice("");
            }}
            spellCheck={false}
            aria-label="Regex test string"
            className="min-h-[280px] max-h-[440px] w-full resize-y
              overflow-auto bg-transparent p-5 font-mono text-sm
              leading-6 outline-none"
            placeholder="Enter text to test..."
          />
        </section>

        <section className="overflow-hidden rounded-2xl border
          border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-3
            border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold">Highlighted matches</h2>
            <span className="rounded-full bg-blue-500/10 px-3 py-1
              text-xs font-semibold text-blue-500">
              {result.matches.length} matches
            </span>
          </div>
          <pre className="min-h-[280px] max-h-[440px] overflow-auto
            whitespace-pre-wrap break-words p-5 font-mono text-sm leading-7">
            {highlighted.map((part, index) =>
              part.matched ? (
                <mark key={index} className="rounded bg-amber-300/70
                  text-gray-900 dark:bg-amber-400/40 dark:text-white">
                  {part.value}
                </mark>
              ) : (
                <span key={index}>{part.value}</span>
              )
            )}
          </pre>
        </section>
      </div>

      {result.error ? (
        <div role="alert" className="rounded-xl border border-rose-500/20
          bg-rose-500/5 p-4 text-sm text-rose-500">
          <strong>Invalid regular expression</strong>
          <p className="mt-2 break-words">{result.error}</p>
        </div>
      ) : (
        <section className="rounded-2xl border border-[var(--border)]
          bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Expression is valid
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {result.matches.length
              ? `${result.matches.length} match(es) found.`
              : "No matches found for this pattern."}
          </p>

          {result.matches.length > 0 && (
            <div className="mt-4 space-y-3">
              {result.matches.map((match, index) => (
                <div key={`${match.index}-${index}`} className="rounded-xl
                  bg-[var(--surface-muted)] p-3">
                  <p className="text-xs text-[var(--muted)]">
                    Match {index + 1} · Position {match.index ?? 0}
                  </p>
                  <code className="mt-1 block break-all text-sm">
                    {match[0] || "(empty match)"}
                  </code>
                  {match.length > 1 && (
                    <div className="mt-2 space-y-1">
                      {Array.from(match).slice(1).map((group, groupIndex) => (
                        <p key={groupIndex} className="break-all text-xs
                          text-[var(--muted)]">
                          Group {groupIndex + 1}: {group ?? "(no capture)"}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {notice && <p role="status" className="text-sm text-[var(--muted)]">{notice}</p>}

      <button
        type="button"
        onClick={() => {
          setPattern("");
          setText("");
          setNotice("");
        }}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl
          border border-[var(--border)] px-4 py-3 text-sm
          hover:bg-[var(--surface-muted)]"
      >
        <RotateCcw size={16} /> Clear all
      </button>
    </div>
  );
}

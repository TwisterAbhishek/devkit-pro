"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";

type EditorTab = "html" | "css" | "javascript";

type ConsoleEntry = {
  type: "log" | "warn" | "error";
  message: string;
};

type ScrollPosition = {
  top: number;
  left: number;
};

const initialHtml = `<div class="card">
  <div class="icon">✦</div>
  <h1>Hello, DevKit Pro!</h1>
  <p>Edit the HTML, CSS, and JavaScript to build something amazing.</p>
  <button id="demoButton">Click me</button>
</div>`;

const initialCss = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e3a8a);
  color: #f8fafc;
}

.card {
  width: min(100%, 420px);
  padding: 36px;
  text-align: center;
  border: 1px solid #ffffff30;
  border-radius: 24px;
  background: #ffffff12;
  box-shadow: 0 24px 80px #00000030;
}

.icon {
  color: #93c5fd;
  font-size: 36px;
}

h1 {
  margin: 12px 0;
  font-size: 28px;
}

p {
  color: #cbd5e1;
  line-height: 1.7;
}

button {
  margin-top: 12px;
  padding: 12px 22px;
  border: 0;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  font: inherit;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}`;

const initialJavaScript = `const button = document.querySelector("#demoButton");

button?.addEventListener("click", () => {
  console.log("Button clicked!");
  button.textContent = "It works!";
});`;

const tabConfig: {
  id: EditorTab;
  label: string;
  icon: typeof Code2;
}[] = [
  { id: "html", label: "HTML", icon: FileCode2 },
  { id: "css", label: "CSS", icon: Code2 },
  { id: "javascript", label: "JavaScript", icon: Terminal },
];

const initialScrollPositions: Record<EditorTab, ScrollPosition> = {
  html: { top: 0, left: 0 },
  css: { top: 0, left: 0 },
  javascript: { top: 0, left: 0 },
};

function buildDocument(html: string, css: string, javascript: string) {
  const safeCss = css.replace(/<\/style/gi, "<\\/style");
  const safeScript = javascript.replace(/<\/script/gi, "<\\/script");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${safeCss}</style>
</head>
<body>
  ${html}
  <script>
    (() => {
      const send = (type, args) => {
        try {
          window.parent.postMessage({
            source: "devkit-playground",
            type,
            message: args.map(value => {
              if (typeof value === "string") return value;
              if (value instanceof Error) return value.message;
              try {
                return JSON.stringify(value, null, 2) ?? String(value);
              } catch {
                return String(value);
              }
            }).join(" ")
          }, "*");
        } catch {}
      };

      ["log", "warn", "error"].forEach(method => {
        const original = console[method].bind(console);
        console[method] = (...args) => {
          original(...args);
          send(method, args);
        };
      });

      window.addEventListener("error", event => send("error", [event.message]));
      window.addEventListener("unhandledrejection", event => send("error", [event.reason]));

      try {
        ${safeScript}
      } catch (error) {
        console.error(error);
      }
    })();
  </script>
</body>
</html>`;
}

export default function CodePlayground() {
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [javascript, setJavaScript] = useState(initialJavaScript);
  const [previewDocument, setPreviewDocument] = useState("");
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [scrollPositions, setScrollPositions] =
    useState<Record<EditorTab, ScrollPosition>>(initialScrollPositions);

  const editorRefs = useRef<Record<EditorTab, HTMLTextAreaElement | null>>({
    html: null,
    css: null,
    javascript: null,
  });

  const lineNumberRefs = useRef<Record<EditorTab, HTMLDivElement | null>>({
    html: null,
    css: null,
    javascript: null,
  });

  const documentContent = useMemo(
    () => buildDocument(html, css, javascript),
    [html, css, javascript]
  );

  const activeValue =
    activeTab === "html" ? html : activeTab === "css" ? css : javascript;

  function updateActiveValue(value: string) {
    if (activeTab === "html") setHtml(value);
    else if (activeTab === "css") setCss(value);
    else setJavaScript(value);
  }

  function handleEditorScroll(tab: EditorTab, target: HTMLTextAreaElement) {
    const position = { top: target.scrollTop, left: target.scrollLeft };
    const lineNumbers = lineNumberRefs.current[tab];

    if (lineNumbers) {
      lineNumbers.scrollTop = position.top;
    }

    setScrollPositions((current) => ({
      ...current,
      [tab]: position,
    }));
  }

  useEffect(() => {
    const position = scrollPositions[activeTab];
    const editor = editorRefs.current[activeTab];
    const lineNumbers = lineNumberRefs.current[activeTab];

    if (editor) {
      editor.scrollTop = position.top;
      editor.scrollLeft = position.left;
    }

    if (lineNumbers) {
      lineNumbers.scrollTop = position.top;
    }
  }, [activeTab, scrollPositions]);

  function runCode() {
    setConsoleEntries([]);
    setPreviewDocument(documentContent);
  }

  function resetCode() {
    setHtml(initialHtml);
    setCss(initialCss);
    setJavaScript(initialJavaScript);
    setConsoleEntries([]);
    setScrollPositions(initialScrollPositions);
    setPreviewDocument(
      buildDocument(initialHtml, initialCss, initialJavaScript)
    );
    setActiveTab("html");
  }

  useEffect(() => {
    setPreviewDocument(
      buildDocument(initialHtml, initialCss, initialJavaScript)
    );
  }, []);

  useEffect(() => {
    if (!autoRun) return;

    const timeout = window.setTimeout(() => {
      setConsoleEntries([]);
      setPreviewDocument(documentContent);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [documentContent, autoRun]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || event.data.source !== "devkit-playground") return;

      const type = event.data.type;
      if (!["log", "warn", "error"].includes(type)) return;

      setConsoleEntries((current) => [
        ...current.slice(-99),
        { type, message: String(event.data.message ?? "") },
      ]);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(documentContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setConsoleEntries((current) => [
        ...current,
        {
          type: "error",
          message: "Clipboard access failed. Copy the code manually.",
        },
      ]);
      setConsoleOpen(true);
    }
  }

  function downloadCode() {
    const blob = new Blob([documentContent], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "devkit-playground.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
            <Code2 size={16} />
            Code Tools
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            HTML/CSS/JS Playground
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Write HTML, style it with CSS, add JavaScript, and preview your
            project in the browser.
          </p>
        </div>

        <button
          type="button"
          onClick={resetCode}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm transition hover:bg-[var(--surface-muted)]"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runCode}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Play size={16} />
            Run code
          </button>

          <label className="flex cursor-pointer items-center gap-2 px-2 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(event) => setAutoRun(event.target.checked)}
              className="accent-blue-600"
            />
            Auto-run
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm transition hover:bg-[var(--surface-muted)]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy HTML"}
          </button>

          <button
            type="button"
            onClick={downloadCode}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm transition hover:bg-[var(--surface-muted)]"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-3">
            <div className="flex items-center gap-1">
              {tabConfig.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === id
                      ? "bg-blue-500/10 font-semibold text-blue-500"
                      : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <span className="text-xs text-[var(--muted)]">
              {(activeTab === "html" ? html : activeTab === "css" ? css : javascript).split("\n").length} lines
            </span>
          </div>

          <div className="flex min-w-0 overflow-hidden">
            <div
              ref={(node) => {
                lineNumberRefs.current[activeTab] = node;
              }}
              aria-hidden="true"
              className="h-[520px] w-12 shrink-0 select-none overflow-hidden border-r border-[var(--border)] bg-[var(--background)] px-2 py-4 text-right font-mono text-xs leading-6 text-[var(--muted)]"
            >
              {Array.from(
                {
                  length: Math.max(
                    (activeTab === "html"
                      ? html
                      : activeTab === "css"
                        ? css
                        : javascript
                    ).split("\n").length,
                    18
                  ),
                },
                (_, index) => (
                  <div key={index} className="h-6">
                    {index + 1}
                  </div>
                )
              )}
            </div>

            <textarea
              ref={(node) => {
                editorRefs.current[activeTab] = node;
              }}
              value={
                activeTab === "html"
                  ? html
                  : activeTab === "css"
                    ? css
                    : javascript
              }
              onChange={(event) => {
                const value = event.target.value;
                if (activeTab === "html") setHtml(value);
                else if (activeTab === "css") setCss(value);
                else setJavaScript(value);
              }}
              onScroll={(event) =>
                handleEditorScroll(activeTab, event.currentTarget)
              }
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label={`${activeTab} code editor`}
              wrap="off"
              className="h-[520px] min-h-[520px] min-w-0 flex-1 resize-none overflow-auto whitespace-pre bg-[var(--background)] p-4 font-mono text-[13px] leading-6 text-[var(--foreground)] outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
            <span>{activeTab.toUpperCase()}</span>
            <span>Browser editor</span>
          </div>
        </section>

        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Eye size={17} className="text-blue-500" />
              Live preview
            </div>

            <span className="flex items-center gap-2 text-xs text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready
            </span>
          </div>

          <iframe
            title="Code playground preview"
            srcDoc={previewDocument}
            sandbox="allow-scripts"
            className="min-h-[520px] w-full flex-1 bg-white"
          />

          <div className="border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setConsoleOpen((open) => !open)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition hover:bg-[var(--surface-muted)]"
            >
              <span className="flex items-center gap-2">
                <Terminal size={16} />
                Console
                <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {consoleEntries.length}
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  consoleOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {consoleOpen && (
              <div className="max-h-52 min-h-20 overflow-auto border-t border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs">
                {consoleEntries.length === 0 ? (
                  <p className="py-4 text-center text-[var(--muted)]">
                    Console output will appear here.
                  </p>
                ) : (
                  consoleEntries.map((entry, index) => (
                    <div
                      key={`${index}-${entry.message}`}
                      className={`whitespace-pre-wrap break-words border-b border-[var(--border)] py-2 last:border-0 ${
                        entry.type === "error"
                          ? "text-red-500"
                          : entry.type === "warn"
                            ? "text-amber-500"
                            : "text-[var(--foreground)]"
                      }`}
                    >
                      <span className="mr-2 opacity-60">
                        {entry.type.toUpperCase()}
                      </span>
                      {entry.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs leading-5 text-[var(--muted)]">
        <strong className="text-[var(--foreground)]">Execution safety:</strong>{" "}
        JavaScript runs inside a sandboxed preview iframe. Treat code you run as
        untrusted, and do not enter secrets into code from unknown sources.
      </div>
    </div>
  );
}

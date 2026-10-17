
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import GlobalSidebar from "@/components/global-sidebar";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const SAMPLE_MARKDOWN = `# Welcome to DevKit Pro

A simple Markdown editor with a **live preview**.

## Features

- Write Markdown on the left
- Preview rendered content on the right
- Support GitHub Flavored Markdown
- Export your work as a \`.md\` file

## Code example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
\`\`\`

## Task list

- [x] Create a Markdown document
- [x] Preview the result
- [ ] Write something awesome

## Table

| Tool | Status |
| --- | --- |
| JSON Formatter | Ready |
| Markdown Editor | In progress |

> Good tools make developers more productive.

[Explore DevKit Pro](https://example.com)

---

**Tip:** Changes appear in the preview as you type.
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [notice, setNotice] = useState("");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setNotice("Markdown copied to clipboard.");
    } catch {
      setNotice("Clipboard access failed. Select and copy the text manually.");
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Markdown download started.");
  }

  function loadSample() {
    setMarkdown(SAMPLE_MARKDOWN);
    setNotice("Sample Markdown loaded.");
  }

  function clearEditor() {
    setMarkdown("");
    setNotice("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center
              rounded-xl bg-blue-500/10 text-blue-500">
              <FileText size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Markdown Editor
              </h1>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Write Markdown and preview the rendered document instantly.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1.5
            text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Live preview
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3
          border-t border-[var(--border)] pt-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex cursor-pointer items-center gap-2
                rounded-xl border border-[var(--border)] px-3 py-2.5
                text-sm hover:bg-[var(--surface-muted)]"
            >
              <Sparkles size={15} />
              Load sample
            </button>

            <button
              type="button"
              onClick={clearEditor}
              className="inline-flex cursor-pointer items-center gap-2
                rounded-xl border border-[var(--border)] px-3 py-2.5
                text-sm hover:bg-[var(--surface-muted)]"
            >
              <RotateCcw size={15} />
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyMarkdown()}
              className="inline-flex cursor-pointer items-center gap-2
                rounded-xl border border-[var(--border)] px-3 py-2.5
                text-sm hover:bg-[var(--surface-muted)]"
            >
              <Copy size={15} />
              Copy Markdown
            </button>

            <button
              type="button"
              onClick={downloadMarkdown}
              className="inline-flex cursor-pointer items-center gap-2
                rounded-xl bg-blue-600 px-3 py-2.5 text-sm
                font-semibold text-white hover:bg-blue-700"
            >
              <Download size={15} />
              Download .md
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
          <span>{markdown.length.toLocaleString()} characters</span>
          <span>{markdown ? markdown.split("\n").length : 0} lines</span>
          <span>{new Blob([markdown]).size.toLocaleString()} bytes</span>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border
        border-[var(--border)] bg-[var(--surface)]">
        <div className="flex border-b border-[var(--border)] p-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex flex-1 cursor-pointer items-center justify-center
              gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                mobileTab === "editor"
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-[var(--muted)]"
              }`}
          >
            <FileText size={16} /> Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex flex-1 cursor-pointer items-center justify-center
              gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                mobileTab === "preview"
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-[var(--muted)]"
              }`}
          >
            <Eye size={16} /> Preview
          </button>
        </div>

        <div className="grid md:grid-cols-2">
          <section className={`${mobileTab === "preview" ? "hidden" : ""}
            min-w-0 border-b border-[var(--border)] md:border-b-0
            md:border-r`}>
            <div className="flex h-[58px] items-center justify-between
              border-b border-[var(--border)] px-4 sm:px-5">
              <h2 className="text-sm font-semibold">Markdown source</h2>
              <span className="text-xs text-[var(--muted)]">.md</span>
            </div>

            <textarea
              value={markdown}
              onChange={(event) => {
                setMarkdown(event.target.value);
                setNotice("");
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Markdown source editor"
              placeholder="# Start writing Markdown..."
              className="min-h-[480px] max-h-[700px] w-full resize-y
                overflow-auto bg-transparent p-4 font-mono text-sm
                leading-7 outline-none placeholder:text-[var(--muted)]
                sm:p-5"
            />
          </section>

          <section className={`${mobileTab === "editor" ? "hidden" : ""}
            min-w-0`}>
            <div className="flex h-[58px] items-center justify-between
              border-b border-[var(--border)] px-4 sm:px-5">
              <h2 className="text-sm font-semibold">Live preview</h2>
              <span className="text-xs text-[var(--muted)]">Rendered</span>
            </div>

            <article className="prose prose-sm min-h-[480px] max-h-[700px]
              max-w-none overflow-auto p-4 text-[var(--foreground)]
              prose-headings:font-bold prose-headings:tracking-tight
              prose-a:text-blue-500 prose-a:underline
              prose-strong:text-[var(--foreground)]
              prose-code:break-words prose-code:rounded
              prose-code:bg-[var(--surface-muted)]
              prose-code:px-1 prose-code:py-0.5
              prose-code:before:content-none prose-code:after:content-none
              prose-pre:overflow-x-auto prose-pre:rounded-xl
              prose-pre:bg-[var(--background)]
              prose-pre:text-[var(--foreground)]
              prose-blockquote:border-l-blue-500
              prose-blockquote:text-[var(--muted)]
              prose-th:text-left
              prose-td:border-[var(--border)]
              prose-th:border-[var(--border)]
              sm:p-6">
              {markdown.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Your rendered Markdown will appear here as you type.
                </p>
              )}
            </article>
          </section>
        </div>
      </section>

      {notice && (
        <p role="status" className="text-sm text-[var(--muted)]">
          {notice}
        </p>
      )}

      <p className="text-xs leading-5 text-[var(--muted)]">
        Preview supports GitHub Flavored Markdown. Raw HTML is not enabled,
        helping prevent pasted HTML from executing in the preview.
      </p>
    </div>
  );
}


"use client";

import { useState } from "react";
import {
  Check,
  Clipboard,
  Code2,
  Download,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { format } from "sql-formatter";
import GlobalSidebar from "@/components/global-sidebar";

type SqlDialect =
  | "sql"
  | "mysql"
  | "mariadb"
  | "postgresql"
  | "sqlite"
  | "transactsql"
  | "plsql"
  | "bigquery"
  | "snowflake";

const SAMPLE_SQL = `select u.id, u.name, u.email, count(o.id) as total_orders
from users u
left join orders o on o.user_id = u.id
where u.status = 'active'
  and u.created_at >= '2026-01-01'
group by u.id, u.name, u.email
having count(o.id) > 0
order by total_orders desc
limit 20;`;

const DIALECTS: { label: string; value: SqlDialect }[] = [
  { label: "Standard SQL", value: "sql" },
  { label: "MySQL", value: "mysql" },
  { label: "MariaDB", value: "mariadb" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "SQLite", value: "sqlite" },
  { label: "SQL Server (T-SQL)", value: "transactsql" },
  { label: "PL/SQL", value: "plsql" },
  { label: "BigQuery", value: "bigquery" },
  { label: "Snowflake", value: "snowflake" },
];

function minifySql(sql: string): string {
  let output = "";
  let quote: "'" | '"' | "`" | "]" | null = null;
  let lineComment = false;
  let blockComment = false;
  let pendingSpace = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const next = sql[i + 1];

    if (lineComment) {
      if (char === "\n" || char === "\r") {
        lineComment = false;
        pendingSpace = true;
      }
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i++;
        pendingSpace = true;
      }
      continue;
    }

    if (quote) {
      output += char;

      if (quote === "]" && char === "]") {
        quote = null;
      } else if (char === "\\" && next) {
        output += next;
        i++;
      } else if (char === quote) {
        if (next === quote && quote !== "]") {
          output += next;
          i++;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === "-" && next === "-") {
      lineComment = true;
      i++;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      if (pendingSpace && output && !/[ (.,;]/.test(output[output.length - 1])) {
        output += " ";
      }
      pendingSpace = false;
      quote = char;
      output += char;
      continue;
    }

    if (char === "[") {
      if (pendingSpace && output && !/[ (.,;]/.test(output[output.length - 1])) {
        output += " ";
      }
      pendingSpace = false;
      quote = "]";
      output += char;
      continue;
    }

    if (/\s/.test(char)) {
      pendingSpace = true;
      continue;
    }

    if (",();.".includes(char)) {
      output = output.trimEnd();
      output += char;
      pendingSpace = false;
      continue;
    }

    if (
      pendingSpace &&
      output &&
      !/[ (.,;]/.test(output[output.length - 1]) &&
      !",);.".includes(char)
    ) {
      output += " ";
    }

    pendingSpace = false;
    output += char;
  }

  return output.trim();
}

export default function SqlFormatter() {
  const [sql, setSql] = useState(SAMPLE_SQL);
  const [dialect, setDialect] = useState<SqlDialect>("postgresql");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");

  function runFormat(mode: "format" | "minify") {
    setError("");
    setNotice("");

    if (!sql.trim()) {
      setOutput("");
      setError("Enter a SQL query first.");
      return;
    }

    try {
      const result =
        mode === "format"
          ? format(sql, {
              language: dialect,
              keywordCase: "upper",
              indentStyle: "standard",
              tabWidth: 2,
              linesBetweenQueries: 1,
            })
          : minifySql(sql);

      setOutput(result);
      setMobileTab("output");
      setNotice(mode === "format" ? "SQL formatted successfully." : "SQL minified successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process this SQL query."
      );
    }
  }

  async function copyOutput() {
    if (!output) {
      setError("Format or minify a query first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setNotice("Copied to clipboard.");
      setError("");
    } catch {
      setError("Clipboard access failed. Copy the output manually.");
    }
  }

  function downloadOutput() {
    if (!output) {
      setError("Format or minify a query first.");
      return;
    }

    const blob = new Blob([output], { type: "text/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "formatted-query.sql";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("SQL file downloaded.");
    setError("");
  }

  function loadSample() {
    setSql(SAMPLE_SQL);
    setOutput("");
    setError("");
    setNotice("Sample query loaded.");
    setMobileTab("input");
  }

  function clearAll() {
    setSql("");
    setOutput("");
    setError("");
    setNotice("");
    setMobileTab("input");
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-500">
            <Code2 size={20} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              SQL Tools
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            SQL Formatter
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Format, organize, and minify SQL queries with support for popular
            database dialects.
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

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm">
          <span className="whitespace-nowrap text-[var(--muted)]">
            SQL dialect
          </span>
          <select
            value={dialect}
            onChange={(event) => setDialect(event.target.value as SqlDialect)}
            className="min-w-0 flex-1 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-blue-500 sm:flex-none"
          >
            {DIALECTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runFormat("format")}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:flex-none"
          >
            <Sparkles size={16} />
            Format SQL
          </button>
          <button
            type="button"
            onClick={() => runFormat("minify")}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)] sm:flex-none"
          >
            <RotateCcw size={16} />
            Minify
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
        <div
          className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] ${
            mobileTab === "output" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Code2 size={16} className="text-blue-500" />
              Input SQL
            </div>
            <span className="text-xs text-[var(--muted)]">
              {sql.length.toLocaleString()} characters
            </span>
          </div>
          <textarea
            value={sql}
            onChange={(event) => {
              setSql(event.target.value);
              setError("");
              setNotice("");
            }}
            spellCheck={false}
            aria-label="Input SQL query"
            placeholder="Paste your SQL query here..."
            className="h-[420px] w-full resize-y overflow-auto bg-[var(--background)] p-4 font-mono text-sm leading-6 outline-none placeholder:text-[var(--muted)]"
          />
        </div>

        <div
          className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] ${
            mobileTab === "input" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Check size={16} className="text-emerald-500" />
              Output SQL
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyOutput}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
              >
                <Clipboard size={14} />
                Copy
              </button>
              <button
                type="button"
                onClick={downloadOutput}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
          <pre className="h-[420px] overflow-auto bg-[var(--background)] p-4 font-mono text-sm leading-6">
            <code className="whitespace-pre-wrap break-words">
              {output || (
                <span className="text-[var(--muted)]">
                  Formatted SQL will appear here...
                </span>
              )}
            </code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("input")}
          className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
            mobileTab === "input"
              ? "border-blue-500 bg-blue-500/10 text-blue-500"
              : "border-[var(--border)]"
          }`}
        >
          Input
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("output")}
          className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
            mobileTab === "output"
              ? "border-blue-500 bg-blue-500/10 text-blue-500"
              : "border-[var(--border)]"
          }`}
        >
          Output
        </button>
      </div>
    </section>
  );
}

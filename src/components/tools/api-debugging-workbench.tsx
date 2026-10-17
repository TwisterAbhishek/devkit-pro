
"use client";

import { useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  Bug,
  CheckCircle2,
  GitCompare,
  History,
  Play,
  Plus,
  Save,
  ShieldCheck,
} from "lucide-react";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export default function ApiDebuggingWorkbench() {
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState<
    "request" | "comparison" | "diagnostics"
  >("request");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
            <Activity size={16} />
            Developer workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            API Debugging Workbench
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Send API requests, investigate response differences, and diagnose
            integration problems from one workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <History size={16} />
            History
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Request testing",
            description: "Send HTTP requests and inspect responses.",
            icon: Play,
          },
          {
            title: "Response comparison",
            description: "Identify changes between two API responses.",
            icon: GitCompare,
          },
          {
            title: "Diagnostics",
            description: "Investigate errors and response structure.",
            icon: Bug,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Icon size={20} />
              </div>

              <h2 className="font-semibold">{item.title}</h2>

              <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap gap-1 border-b border-[var(--border)] p-2">
          {[
            { id: "request", label: "Request builder" },
            { id: "comparison", label: "Compare responses" },
            { id: "diagnostics", label: "Diagnostics" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as "request" | "comparison" | "diagnostics"
                )
              }
              className={`rounded-lg px-3 py-2 text-sm transition ${
                activeTab === tab.id
                  ? "bg-blue-500/10 font-semibold text-blue-500"
                  : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {activeTab === "request" && (
            <>
              <div>
                <h2 className="font-semibold">Send an API request</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Enter an endpoint to begin investigating an API.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={method}
                  onChange={(event) =>
                    setMethod(event.target.value as RequestMethod)
                  }
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                  aria-label="HTTP method"
                >
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://api.example.com/users"
                  aria-label="API endpoint URL"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  disabled={!url.trim()}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Request execution will be implemented in the next step"
                >
                  <Play size={16} />
                  Send request
                </button>
              </div>

              <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center sm:p-10">
                <Activity className="mx-auto mb-3 text-[var(--muted)]" size={28} />

                <h3 className="font-medium">Response workspace</h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Request status, response headers, timing, and formatted JSON
                  will appear here once request execution is connected.
                </p>
              </div>
            </>
          )}

          {activeTab === "comparison" && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center sm:p-10">
              <ArrowLeftRight
                className="mx-auto mb-3 text-[var(--muted)]"
                size={28}
              />

              <h2 className="font-semibold">Compare API responses</h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                The comparison engine will highlight added fields, removed
                fields, and changed values between two JSON responses.
              </p>
            </div>
          )}

          {activeTab === "diagnostics" && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center sm:p-10">
              <ShieldCheck
                className="mx-auto mb-3 text-[var(--muted)]"
                size={28}
              />

              <h2 className="font-semibold">Response diagnostics</h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                Diagnostic checks and reproducible bug reports will be added
                after the request and comparison engines are implemented.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={19} />

        <div>
          <p className="text-sm font-medium">Privacy-conscious by design</p>
          <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
            Use trusted endpoints and avoid sending credentials or sensitive
            data to services you do not control. Requests and response handling
            will be implemented in a subsequent step.
          </p>
        </div>

        <button
          type="button"
          aria-label="Create another request"
          onClick={() => {
            setMethod("GET");
            setUrl("");
            setActiveTab("request");
          }}
          className="ml-auto shrink-0 rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import {
  Activity,
  Bug,
  CheckCircle2,
  GitCompare,
  History,
  Play,
  Plus,
  Save,
  ShieldCheck,
} from "lucide-react";
import ApiResponseComparison from "@/components/tools/api-response-comparison";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiResponse = {
    status: number;
    statusText: string;
    duration: number;
    body: string;
    headers: Record<string, string>;
  };

export default function ApiDebuggingWorkbench() {
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState<
    "request" | "comparison" | "diagnostics"
  >("request");

  const [headers, setHeaders] = useState([
    { id: 1, key: "Accept", value: "application/json" },
  ]);
  
  const [nextHeaderId, setNextHeaderId] = useState(2);
  const [body, setBody] = useState(
    JSON.stringify({ name: "John Doe", email: "john@example.com" }, null, 2)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [requestError, setRequestError] = useState("");

  const sendRequest = async () => {
    let endpoint: URL;

    try {
      endpoint = new URL(url.trim());

      if (!['http:', 'https:'].includes(endpoint.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported.');
      }
    } catch {
      setRequestError('Enter a valid HTTP or HTTPS URL.');
      setResponse(null);
      return;
    }

    const sendsBody = ['POST', 'PUT', 'PATCH'].includes(method);
    let requestBody: string | undefined;

    if (sendsBody) {
      try {
        JSON.parse(body);
        requestBody = body;
      } catch {
        setRequestError('Invalid JSON in request body. Please correct it before sending.');
        setResponse(null);
        return;
      }
    }

    const requestHeaders: Record<string, string> = {};

    for (const header of headers) {
      const key = header.key.trim();
      if (key) {
        requestHeaders[key] = header.value;
      }
    }

    const hasHeader = (name: string) =>
      Object.keys(requestHeaders).some(
        (key) => key.toLowerCase() === name.toLowerCase()
      );

    if (!hasHeader('Accept')) {
      requestHeaders.Accept = 'application/json, text/plain, */*';
    }

    // Only add Content-Type when a request body is being sent.
    if (sendsBody && !hasHeader('Content-Type')) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    setIsLoading(true);
    setResponse(null);
    setRequestError('');

    const startedAt = performance.now();

    try {
      const result = await fetch(endpoint.toString(), {
        method,
        headers: requestHeaders,
        ...(requestBody !== undefined ? { body: requestBody } : {}),
      });

      const responseBody = await result.text();
      const duration = Math.round(performance.now() - startedAt);

      setResponse({
        status: result.status,
        statusText: result.statusText,
        duration,
        body: responseBody,
        headers: Object.fromEntries(result.headers.entries()),
      });
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? `${error.message}. The request may be blocked by CORS or a network error.`
          : 'The request failed due to an unknown error.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
                onClick={sendRequest}
                disabled={!url.trim() || isLoading}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                <Play size={16} />
                {isLoading ? "Sending..." : "Send request"}
                </button>
              </div>

            {/* Request Headers */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Request headers</h3>

                    <button
                    type="button"
                    onClick={() => {
                        setHeaders((current) => [
                        ...current,
                        { id: nextHeaderId, key: "", value: "" },
                        ]);
                        setNextHeaderId((id) => id + 1);
                    }}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
                    >
                    + Add header
                    </button>
                </div>

                {headers.map((header) => (
                    <div
                    key={header.id}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
                    >
                    <input
                        value={header.key}
                        onChange={(event) =>
                        setHeaders((current) =>
                            current.map((item) =>
                            item.id === header.id
                                ? { ...item, key: event.target.value }
                                : item
                            )
                        )
                        }
                        placeholder="Header name"
                        aria-label="Header name"
                        className="h-10 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                    />

                    <input
                        value={header.value}
                        onChange={(event) =>
                        setHeaders((current) =>
                            current.map((item) =>
                            item.id === header.id
                                ? { ...item, value: event.target.value }
                                : item
                            )
                        )
                        }
                        placeholder="Header value"
                        aria-label="Header value"
                        className="h-10 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                    />

                    <button
                        type="button"
                        onClick={() =>
                        setHeaders((current) =>
                            current.filter((item) => item.id !== header.id)
                        )
                        }
                        aria-label="Remove header"
                        className="h-10 rounded-lg px-3 text-sm text-red-500 hover:bg-red-500/10"
                    >
                        Remove
                    </button>
                    </div>
                ))}
            </div>

            {/* Request Body */}
            {["POST", "PUT", "PATCH"].includes(method) && (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                <h3 className="font-semibold">Request body</h3>
                <span className="text-xs text-[var(--muted)]">JSON</span>
                </div>

                <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                spellCheck={false}
                aria-label="JSON request body"
                placeholder={'{\n  "name": "John Doe"\n}'}
                rows={9}
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 outline-none focus:border-blue-500"
                />

                <p className="text-xs text-[var(--muted)]">
                Enter a valid JSON object or array. The body is sent with POST, PUT, and PATCH requests.
                </p>
            </div>
            )}

              <div className="space-y-4">
                {requestError && (
                    <div
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500"
                    >
                    <p className="font-semibold">Request failed</p>
                    <p className="mt-1 break-words">{requestError}</p>
                    </div>
                )}

                {response && (
                    <>
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] p-4">
                        <span
                        className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                            response.status >= 200 && response.status < 300
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                        >
                        {response.status} {response.statusText}
                        </span>

                        <span className="text-sm text-[var(--muted)]">
                        {response.duration} ms
                        </span>

                        <span className="text-sm text-[var(--muted)]">
                        {response.body.length} characters
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                        <div className="border-b border-[var(--border)] px-4 py-3 font-semibold">
                        Response body
                        </div>

                        <pre className="max-h-[500px] overflow-auto p-4 text-sm leading-6">
                        <code>
                            {(() => {
                            try {
                                return JSON.stringify(JSON.parse(response.body), null, 2);
                            } catch {
                                return response.body || "(Empty response body)";
                            }
                            })()}
                        </code>
                        </pre>
                    </div>

                    <details className="rounded-xl border border-[var(--border)] p-4">
                        <summary className="cursor-pointer text-sm font-semibold">
                        Response headers
                        </summary>

                        <pre className="mt-3 overflow-auto text-xs leading-6">
                        {JSON.stringify(response.headers, null, 2)}
                        </pre>
                    </details>
                    </>
                )}

                {!response && !requestError && (
                    <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center sm:p-10">
                    <Activity
                        className="mx-auto mb-3 text-[var(--muted)]"
                        size={28}
                    />

                    <h3 className="font-medium">
                        {isLoading ? "Waiting for response..." : "Response workspace"}
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                        {isLoading
                        ? "Your request is in progress."
                        : "HTTP status, response time, headers, and response body will appear here."}
                    </p>
                    </div>
                )}
                </div>
            </>
          )}

            {activeTab === "comparison" && <ApiResponseComparison />}

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
            data to services you do not control. Requests are sent directly from your browser. Avoid sending credentials or sensitive
            data to services you do not trust.
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


"use client";

import { useState } from "react";
import {
  Activity,
  Clock3,
  Copy,
  Download,
  FileJson,
  LoaderCircle,
  Send,
  Trash2,
} from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiResponse = {
  status: number;
  statusText: string;
  duration: number;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  size: number;
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const SAMPLE_HEADERS = JSON.stringify(
  {
    Accept: "application/json",
  },
  null,
  2
);

const SAMPLE_BODY = JSON.stringify(
  {
    title: "DevKit Pro",
    completed: false,
    userId: 1,
  },
  null,
  2
);

export default function ApiRequestTester() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [headersText, setHeadersText] = useState(SAMPLE_HEADERS);
  const [body, setBody] = useState(SAMPLE_BODY);
  const [activeTab, setActiveTab] = useState<"headers" | "body">("headers");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function sendRequest() {
    setError("");
    setNotice("");
    setResponse(null);

    let parsedUrl: URL;
    let parsedHeaders: unknown;

    try {
      parsedUrl = new URL(url.trim());

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported.");
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("Only HTTP")
          ? err.message
          : "Enter a valid absolute URL, including https:// or http://."
      );
      return;
    }

    try {
      parsedHeaders = JSON.parse(headersText || "{}");

      if (
        !parsedHeaders ||
        typeof parsedHeaders !== "object" ||
        Array.isArray(parsedHeaders)
      ) {
        throw new Error("Headers must be a JSON object.");
      }

      for (const [key, value] of Object.entries(parsedHeaders)) {
        if (typeof value !== "string") {
          throw new Error(`Header "${key}" must have a string value.`);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Invalid headers: ${err.message}`
          : "Headers must be valid JSON."
      );
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    const startedAt = performance.now();

    setLoading(true);

    try {
      const requestBody =
        method === "GET" || method === "DELETE"
          ? undefined
          : body;

      const result = await fetch(parsedUrl.toString(), {
        method,
        headers: parsedHeaders as Record<string, string>,
        body: requestBody,
        signal: controller.signal,
      });
      
    const rawBody = await result.text();

      let formattedBody = rawBody;
      const contentType = result.headers.get("content-type") ?? "";

      if (rawBody && contentType.includes("json")) {
        try {
          formattedBody = JSON.stringify(JSON.parse(rawBody), null, 2);
        } catch {
          // Preserve the original response if the server returns invalid JSON.
        }
      }

      const responseHeaders: Record<string, string> = {};
      result.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: result.status,
        statusText: result.statusText,
        duration: Math.round(performance.now() - startedAt),
        headers: responseHeaders,
        body: formattedBody,
        contentType,
        size: new TextEncoder().encode(rawBody).length,
      });

      setResponseTab("body");
    } catch (err) {
      if (controller.signal.aborted) {
        setError("Request timed out after 30 seconds.");
      } else {
        setError(
          err instanceof Error
            ? `${err.message}. Check the URL, network connection, and the API's CORS policy.`
            : "Request failed. Check the URL and network connection."
        );
      }
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Clipboard access failed. Select and copy the text manually.");
    }
  }

  function downloadResponse() {
    if (!response) return;

    const blob = new Blob([response.body], {
      type: "text/plain;charset=utf-8",
    });

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "api-response.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function clearRequest() {
    setUrl("");
    setHeadersText("{}");
    setBody("");
    setResponse(null);
    setError("");
    setNotice("");
  }

  const statusColor =
    !response
      ? ""
      : response.status >= 200 && response.status < 300
        ? "text-emerald-500"
        : response.status >= 400
          ? "text-rose-500"
          : "text-amber-500";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)]
        bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center
            rounded-xl bg-cyan-500/10 text-cyan-500">
            <Activity size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              API Request Tester
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Send HTTP requests and inspect API responses.
            </p>
          </div>
        </div>

        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!loading) void sendRequest();
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              aria-label="HTTP method"
              value={method}
              onChange={(event) => setMethod(event.target.value as HttpMethod)}
              className="h-12 cursor-pointer rounded-xl border
                border-[var(--border)] bg-[var(--background)]
                px-3 text-sm font-semibold outline-none sm:w-32"
            >
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="url"
              required
              aria-label="Request URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://api.example.com/resource"
              className="h-12 min-w-0 flex-1 rounded-xl border
                border-[var(--border)] bg-[var(--background)]
                px-4 font-mono text-sm outline-none
                focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 cursor-pointer items-center
                justify-center gap-2 rounded-xl bg-blue-600 px-5
                text-sm font-semibold text-white hover:bg-blue-700
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Sample endpoint: JSONPlaceholder
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setUrl("https://jsonplaceholder.typicode.com/posts/1");
                setMethod("GET");
                setHeadersText(SAMPLE_HEADERS);
                setResponse(null);
                setError("");
                setNotice("");
              }}
              className="cursor-pointer rounded-lg border
                border-[var(--border)] px-3 py-2 text-xs
                hover:bg-[var(--surface-muted)]"
            >
              Load GET sample
            </button>
            <button
              type="button"
              onClick={() => {
                setUrl("https://jsonplaceholder.typicode.com/posts");
                setMethod("POST");
                setHeadersText(
                  JSON.stringify(
                    {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    null,
                    2
                  )
                );
                setBody(SAMPLE_BODY);
                setResponse(null);
                setError("");
                setNotice("");
              }}
              className="cursor-pointer rounded-lg border
                border-[var(--border)] px-3 py-2 text-xs
                hover:bg-[var(--surface-muted)]"
            >
              Load POST sample
            </button>
            <button
              type="button"
              onClick={clearRequest}
              className="inline-flex cursor-pointer items-center gap-1.5
                rounded-lg px-3 py-2 text-xs text-[var(--muted)]
                hover:bg-[var(--surface-muted)]"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border
        border-[var(--border)] bg-[var(--surface)]">
        <div className="flex gap-1 border-b border-[var(--border)] p-2">
          {(["headers", "body"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer rounded-lg px-4 py-2.5 text-sm
                font-medium capitalize ${
                  activeTab === tab
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                }`}
            >
              {tab === "headers" ? "Request headers" : "Request body"}
            </button>
          ))}
        </div>

        {activeTab === "headers" ? (
          <div className="p-4 sm:p-5">
            <p className="mb-3 text-xs leading-5 text-[var(--muted)]">
              Enter headers as a JSON object. For example,
              {" "}{"{"}"Authorization": "Bearer YOUR_TOKEN"{"}"}.
            </p>
            <textarea
              value={headersText}
              onChange={(event) => setHeadersText(event.target.value)}
              spellCheck={false}
              aria-label="Request headers JSON"
              className="min-h-[180px] max-h-[440px] w-full resize-y
                overflow-auto rounded-xl border border-[var(--border)]
                bg-[var(--background)] p-4 font-mono text-sm
                leading-6 outline-none focus:border-blue-500"
            />
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <p className="mb-3 text-xs leading-5 text-[var(--muted)]">
              Request bodies are sent for POST, PUT, and PATCH. GET and DELETE
              requests omit the body.
            </p>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              spellCheck={false}
              aria-label="Request body"
              className="min-h-[180px] max-h-[440px] w-full resize-y
                overflow-auto rounded-xl border border-[var(--border)]
                bg-[var(--background)] p-4 font-mono text-sm
                leading-6 outline-none focus:border-blue-500"
            />
          </div>
        )}
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/20
          bg-rose-500/5 p-4 text-sm text-rose-500">
          <strong>Request failed</strong>
          <p className="mt-1 break-words">{error}</p>
        </div>
      )}

      {response && (
        <>
          <section className="rounded-2xl border border-[var(--border)]
            bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Response</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {response.contentType || "Content type unavailable"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className={`rounded-full bg-[var(--surface-muted)]
                  px-3 py-2 font-semibold ${statusColor}`}>
                  {response.status} {response.statusText}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full
                  bg-[var(--surface-muted)] px-3 py-2 text-[var(--muted)]">
                  <Clock3 size={14} />
                  {response.duration} ms
                </span>
                <span className="rounded-full bg-[var(--surface-muted)]
                  px-3 py-2 text-[var(--muted)]">
                  {response.size.toLocaleString()} bytes
                </span>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border
            border-[var(--border)] bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between
              gap-3 border-b border-[var(--border)] p-3">
              <div className="flex gap-1">
                {(["body", "headers"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setResponseTab(tab)}
                    className={`cursor-pointer rounded-lg px-3 py-2
                      text-sm font-medium capitalize ${
                        responseTab === tab
                          ? "bg-blue-500/10 text-blue-500"
                          : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                      }`}
                  >
                    {tab === "body" ? "Response body" : "Response headers"}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void copyText(
                      responseTab === "body"
                        ? response.body
                        : JSON.stringify(response.headers, null, 2)
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5
                    rounded-lg border border-[var(--border)] px-3 py-2
                    text-xs hover:bg-[var(--surface-muted)]"
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  type="button"
                  onClick={downloadResponse}
                  className="inline-flex cursor-pointer items-center gap-1.5
                    rounded-lg border border-[var(--border)] px-3 py-2
                    text-xs hover:bg-[var(--surface-muted)]"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            {responseTab === "body" ? (
              <pre className="min-h-[200px] max-h-[520px] overflow-auto
                whitespace-pre-wrap break-words p-5 font-mono text-xs
                leading-6 sm:text-sm">
                {response.body || "The response body is empty."}
              </pre>
            ) : (
              <pre className="min-h-[200px] max-h-[520px] overflow-auto
                whitespace-pre-wrap break-words p-5 font-mono text-xs
                leading-6 sm:text-sm">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            )}
          </section>
        </>
      )}

      {notice && (
        <p role="status" className="text-sm text-[var(--muted)]">
          {notice}
        </p>
      )}

      <p className="text-xs leading-5 text-[var(--muted)]">
        Requests are sent from your browser to the destination API. Only send
        requests to services you are authorized to access. Avoid placing
        sensitive tokens in shared devices or untrusted URLs.
      </p>
    </div>
  );
}

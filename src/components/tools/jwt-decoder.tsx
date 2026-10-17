
"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, KeyRound, ShieldAlert } from "lucide-react";
import GlobalSidebar from "@/components/global-sidebar";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlzcyI6ImRldmtpdC1wcm8iLCJpYXQiOjE3NjA2NzM2MDAsImV4cCI6NDEwMjQ0NDgwMH0.signature";

type DecodedToken = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
};

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function decodeJwt(token: string): DecodedToken {
  const parts = token.trim().split(".");

  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error(
      "A compact JWT must contain three non-empty sections separated by dots."
    );
  }

  let header: unknown;
  let payload: unknown;

  try {
    header = JSON.parse(decodeBase64Url(parts[0]));
    payload = JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    throw new Error(
      "The header or payload is not valid Base64URL-encoded JSON."
    );
  }

  if (
    !header ||
    typeof header !== "object" ||
    Array.isArray(header) ||
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new Error("The JWT header and payload must be JSON objects.");
  }

  return {
    header: header as Record<string, unknown>,
    payload: payload as Record<string, unknown>,
  };
}

function formatClaim(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function isUnixTimestampClaim(name: string, value: unknown) {
  return (
    ["iat", "exp", "nbf"].includes(name) &&
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");

  const result = useMemo(() => {
    if (!token.trim()) {
      return { decoded: null, error: "" };
    }

    try {
      return { decoded: decodeJwt(token), error: "" };
    } catch (error) {
      return {
        decoded: null,
        error: error instanceof Error ? error.message : "Unable to decode token.",
      };
    }
  }, [token]);

  const expiration = result.decoded?.payload.exp;
  const expirationStatus =
    typeof expiration !== "number" || !Number.isFinite(expiration)
      ? "unknown"
      : expiration <= Date.now() / 1000
        ? "expired"
        : "active";

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied to clipboard.");
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
            <KeyRound size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">JWT Decoder</h1>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Decode JSON Web Token headers and payloads in your browser.
            </p>
          </div>
        </div>

        <label htmlFor="jwt-token" className="mt-6 block text-sm font-semibold">
          JSON Web Token
        </label>
        <textarea
          id="jwt-token"
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setNotice("");
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="Paste your JWT here..."
          className="mt-2 min-h-[140px] max-h-[300px] w-full resize-y
            overflow-auto rounded-xl border border-[var(--border)]
            bg-[var(--background)] p-4 font-mono text-xs leading-6
            outline-none focus:border-blue-500 sm:text-sm"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setToken(SAMPLE_TOKEN);
              setNotice("");
            }}
            className="cursor-pointer rounded-xl border border-[var(--border)]
              px-4 py-3 text-sm hover:bg-[var(--surface-muted)]"
          >
            Load sample token
          </button>
          <button
            type="button"
            onClick={() => {
              setToken("");
              setNotice("");
            }}
            className="cursor-pointer rounded-xl px-4 py-3 text-sm
              text-[var(--muted)] hover:bg-[var(--surface-muted)]"
          >
            Clear
          </button>
        </div>
      </section>

      {result.error && (
        <div role="alert" className="rounded-xl border border-rose-500/20
          bg-rose-500/5 p-4 text-sm text-rose-500">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert size={18} />
            Unable to decode token
          </div>
          <p className="mt-2 break-words">{result.error}</p>
        </div>
      )}

      {result.decoded && (
        <>
          <section className="rounded-2xl border border-[var(--border)]
            bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Token status</h2>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                expirationStatus === "expired"
                  ? "bg-rose-500/10 text-rose-500"
                  : expirationStatus === "active"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
              }`}>
                {expirationStatus === "expired"
                  ? "Expiration time has passed"
                  : expirationStatus === "active"
                    ? "Expiration time is in the future"
                    : "Expiration not established"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              This status checks only the <code>exp</code> claim when it is
              present. It does not prove that the token is authentic or
              currently accepted by a server.
            </p>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            {([
              ["Header", result.decoded.header],
              ["Payload", result.decoded.payload],
            ] as const).map(([title, data]) => (
              <section key={title} className="overflow-hidden rounded-2xl
                border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center justify-between
                  border-b border-[var(--border)] px-5 py-4">
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <button
                    type="button"
                    onClick={() => void copyValue(JSON.stringify(data, null, 2))}
                    aria-label={`Copy ${title.toLowerCase()}`}
                    className="cursor-pointer rounded-lg border
                      border-[var(--border)] p-2 hover:bg-[var(--surface-muted)]"
                  >
                    <Copy size={15} />
                  </button>
                </div>

                <pre className="max-h-[440px] min-h-[180px] overflow-auto
                  whitespace-pre-wrap break-words p-5 font-mono text-xs
                  leading-6 sm:text-sm">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </section>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border
            border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-sm font-semibold">Claims inspector</h2>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {Object.entries(result.decoded.payload).map(([name, value]) => (
                <div key={name} className="grid gap-2 px-5 py-4 sm:grid-cols-2">
                  <div>
                    <code className="text-sm font-semibold">{name}</code>
                    {isUnixTimestampClaim(name, value) &&
                    typeof value === "number" &&
                    Number.isFinite(value) && (
                        <p className="mt-1 break-words text-xs text-[var(--muted)]">
                        {new Date(value * 1000).toLocaleString()}
                        </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words font-mono text-sm">
                      {formatClaim(value)}
                    </p>
                        {isUnixTimestampClaim(name, value) &&
                        typeof value === "number" &&
                        Number.isFinite(value) && (
                            <p className="mt-1 break-words text-xs text-[var(--muted)]">
                            {new Date(value * 1000).toLocaleString()}
                            </p>
                        )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="flex items-start gap-2 rounded-xl border
            border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5
            text-[var(--muted)]">
            <ShieldAlert size={17} className="mt-0.5 shrink-0 text-amber-500" />
            Decoding is not signature verification. Never rely on these
            displayed claims for authorization, and avoid pasting production
            secrets or sensitive tokens into shared devices.
          </p>
        </>
      )}

      {notice && (
        <p role="status" className="text-sm text-[var(--muted)]">
          {notice}
        </p>
      )}

      {!result.decoded && !result.error && (
        <div className="flex items-center gap-2 rounded-xl border
          border-[var(--border)] bg-[var(--surface)] p-4 text-sm
          text-[var(--muted)]">
          <CheckCircle2 size={17} className="text-blue-500" />
          Decoded header and payload will appear here.
        </div>
      )}
    </div>
  );
}

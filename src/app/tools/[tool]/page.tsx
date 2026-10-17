
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UtilityTool from "@/components/tools/utility-tool";
import SiteHeader from "@/components/site-header";

import RegexTester from "@/components/tools/regex-tester";
import JwtDecoder from "@/components/tools/jwt-decoder";
import HashGenerator from "@/components/tools/hash-generator";
import ApiRequestTester from "@/components/tools/api-request-tester";
import MarkdownEditor from "@/components/tools/markdown-editor";
import SqlFormatter from "@/components/tools/sql-formatter";
import DiffChecker from "@/components/tools/diff-checker";
import ColorConverter from "@/components/tools/color-converter";
import GradientGenerator from "@/components/tools/gradient-generator";
import CodePlayground from "@/components/tools/code-playground";
import ApiDebuggingWorkbench from "@/components/tools/api-debugging-workbench";

const availableTools = [
  "code-beautifier",
  "base64",
  "url-encoder",
  "uuid-generator",
  "regex-tester",
  "jwt-decoder",
  "hash-generator",
  "api-request-tester",
  "api-debugging-workbench",
  "markdown-editor",
  "sql-formatter",
  "diff-checker",
  "color-converter",
  "gradient-generator",
  "code-playground",
] as const;


type ToolSlug = (typeof availableTools)[number];

const metadataByTool: Record<ToolSlug, Metadata> = {
  "api-debugging-workbench": {
    title: "API Debugging Workbench | DevKit Pro",
    description:
      "Debug APIs, compare JSON responses, and investigate integration issues in one developer workspace.",
  },
  "code-playground": {
    title: "HTML/CSS/JS Playground",
    description:
      "Write HTML, CSS, and JavaScript in separate editors and preview your code live.",
  },
  "gradient-generator": {
    title: "CSS Gradient Generator",
    description:
      "Create linear and radial gradients, customize color stops, and export CSS.",
  },
  "color-converter": {
    title: "Color Converter",
    description:
      "Convert colors between HEX, RGB, and HSL with a live preview.",
  },
  "diff-checker": {
    title: "Diff Checker",
    description:
      "Compare text, code, SQL, and configuration files with highlighted additions and removals.",
  },
  "sql-formatter": {
    title: "SQL Formatter",
    description:
      "Format and minify SQL queries with support for popular database dialects.",
  },
  "markdown-editor": {
    title: "Markdown Editor",
    description:
      "Write Markdown with a live preview and export documents as Markdown files.",
  },
  "api-request-tester": {
    title: "API Request Tester",
    description:
      "Send HTTP requests and inspect response status, headers, timing, and body.",
  },
  "hash-generator": {
    title: "Hash Generator",
    description:
      "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text or files.",
  },
  "code-beautifier": {
    title: "Code Beautifier",
    description: "Format JavaScript, HTML and CSS in your browser.",
  },
  base64: {
    title: "Base64 Encoder and Decoder",
    description: "Encode and decode Base64 text locally.",
  },
  "url-encoder": {
    title: "URL Encoder and Decoder",
    description: "Encode and decode URL components.",
  },
  "uuid-generator": {
    title: "UUID Generator",
    description: "Generate UUIDs directly in your browser.",
  },
  "regex-tester": {
    title: "Regex Tester",
    description: "Test regular expressions, inspect matches, and explore capture groups.",
  },
  "jwt-decoder": {
    title: "JWT Decoder",
    description: "Decode JWT headers, inspect claims, and check expiration timestamps.",
  },
};

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;

  if (!availableTools.includes(tool as ToolSlug)) {
    return { title: "Tool Not Found | DevKit Pro" };
  }

  return metadataByTool[tool as ToolSlug];
}

export default async function UtilityPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;

  if (!availableTools.includes(tool as ToolSlug)) {
    notFound();
  }

  return (
    <>


<SiteHeader
  breadcrumb={
    tool === "code-beautifier"
      ? "Code Beautifier"
      : tool === "base64"
        ? "Base64 Encoder / Decoder"
        : tool === "url-encoder"
          ? "URL Encoder / Decoder"
          : tool === "uuid-generator"
            ? "UUID Generator"
            : tool === "regex-tester"
              ? "Regex Tester"
              : tool === "jwt-decoder"
                ? "JWT Decoder"
                : tool === "hash-generator"
                  ? "Hash Generator"
                  : tool === "api-request-tester"
                    ? "API Request Tester"
                    : tool === "markdown-editor"
                      ? "Markdown Editor"
                      : tool === "sql-formatter"
                        ? "SQL Formatter"
                        : tool === "diff-checker"
                          ? "Diff Checker"
                          : tool === "color-converter"
                            ? "Color Converter"
                            : tool === "gradient-generator"
                              ? "CSS Gradient Generator"
                              : tool === "code-playground"
                                ? "HTML/CSS/JS Playground"
                                : tool === "code-playground"
                                  ? "HTML/CSS/JS Playground"
                                  : tool === "api-debugging-workbench"
                                    ? "API Debugging Workbench"
                                    : "JSON Formatter"
                                }
/>

  
      <main className="mx-auto min-h-screen max-w-[1500px] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-[var(--muted)] transition hover:text-blue-500"
          >
            ← Back to DevKit Pro
          </a>
        </div>

        {tool === "regex-tester" ? (
          <RegexTester />
        ) : tool === "jwt-decoder" ? (
          <JwtDecoder />
        ) : tool === "hash-generator" ? (
          <HashGenerator />
        ) : tool === "api-request-tester" ? (
          <ApiRequestTester />
        ) : tool === "markdown-editor" ? (
          <MarkdownEditor />
        ) : tool === "sql-formatter" ? (
          <SqlFormatter />
        ) : tool === "diff-checker" ? (
          <DiffChecker />
        ) : tool === "color-converter" ? (
          <ColorConverter />
        ) : tool === "gradient-generator" ? (
          <GradientGenerator />
        )
        : tool === "code-playground" ? (
          <CodePlayground />
        ) : tool === "api-debugging-workbench" ? (
          <ApiDebuggingWorkbench />
        ) : (
          <UtilityTool
            slug={
              tool as
                | "code-beautifier"
                | "base64"
                | "url-encoder"
                | "uuid-generator"
            }
          />
        )}

      </main>
    </>
  );
}

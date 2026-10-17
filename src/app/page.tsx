
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  Braces,
  ChevronRight,
  Code2,
  Database,
  FileCode2,
  FileDiff,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  KeyRound,
  Palette,
  Regex,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
  Blend,
} from "lucide-react";
import SiteHeader from "@/components/site-header";
import GlobalSidebar from "@/components/global-sidebar";

const navigation = [
  { label: "Home", icon: Terminal },
  { label: "JSON Tools", icon: Braces },
  { label: "Code Tools", icon: Code2 },
  { label: "API Tools", icon: Send },
  { label: "Text Tools", icon: FileCode2 },
  { label: "Writing Tools", icon: FileText },
  { label: "Converters", icon: ArrowLeftRight },
  { label: "Generators", icon: Fingerprint },
  { label: "SQL Tools", icon: Database },
  { label: "Comparison Tools", icon: FileDiff },
  { label: "Color Tools", icon: Palette },
];

const tools = [
  {
    name: "JSON Formatter",
    description: "Format, validate and minify JSON.",
    category: "JSON Tools",
    icon: Braces,
    color: "blue",
    tag: "Popular",
    href: "/tools/json-formatter",
  },
  {
    name: "Code Beautifier",
    description: "Beautify HTML, CSS and JavaScript.",
    category: "Code Tools",
    icon: Code2,
    color: "violet",
    tag: "Popular",
    href: "/tools/code-beautifier",
  },
  {
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 text.",
    category: "Converters",
    icon: ArrowLeftRight,
    color: "emerald",
    tag: "Utility",
    href: "/tools/base64",
  },
  {
    name: "URL Encoder / Decoder",
    description: "Encode and decode URL components.",
    category: "Converters",
    icon: Globe,
    color: "orange",
    tag: "Utility",
    href: "/tools/url-encoder",
  },
  {
    name: "UUID Generator",
    description: "Generate unique identifiers.",
    category: "Generators",
    icon: Fingerprint,
    color: "pink",
    tag: "Utility",
    href: "/tools/uuid-generator",
  },
  {
    name: "API Request Tester",
    description: "Send HTTP requests and inspect responses.",
    category: "API Tools",
    icon: Send,
    color: "cyan",
    tag: "Utility",
    href: "/tools/api-request-tester",
  },
  {
    name: "Regex Tester",
    description: "Test and debug regular expressions.",
    category: "Code Tools",
    icon: Regex,
    color: "amber",
    tag: "Utility",
    href: "/tools/regex-tester",
  },
  {
    name: "JWT Decoder",
    description: "Inspect JSON Web Token payloads locally.",
    category: "JSON Tools",
    icon: KeyRound,
    color: "blue",
    tag: "Utility",
    href: "/tools/jwt-decoder",
  },
  {
    name: "Hash Generator",
    description: "Generate common text hashes.",
    category: "Generators",
    icon: Hash,
    color: "violet",
    tag: "Utility",
    href: "/tools/hash-generator",
  },
  {
    name: "Markdown Editor",
    description: "Write Markdown and preview rendered documents instantly.",
    category: "Writing Tools",
    icon: FileText,
    color: "blue",
    tag: "New",
    href: "/tools/markdown-editor",
  },
  {
    name: "SQL Formatter",
    description: "Format and minify SQL queries for popular database dialects.",
    category: "SQL Tools",
    icon: Database,
    color: "blue",
    tag: "New",
    href: "/tools/sql-formatter",
  },
  {
    name: "Diff Checker",
    description: "Compare two versions of text and highlight additions and removals.",
    category: "Comparison Tools",
    icon: FileDiff,
    color: "blue",
    tag: "New",
    href: "/tools/diff-checker",
  },
  {
    name: "Color Converter",
    description: "Convert HEX, RGB, and HSL colors with a live preview.",
    category: "Color Tools",
    icon: Palette,
    color: "pink",
    tag: "New",
    href: "/tools/color-converter",
  },
  {
    name: "CSS Gradient Generator",
    description: "Create custom linear and radial gradients and export CSS.",
    category: "Color Tools",
    icon: Blend,
    color: "violet",
    tag: "New",
    href: "/tools/gradient-generator",
  },
  {
    name: "HTML/CSS/JS Playground",
    description: "Write HTML, CSS, and JavaScript with a live preview.",
    category: "Code Tools",
    icon: Code2,
    color: "cyan",
    tag: "New",
    href: "/tools/code-playground",
  },
];

const colorClasses: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
  violet: "bg-violet-500/10 text-violet-500 ring-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  orange: "bg-orange-500/10 text-orange-500 ring-orange-500/20",
  pink: "bg-pink-500/10 text-pink-500 ring-pink-500/20",
  amber: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  cyan: "bg-cyan-500/10 text-cyan-500 ring-cyan-500/20",
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Home");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = `${tool.name} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesCategory =
        activeCategory === "Home" ||
        activeCategory === "More Tools" ||
        tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="hidden lg:block">
        <GlobalSidebar
          mode="static"
          activeCategory={activeCategory}
          onCategorySelect={(category) => {
            setActiveCategory(category);
            setQuery("");
          }}
        />
      </div>

      <div className="min-h-screen lg:pl-[260px]">
  <SiteHeader breadcrumb={activeCategory} showSidebar={true} />

        <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-8 sm:py-10">
          <section className="mt-2">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
                  The toolkit
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  {query
                    ? "Search results"
                    : activeCategory === "Home"
                      ? "Popular developer tools"
                      : activeCategory}
                </h2>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {filteredTools.length} tools to speed up your workflow
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("Home");
                }}
                className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600"
              >
                View all tools <ArrowRight size={16} />
              </button>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;

                  return (
                    <button
                      key={tool.name}
                      type="button"
                      onClick={() => {
                        window.location.href = tool.href;
                      }}
                      className="group flex min-h-[165px] cursor-pointer flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/5"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${colorClasses[tool.color]}`}
                        >
                          <Icon size={21} />
                        </span>

                        <ChevronRight
                          size={18}
                          className="text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-blue-500"
                        />
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{tool.name}</h3>

                        {tool.tag === "Coming soon" && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-500">
                            Soon
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
                        {tool.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
                <Search className="mx-auto text-[var(--muted)]" size={28} />
                <h3 className="mt-4 font-semibold">No tools found</h3>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Try another search term or browse all tools.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("Home");
                  }}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Clear search
                </button>
              </div>
            )}
          </section>

          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Fast by design",
                description: "Get results without unnecessary steps.",
              },
              {
                icon: ShieldCheck,
                title: "Privacy focused",
                description:
                  "Keep sensitive inputs in your browser where possible.",
              },
              {
                icon: Activity,
                title: "Built for daily use",
                description: "Simple utilities for your everyday workflow.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Icon size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </section>

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--muted)]">
            <p>© 2026 DevKit Pro. Made for builders.</p>
            <p>Useful tools. Less friction.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

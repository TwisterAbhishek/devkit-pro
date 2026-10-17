
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Home,
  Command,
  X,
  Braces,
  Code2,
  ArrowLeftRight,
  Globe,
  Fingerprint,
  Regex,
  KeyRound,
  Hash,
  Send,
  FileText,
  Database,
  FileDiff,
  Palette,
  Blend,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import GlobalSidebar from "@/components/global-sidebar";

const tools = [
  {
    name: "JSON Formatter",
    category: "JSON Tools",
    href: "/tools/json-formatter",
    icon: Braces,
  },
  {
    name: "Code Beautifier",
    category: "Code Tools",
    href: "/tools/code-beautifier",
    icon: Code2,
  },
  {
    name: "Base64 Encoder / Decoder",
    category: "Converters",
    href: "/tools/base64",
    icon: ArrowLeftRight,
  },
  {
    name: "URL Encoder / Decoder",
    category: "Converters",
    href: "/tools/url-encoder",
    icon: Globe,
  },
  {
    name: "UUID Generator",
    category: "Generators",
    href: "/tools/uuid-generator",
    icon: Fingerprint,
  },
  {
    name: "Regex Tester",
    category: "Code Tools",
    href: "/tools/regex-tester",
    icon: Regex,
  },
  {
    name: "JWT Decoder",
    category: "JSON Tools",
    href: "/tools/jwt-decoder",
    icon: KeyRound,
  },
  {
    name: "API Request Tester",
    category: "API Tools",
    href: "/tools/api-request-tester",
    icon: Send,
  },
  {
    name: "API Debugging Workbench",
    category: "API Tools",
    href: "/tools/api-debugging-workbench",
    icon: Send,
  },
  {
    name: "Hash Generator",
    category: "Generators",
    href: "/tools/hash-generator",
    icon: Hash,
  },
  {
    name: "Markdown Editor",
    category: "Writing Tools",
    href: "/tools/markdown-editor",
    icon: FileText,
  },
  {
    name: "SQL Formatter",
    category: "SQL Tools",
    href: "/tools/sql-formatter",
    icon: Database,
  },
  {
    name: "Diff Checker",
    category: "Comparison Tools",
    href: "/tools/diff-checker",
    icon: FileDiff,
  },
  {
    name: "Color Converter",
    category: "Color Tools",
    href: "/tools/color-converter",
    icon: Palette,
  },
  {
    name: "CSS Gradient Generator",
    category: "Color Tools",
    href: "/tools/gradient-generator",
    icon: Blend,
  },
  {
    name: "HTML/CSS/JS Playground",
    category: "Code Tools",
    href: "/tools/code-playground",
    icon: Code2,
  },
];

export default function SiteHeader({
  breadcrumb = "Home",
  showSidebar = true,
}: {
  breadcrumb?: string;
  showSidebar?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? tools
        .filter((tool) =>
          `${tool.name} ${tool.category}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function openTool(href: string) {
    setFocused(false);
    setQuery("");

    if (href) {
      router.push(href);
    }
  }

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Escape") {
      setFocused(false);
      setQuery("");
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + results.length) % results.length
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openTool(results[activeIndex].href);
    }
  }

  return (
    <>
    {showSidebar && (
      <div className="lg:hidden">
        <GlobalSidebar mode="collapsible" />
      </div>
    )}
    <header
      className="sticky top-0 z-40 flex min-h-[76px] flex-wrap
        items-center justify-between gap-3 border-b border-[var(--border)]
        bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-xl sm:px-8"
    >
      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Home size={16} />
        <span>/</span>
        <span className="font-medium text-[var(--foreground)]">
          {breadcrumb}
        </span>
      </div>

      <div
        ref={wrapperRef}
        className="order-3 w-full sm:order-none sm:w-auto
          sm:flex-1 sm:max-w-[420px] lg:max-w-[480px]"
      >
        <div
          className={`flex items-center gap-2 rounded-xl border
            bg-[var(--background)] px-3 transition ${
              focused
                ? "border-blue-500 ring-2 ring-blue-500/10"
                : "border-[var(--border)]"
            }`}
        >
          <Search
            size={17}
            className="shrink-0 text-[var(--muted)]"
          />

          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search developer tools..."
            aria-label="Search developer tools"
            aria-expanded={focused && query.trim().length > 0}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm
              outline-none placeholder:text-[var(--muted)]"
          />

          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
              }}
              className="cursor-pointer rounded-md p-1
                text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X size={15} />
            </button>
          ) : (
            <span
              className="hidden items-center gap-1 rounded-md
                border border-[var(--border)] px-1.5 py-1
                text-[10px] text-[var(--muted)] md:flex"
            >
              <Command size={11} /> K
            </span>
          )}
        </div>

        {focused && query.trim() && (
          <div
            className="absolute left-4 right-4 top-[calc(100%-4px)]
              z-50 overflow-hidden rounded-xl border border-[var(--border)]
              bg-[var(--surface)] p-2 shadow-xl sm:left-auto sm:right-auto
              sm:w-[420px] lg:w-[480px]"
          >
            {results.length ? (
              <>
                <p
                  className="px-3 py-2 text-[10px] font-semibold
                    uppercase tracking-widest text-[var(--muted)]"
                >
                  Matching tools
                </p>

                {results.map((tool, index) => {
                  const Icon = tool.icon;

                  return (
                    <button
                      key={tool.name}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => openTool(tool.href)}
                      className={`flex w-full cursor-pointer items-center
                        gap-3 rounded-lg px-3 py-3 text-left ${
                          index === activeIndex
                            ? "bg-blue-500/10 text-blue-500"
                            : "hover:bg-[var(--surface-muted)]"
                        }`}
                    >
                      <Icon size={18} />

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {tool.name}
                        </span>
                        <span
                          className="mt-0.5 block text-xs
                            text-[var(--muted)]"
                        >
                          {tool.category}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </>
            ) : (
              <p
                className="px-3 py-5 text-center text-sm
                  text-[var(--muted)]"
              >
                No tools found for &quot;{query}&quot;.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <ThemeToggle />

        <button
          type="button"
          onClick={() => alert("Sign-in will be implemented later.")}
          className="hidden cursor-pointer rounded-xl border
            border-[var(--border)] px-4 py-2.5 text-sm
            hover:bg-[var(--surface-muted)] sm:block"
        >
          Sign in
        </button>

        <button
          type="button"
          onClick={() => alert("Pro plans will be implemented later.")}
          className="flex cursor-pointer items-center gap-2 rounded-xl
            bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white
            hover:bg-blue-700 sm:px-4"
        >
          Get Pro
        </button>
      </div>
    </header>
    </>
  );
}

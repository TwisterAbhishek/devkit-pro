
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  Blend,
  Braces,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  FileCode2,
  FileDiff,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  Home,
  KeyRound,
  Palette,
  Regex,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";

type GlobalSidebarProps = {
  mode?: "static" | "collapsible";
  activeCategory?: string;
  onCategorySelect?: (category: string) => void;
};

const groups = [
  {
    name: "JSON Tools",
    icon: Braces,
    tools: [
      { name: "JSON Formatter", href: "/tools/json-formatter", icon: Braces },
      { name: "JWT Decoder", href: "/tools/jwt-decoder", icon: KeyRound },
    ],
  },
  {
    name: "Code Tools",
    icon: Code2,
    tools: [
      {
        name: "Code Beautifier",
        href: "/tools/code-beautifier",
        icon: Code2,
      },
      {
        name: "Regex Tester",
        href: "/tools/regex-tester",
        icon: Regex,
      },
      {
        name: "HTML/CSS/JS Playground",
        href: "/tools/code-playground",
        icon: Code2,
      },
    ],
  },
  {
    name: "API Tools",
    icon: Send,
    tools: [
      { name: "API Request Tester", href: "/tools/api-request-tester", icon: Send },
    ],
  },
  {
    name: "Text Tools",
    icon: FileCode2,
    tools: [],
  },
  {
    name: "Writing Tools",
    icon: FileText,
    tools: [
      { name: "Markdown Editor", href: "/tools/markdown-editor", icon: FileText },
    ],
  },
  {
    name: "Converters",
    icon: ArrowLeftRight,
    tools: [
      { name: "Base64 Encoder / Decoder", href: "/tools/base64", icon: ArrowLeftRight },
      { name: "URL Encoder / Decoder", href: "/tools/url-encoder", icon: Globe },
    ],
  },
  {
    name: "Generators",
    icon: Fingerprint,
    tools: [
      { name: "UUID Generator", href: "/tools/uuid-generator", icon: Fingerprint },
      { name: "Hash Generator", href: "/tools/hash-generator", icon: Hash },
    ],
  },
  {
    name: "SQL Tools",
    icon: Database,
    tools: [
      { name: "SQL Formatter", href: "/tools/sql-formatter", icon: Database },
    ],
  },
  {
    name: "Comparison Tools",
    icon: FileDiff,
    tools: [
      { name: "Diff Checker", href: "/tools/diff-checker", icon: FileDiff },
    ],
  },
  {
    name: "Color Tools",
    icon: Palette,
    tools: [
      { name: "Color Converter", href: "/tools/color-converter", icon: Palette },
      { name: "CSS Gradient Generator", href: "/tools/gradient-generator", icon: Blend },
    ],
  },
];

export default function GlobalSidebar({
  mode = "collapsible",
  activeCategory = "Home",
  onCategorySelect,
}: GlobalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const matchingGroups = groups
      .filter((group) =>
        group.tools.some((tool) => tool.href === pathname)
      )
      .map((group) => group.name);

    return matchingGroups.length ? matchingGroups : ["JSON Tools"];
  });

  const isStatic = mode === "static";

  function toggleGroup(name: string) {
    setOpenGroups((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  }

  function navigate(href: string) {
    setSidebarOpen(false);
    router.push(href);
  }

  function selectCategory(category: string) {
    if (onCategorySelect) {
      onCategorySelect(category);
    } else if (category === "Home") {
      router.push("/");
    } else {
      router.push(`/?category=${encodeURIComponent(category)}`);
    }

    setSidebarOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Terminal size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            DevKit <span className="text-blue-500">Pro</span>
          </span>
        </button>

        {!isStatic && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
          Workspace
        </p>

        <button
          type="button"
          onClick={() => selectCategory("Home")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
            activeCategory === "Home" && isStatic
              ? "bg-blue-500/10 font-semibold text-blue-500"
              : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Home size={18} />
          <span className="flex-1 text-left">Home</span>
        </button>

        <nav className="space-y-1">
          {groups.map(({ name, icon: Icon, tools }) => {
            const expanded = openGroups.includes(name);
            const active = activeCategory === name;

            return (
              <div key={name}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => {
                    if (isStatic) {
                      selectCategory(name);
                    } else {
                      toggleGroup(name);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    active
                      ? "bg-blue-500/10 font-semibold text-blue-500"
                      : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{name}</span>
                  {isStatic ? (
                    <ChevronRight size={15} className="opacity-50" />
                  ) : (
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {!isStatic && expanded && (
                  <div className="mb-2 ml-5 space-y-1 border-l border-[var(--border)] pl-3">
                    {tools.length > 0 ? (
                      tools.map(({ name: toolName, href, icon: ToolIcon }) => (
                        <button
                          key={href}
                          type="button"
                          onClick={() => navigate(href)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition ${
                            pathname === href
                              ? "bg-blue-500/10 font-semibold text-blue-500"
                              : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <ToolIcon size={15} />
                          <span>{toolName}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-xs text-[var(--muted)]">
                        More tools coming soon
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Sparkles size={19} />
          </div>
          <p className="text-sm font-semibold">Built for developers</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Fast, practical tools for your everyday workflow.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-500">
            <ShieldCheck size={15} />
            Privacy-first tools
          </div>
        </div>
        <p className="mt-4 px-2 text-[11px] text-[var(--muted)]">
          © 2026 DevKit Pro
        </p>
      </div>
    </>
  );

  if (isStatic) {
    return (
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        {sidebarContent}
      </aside>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-[18px] z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-sm transition hover:border-blue-500/40 hover:text-blue-500"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[79] bg-black/40"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] flex w-[280px] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

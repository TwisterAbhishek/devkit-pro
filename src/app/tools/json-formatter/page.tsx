
import type { Metadata } from "next";
import JsonFormatter from "@/components/tools/json-formatter";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator",
  description:
    "Format, validate, minify and download JSON directly in your browser.",
};

export default function JsonFormatterPage() {
  return (
    <>
      <SiteHeader breadcrumb="JSON Formatter" />
      <main className="mx-auto min-h-screen max-w-[1500px] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-[var(--muted)] transition hover:text-blue-500"
          >
            ← Back to DevKit Pro
          </a>
        </div>

        <JsonFormatter />
      </main>
    </>
  );
}

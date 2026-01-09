"use client";

import { useEffect, useRef, useState } from "react";

type ApiError = {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export default function Page() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Autofocus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleOptimize();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copyOutput();
      }
      if (e.key === "Escape") {
        setError(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleOptimize = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setOutput("");
    setError(null);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok || data?.ok === false) {
        setError(
          data?.error ?? {
            code: "UNKNOWN_ERROR",
            message: "Unexpected error occurred",
          }
        );
        return;
      }

      setOutput(data.output || "");
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: "Failed to reach server. Check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-mono px-6 py-8 relative">
      {/* Error Popup */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md border border-neutral-800 bg-neutral-900 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-red-400">
                Error · {error.code}
              </h3>
              <button
                onClick={() => setError(null)}
                className="text-neutral-500 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-neutral-200">{error.message}</p>
            {error.requestId && (
              <p className="text-xs text-neutral-500">
                Request ID: {error.requestId}
              </p>
            )}
            <div className="pt-2 text-right">
              <button
                onClick={() => setError(null)}
                className="px-3 py-1 text-xs border border-neutral-700 hover:border-neutral-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">PromptMax</h1>
          <p className="text-neutral-400 text-sm">
            Paste a prompt. Get a weaponized version.
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Compiler mode · single model
          </p>
        </header>

        {/* Input */}
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400">
            Input
          </h2>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your raw prompt here…"
            className="w-full min-h-[180px] resize-y bg-neutral-900 border border-neutral-800 p-3 text-sm focus:outline-none focus:border-neutral-600"
          />
        </section>

        {/* Action */}
        <section>
          <button
            onClick={handleOptimize}
            disabled={!input.trim() || loading}
            className={`px-6 py-2 text-sm font-medium border ${
              loading || !input.trim()
                ? "border-neutral-700 text-neutral-600 cursor-not-allowed"
                : "border-neutral-300 text-neutral-100 hover:bg-neutral-800"
            }`}
          >
            {loading ? "Optimizing…" : "Optimize"}
          </button>
        </section>

        {/* Output */}
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400">
            Output
          </h2>
          <textarea
            ref={outputRef}
            value={output}
            readOnly
            onClick={() => outputRef.current?.select()}
            placeholder="Optimized prompt will appear here."
            className="w-full min-h-[220px] resize-y bg-neutral-900 border border-neutral-800 p-3 text-sm text-neutral-200 focus:outline-none"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={copyOutput}
              className="text-xs text-neutral-400 hover:text-neutral-200"
            >
              Copy
            </button>
            {copied && (
              <span className="text-xs text-neutral-500">Copied</span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

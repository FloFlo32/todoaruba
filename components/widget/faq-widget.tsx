"use client";

import * as React from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { brand } from "@/brand.config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * AI FAQ widget — floating assistant grounded in content/knowledge.md.
 * Streams from /api/chat (OpenAI). Mounted globally in app/layout.tsx.
 */
export function FaqWidget() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi! I'm the ${brand.name} assistant. Ask me anything about what we do.`,
    },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const { error } = await res.json().catch(() => ({ error: "Something went wrong." }));
        setMessages((m) => updateLast(m, error || "Sorry, I couldn't reach the assistant."));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => updateLast(m, acc));
      }
    } catch {
      setMessages((m) => updateLast(m, "Network error — please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open FAQ assistant"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none",
          open && "rotate-90"
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label={`${brand.name} assistant`}
        aria-hidden={!open}
        className={cn(
          "fixed bottom-24 right-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-primary/10 transition-all duration-200 motion-reduce:transition-none",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        )}
        style={{ maxHeight: "min(32rem, calc(100vh - 8rem))" }}
      >
        <header className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{brand.name} assistant</p>
            <p className="text-xs text-muted-foreground">Answers from our FAQ</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                )}
              >
                {m.content || (busy && i === messages.length - 1 ? <Dots /> : null)}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            aria-label="Message"
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </>
  );
}

function updateLast(msgs: Msg[], content: string): Msg[] {
  const copy = msgs.slice();
  copy[copy.length - 1] = { role: "assistant", content };
  return copy;
}

function Dots() {
  return (
    <span className="inline-flex gap-1" aria-label="Assistant is typing">
      {[0, 200, 400].map((d) => (
        <span
          key={d}
          className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

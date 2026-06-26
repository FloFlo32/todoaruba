import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brand } from "@/brand.config";

export const runtime = "nodejs";

/**
 * AI FAQ assistant. Streams answers grounded ONLY in content/knowledge.md
 * (populated by the URL ingest pipeline). Uses OPENAI_API_KEY from the env.
 */

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function loadKnowledge() {
  try {
    return await readFile(join(process.cwd(), "content", "knowledge.md"), "utf8");
  } catch {
    return "(No knowledge base found.)";
  }
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env." },
      { status: 500 }
    );
  }

  let messages: Msg[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const knowledge = await loadKnowledge();
  const system = [
    `You are the friendly FAQ assistant for ${brand.name}.`,
    `Answer questions using ONLY the knowledge base below. Be concise, warm, and concrete.`,
    `If the answer isn't in the knowledge base, say you're not sure and suggest contacting ${brand.social.email}. Never invent facts, prices, or features.`,
    `Reply in plain text (short paragraphs or bullet points). Do not mention "the knowledge base".`,
    ``,
    `=== KNOWLEDGE BASE ===`,
    knowledge,
  ].join("\n");

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.3,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `Upstream error (${upstream.status}).`, detail: detail.slice(0, 300) },
      { status: 502 }
    );
  }

  // Re-stream OpenAI SSE as plain text tokens.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const token = json.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // ignore keep-alive / partial frames
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

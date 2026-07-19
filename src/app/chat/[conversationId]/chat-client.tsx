"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { ConversationDto, MessageDto } from "@/lib/contracts";
import { SUBJECTS, TUTOR_MODES } from "@/lib/models";

type DetailResponse = { data: { conversation: ConversationDto; messages: MessageDto[]; nextCursor: string | null } };
type StreamEvent = { event: string; data: Record<string, unknown> };

export function ChatClient({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (before?: string) => {
    setLoading(true);
    const response = await fetch(`/api/conversations/${conversationId}${before ? `?before=${encodeURIComponent(before)}` : ""}`, { cache: "no-store" });
    if (!response.ok) {
      setError(response.status === 404 ? "This conversation was not found." : "The conversation could not be loaded.");
      setLoading(false);
      return;
    }
    const body = await response.json() as DetailResponse;
    setConversation(body.data.conversation);
    setMessages((current) => before ? [...body.data.messages, ...current] : body.data.messages);
    setNextCursor(body.data.nextCursor);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, partial]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const content = String(data.get("message") ?? "").trim();
    if (!content || streaming) return;
    form.reset();
    const optimisticId = crypto.randomUUID();
    setMessages((current) => [...current, { id: optimisticId, role: "user", content, createdAt: new Date().toISOString(), generationStatus: "active" }]);
    await generate({ content, clientRequestId: crypto.randomUUID() }, optimisticId);
  }

  async function retry(message: MessageDto) {
    if (streaming) return;
    await generate({ clientRequestId: crypto.randomUUID(), retryUserMessageId: message.id }, message.id);
  }

  async function generate(payload: { content?: string; clientRequestId: string; retryUserMessageId?: string }, optimisticId: string) {
    setStreaming(true);
    setPartial("");
    setError("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...payload }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message ?? "The message could not be sent.");
      }

      await readSse(response, ({ event, data }) => {
        if (event === "start") {
          const serverMessage = data.message as MessageDto;
          setMessages((current) => current.map((message) => message.id === optimisticId ? serverMessage : message.id === serverMessage.id ? serverMessage : message));
          optimisticId = serverMessage.id;
        } else if (event === "delta") {
          setPartial((current) => current + String(data.text ?? ""));
        } else if (event === "done") {
          const assistant = data.message as MessageDto;
          setMessages((current) => [...current.map((message) => message.id === optimisticId ? { ...message, generationStatus: "completed" as const } : message), assistant]);
          setPartial("");
        } else if (event === "error") {
          setMessages((current) => current.map((message) => message.id === optimisticId ? { ...message, generationStatus: data.code === "GENERATION_CANCELLED" ? "cancelled" as const : "failed" as const } : message));
          setPartial("");
          setError(String(data.message ?? "The tutor could not answer right now."));
        }
      });
    } catch (caught) {
      const stopped = controller.signal.aborted;
      setMessages((current) => current.map((message) => message.id === optimisticId ? { ...message, generationStatus: stopped ? "cancelled" as const : "failed" as const } : message));
      setPartial("");
      if (!stopped) setError(caught instanceof Error ? caught.message : "The tutor could not answer right now.");
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  }

  async function updateConversation(update: Partial<Pick<ConversationDto, "title" | "subject" | "mode">>) {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (response.ok) {
      const body = await response.json() as { data: ConversationDto };
      setConversation(body.data);
    } else setError("The conversation settings could not be updated.");
  }

  if (loading && !conversation) return <main className="grid min-h-screen place-items-center" aria-busy="true">Loading study session…</main>;
  if (!conversation) return <main className="grid min-h-screen place-items-center px-5 text-center"><div><h1 className="text-2xl font-bold">Conversation unavailable</h1><p className="mt-2 text-[var(--muted)]">{error}</p><Link href="/dashboard" className="mt-5 inline-block font-bold text-[var(--primary)]">Return to dashboard</Link></div></main>;

  return (
    <main className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-white">
      <header className="border-b border-[var(--border)] bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link href="/dashboard" className="rounded-lg px-2 py-2 font-bold text-[var(--primary)]">← Sessions</Link>
          <input aria-label="Conversation title" value={conversation.title} maxLength={80} onChange={(event) => setConversation({ ...conversation, title: event.target.value })} onBlur={(event) => { if (event.target.value.trim()) void updateConversation({ title: event.target.value.trim() }); }} className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-2 text-lg font-bold hover:border-[var(--border)] focus:border-[var(--primary)]" />
          <select aria-label="Subject" value={conversation.subject} onChange={(event) => void updateConversation({ subject: event.target.value as ConversationDto["subject"] })} className="hidden rounded-lg border border-[var(--border)] px-2 py-2 sm:block">{SUBJECTS.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select>
          <select aria-label="Tutor mode" value={conversation.mode} onChange={(event) => void updateConversation({ mode: event.target.value as ConversationDto["mode"] })} className="rounded-lg border border-[var(--border)] px-2 py-2">{TUTOR_MODES.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select>
        </div>
      </header>

      <section className="overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite" aria-busy={streaming}>
        <div className="mx-auto grid max-w-3xl gap-5">
          {nextCursor && <button type="button" disabled={loading} onClick={() => void load(nextCursor)} className="mx-auto rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold">{loading ? "Loading…" : "Load older messages"}</button>}
          {messages.length === 0 && <div className="py-16 text-center"><h1 className="text-3xl font-bold">What would you like to study?</h1><p className="mt-3 text-[var(--muted)]">Ask for an explanation, guidance, or a quick knowledge check.</p></div>}
          {messages.map((message) => (
            <article key={message.id} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-5 py-4 leading-7 ${message.role === "user" ? "ml-auto bg-[var(--primary)] text-white" : "mr-auto border border-[var(--border)] bg-[var(--paper)]"}`}>
              <p>{message.content}</p>
              {message.role === "user" && (message.generationStatus === "failed" || message.generationStatus === "cancelled") && <button type="button" disabled={streaming} onClick={() => void retry(message)} className="mt-3 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-bold hover:bg-white/25">Retry answer</button>}
            </article>
          ))}
          {partial && <article className="mr-auto max-w-[88%] whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--paper)] px-5 py-4 leading-7">{partial}<span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-[var(--primary)]" /></article>}
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[var(--danger)]">{error}</p>}
          <div ref={bottomRef} />
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white px-4 py-3 sm:px-6">
        <form onSubmit={send} className="mx-auto flex max-w-3xl items-end gap-3">
          <label className="sr-only" htmlFor="message">Message your tutor</label>
          <textarea id="message" name="message" required maxLength={4000} rows={2} disabled={streaming} placeholder={`Ask in ${label(conversation.mode)} mode…`} className="max-h-40 min-h-14 flex-1 resize-y rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)] disabled:bg-slate-100" />
          {streaming ? <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-xl bg-slate-800 px-5 py-3.5 font-bold text-white">Stop</button> : <button className="rounded-xl bg-[var(--primary)] px-5 py-3.5 font-bold text-white">Send</button>}
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-[var(--muted)]">AI responses can be incorrect. Verify important academic work.</p>
      </footer>
    </main>
  );
}

async function readSse(response: Response, onEvent: (event: StreamEvent) => void) {
  if (!response.body) throw new Error("The streaming response was empty.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const event = frame.split("\n").find((line) => line.startsWith("event: "))?.slice(7);
      const data = frame.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
      if (event && data) onEvent({ event, data: JSON.parse(data) as Record<string, unknown> });
    }
    if (done) break;
  }
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

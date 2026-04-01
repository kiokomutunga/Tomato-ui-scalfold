"use client";

import { useState, useRef, useEffect } from "react";
import { PredictResult } from "./../page";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  diseaseContext: PredictResult | null;
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatPanel({ diseaseContext }: Props) {
  const [isOpen, setIsOpen]           = useState(false);
  const [sessionId]                   = useState(generateSessionId);
  const [messages, setMessages]       = useState<Message[]>([
    {
      role: "assistant",
      content: "Upload a tomato leaf image and I will help you understand the diagnosis and what to do next.",
    },
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState<any[]>([]);
  const bottomRef                     = useRef<HTMLDivElement>(null);

  // Reset chat when new image is analysed
  useEffect(() => {
    if (diseaseContext) {
      setMessages([{
        role: "assistant",
        content: `I can see the model detected **${diseaseContext.prediction}** with ${(diseaseContext.confidence * 100).toFixed(1)}% confidence. Ask me anything — treatment, prevention, what to do next.`,
      }]);
      setIsOpen(false); // auto open when result comes in
    }
  }, [diseaseContext]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/chat", {  // FastAPI
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, diseaseContext, sessionId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Request failed");
        return;
      }
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }

async function loadHistory() {
    try {
      const res  = await fetch("http://localhost:8000/chat/history");  //FastAPI
      const data = await res.json();
      setHistory(data);
      setShowHistory(true);
    } catch {
      setError("Could not load history.");
    }
  }

async function loadSession(sid: string) {
  if (!sid || sid === "undefined") return; //guard against undefined for string
    try {

      const res     = await fetch(`http://localhost:8000/chat/history?sessionId=${sid}`);  // FastAPI
      const session = await res.json();
      setMessages(session.messages ?? []);
      setShowHistory(false);
    } catch {
      setError("Could not load session.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
      >
        {isOpen ? (
          // X icon when open
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat bubble icon when closed
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}

        {/* Unread dot — shows when there is a result but chat is closed */}
        {!isOpen && diseaseContext && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Chat popup ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-slate-900 rounded-2xl shadow-2xl flex flex-col"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Disease Assistant</h2>
                <p className="text-slate-400 text-xs">
                  {diseaseContext ? `Detected: ${diseaseContext.prediction}` : "Waiting for image..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadHistory}
                className="text-slate-400 hover:text-white text-xs border border-slate-700 px-2 py-1 rounded-lg transition"
              >
                History
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* History dropdown */}
          {showHistory && (
            <div className="absolute z-10 bg-slate-800 border border-slate-700 rounded-xl shadow-lg w-72 right-4 top-16 max-h-56 overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <span className="text-white text-sm font-medium">Past Sessions</span>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
              {history.length === 0 && (
                <p className="text-slate-400 text-sm px-4 py-3">No past sessions found.</p>
              )}
              {history.map((s) => (
                <button
                  key={s.sessionId}
                  onClick={() => loadSession(s.sessionId ?? s.sessionId)} //for both formats
                  className="w-full text-left px-4 py-3 hover:bg-slate-700 transition border-b border-slate-700 last:border-0"
                >
                  <p className="text-white text-sm truncate">
                    {s.diseaseContext?.prediction ?? "Unknown disease"}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-slate-700 text-slate-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about treatment, prevention..."
              className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
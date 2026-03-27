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

// Generate a unique session ID per page load
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatPanel({ diseaseContext }: Props) {
  const [sessionId]               = useState(generateSessionId);
  const [messages, setMessages]   = useState<Message[]>([
    {
      role: "assistant",
      content: "Upload a tomato leaf image and I will help you understand the diagnosis and what to do next.",
    },
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]     = useState<any[]>([]);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  // Reset chat when new image is analysed
  useEffect(() => {
    if (diseaseContext) {
      setMessages([{
        role: "assistant",
        content: `I can see the model detected **${diseaseContext.prediction}** with ${(diseaseContext.confidence * 100).toFixed(1)}% confidence. Ask me anything — treatment, prevention, what to do next.`,
      }]);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, diseaseContext, sessionId }),
      });

      const data = await res.json();

      // Show the actual error instead of a generic message
      if (!res.ok || data.error) {
        setError(data.error ?? "Request failed");
        setMessages(updated); // remove the user message optimistic update
        return;
      }

      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError("Network error — check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res  = await fetch("/api/chat/history");
      const data = await res.json();
      setHistory(data);
      setShowHistory(true);
    } catch {
      setError("Could not load history.");
    }
  }

  async function loadSession(sid: string) {
    try {
      const res     = await fetch(`/api/chat/history?sessionId=${sid}`);
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
    <div className="bg-slate-900 rounded-2xl flex flex-col h-[600px]">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Disease Assistant</h2>
          <p className="text-slate-400 text-xs">
            {diseaseContext ? `Detected: ${diseaseContext.prediction}` : "Waiting for image..."}
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="text-slate-400 hover:text-white text-xs border border-slate-700 px-3 py-1 rounded-lg transition"
        >
          History
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="absolute z-10 bg-slate-800 border border-slate-700 rounded-xl shadow-lg w-72 right-6 mt-16 max-h-64 overflow-y-auto">
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
              onClick={() => loadSession(s.sessionId)}
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

        {/* Show the actual error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs px-4 py-2 rounded-xl">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-700 flex gap-2">
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
  );
}
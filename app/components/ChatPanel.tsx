"use client";

import { useState, useRef, useEffect } from "react";
import { PredictResult } from "./../page";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SessionSummary {
  sessionId  : string;
  createdAt  : string | null;
  updatedAt  : string | null;
  disease_context?: { prediction?: string } | null;
  messages?  : Message[];
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
  const [messages, setMessages]       = useState<Message[]>([{
    role   : "assistant",
    content: "Hi! Upload a tomato leaf image and I will help you understand the diagnosis. You can also ask me general tomato disease questions right now.",
  }]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState<SessionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const bottomRef                     = useRef<HTMLDivElement>(null);

  // When a new image is analysed open chat and update context message
  useEffect(() => {
    if (diseaseContext) {
      setMessages((prev) => {
        // only add context message if not already there
        const alreadySet = prev.some((m) =>
          m.role === "assistant" && m.content.includes(diseaseContext.prediction)
        );
        if (alreadySet) return prev;
        return [...prev, {
          role   : "assistant",
          content: `I can see the model detected **${diseaseContext.prediction.replace(/_/g, " ")}** with ${(diseaseContext.confidence * 100).toFixed(1)}% confidence. Ask me anything — treatment, prevention, what to do next.`,
        }];
      });
      setIsOpen(true);
    }
  }, [diseaseContext]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          messages      : updated,
          diseaseContext: diseaseContext ?? null,
          sessionId     : sessionId,
          scanId        : diseaseContext?._id ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Request failed");
        return;
      }
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // ── Load history list ───────────────────────────────────────────────────────
  async function loadHistory() {
    setHistoryLoading(true);
    setShowHistory(true);
    setError(null);
    try {
      const res  = await fetch("http://localhost:8000/chat/history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  // ── Load a specific session ─────────────────────────────────────────────────
  async function loadSession(sid: string) {
    if (!sid || sid === "undefined") return;
    try {
      const res     = await fetch(`http://localhost:8000/chat/history?sessionId=${sid}`);
      const session = await res.json();
      if (session.messages && session.messages.length > 0) {
        setMessages(session.messages);
      }
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

  // ── Helper — display label for a session ───────────────────────────────────
  function sessionLabel(s: SessionSummary): string {
    if (s.disease_context?.prediction) {
      return s.disease_context.prediction.replace(/_/g, " ");
    }
    // fallback — show first user message if exists
    const firstUser = s.messages?.find((m) => m.role === "user");
    if (firstUser) return firstUser.content.slice(0, 40) + "...";
    return "General chat";
  }

  function sessionDate(s: SessionSummary): string {
    const raw = s.updatedAt ?? s.createdAt;
    if (!raw) return "No date";
    try {
      return new Date(raw).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch {
      return "No date";
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          backgroundColor: "#16a34a", color: "#fff",
          width: 52, height: 52, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        {isOpen ? (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
        {!isOpen && diseaseContext && (
          <span style={{ position: "absolute", top: 2, right: 2, width: 10, height: 10, backgroundColor: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
        )}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 50,
          width: 380, height: 520,
          backgroundColor: "#0f172a", borderRadius: 20,
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, backgroundColor: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                </svg>
              </div>
              <div>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0 }}>Disease Assistant</p>
                <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>
                  {diseaseContext ? `Detected: ${diseaseContext.prediction.replace(/_/g, " ")}` : "Ask me anything"}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={loadHistory}
                style={{ fontSize: 11, color: "#94a3b8", backgroundColor: "transparent", border: "1px solid #1e293b", padding: "4px 10px", borderRadius: 8, cursor: "pointer" }}
              >
                History
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* History dropdown */}
          {showHistory && (
            <div style={{
              position: "absolute", top: 58, right: 12, zIndex: 60,
              backgroundColor: "#1e293b", border: "1px solid #334155",
              borderRadius: 12, width: 280, maxHeight: 260, overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Past Sessions</span>
                <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14 }}>✕</button>
              </div>

              {historyLoading && (
                <p style={{ color: "#64748b", fontSize: 12, padding: "16px", textAlign: "center", margin: 0 }}>Loading...</p>
              )}

              {!historyLoading && history.length === 0 && (
                <p style={{ color: "#64748b", fontSize: 12, padding: "16px", textAlign: "center", margin: 0 }}>No past sessions yet.</p>
              )}

              {!historyLoading && history.map((s, i) => (
                <button
                  key={s.sessionId ?? i}
                  onClick={() => loadSession(s.sessionId)}
                  style={{
                    width: "100%", textAlign: "left", padding: "12px 16px",
                    backgroundColor: "transparent", border: "none",
                    borderBottom: "1px solid #334155", cursor: "pointer",
                    display: "block",
                  }}
                >
                  <p style={{ color: "#e2e8f0", fontSize: 13, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sessionLabel(s)}
                  </p>
                  <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>
                    {sessionDate(s)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "10px 14px", borderRadius: 16,
                  fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
                  backgroundColor: msg.role === "user" ? "#16a34a" : "#1e293b",
                  color: msg.role === "user" ? "#fff" : "#cbd5e1",
                  borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                  borderBottomLeftRadius : msg.role === "user" ? 16 : 4,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ backgroundColor: "#1e293b", padding: "10px 14px", borderRadius: 16, borderBottomLeftRadius: 4, display: "flex", gap: 5 }}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} style={{ width: 7, height: 7, backgroundColor: "#475569", borderRadius: "50%", display: "inline-block", animation: "bounce 1s infinite", animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 12, padding: "8px 12px", borderRadius: 10 }}>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about treatment, prevention..."
              style={{
                flex: 1, backgroundColor: "#1e293b", color: "#fff",
                border: "1px solid #334155", borderRadius: 12,
                padding: "9px 14px", fontSize: 13, outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                backgroundColor: !input.trim() || loading ? "#334155" : "#16a34a",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "9px 16px", fontSize: 13, fontWeight: 500,
                cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
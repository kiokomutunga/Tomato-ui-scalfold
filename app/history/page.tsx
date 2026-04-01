"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Scan {
  _id: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  image_path: string;
  is_critical?: boolean;
  user_feedback?: boolean;
  has_chat?: boolean;
}

interface DiseaseInfo {
  description: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  references: string | string[];
}

interface ScanDetail extends Scan {
  disease_info?: DiseaseInfo;
}

export default function HistoryPage() {
  const [scans, setScans]           = useState<Scan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [selected, setSelected]     = useState<ScanDetail | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [chatOpen, setChatOpen]     = useState(false);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId]   = useState("");

  useEffect(() => {
    loadScans();
  }, []);

  function loadScans() {
    setLoading(true);
    fetch("http://localhost:8000/history/scans?limit=50")
      .then((r) => r.json())
      .then((d) => {
        setScans(d.scans ?? []);
        setTotal(d.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

async function openScan(scan: Scan) {
  setChatOpen(false);
  const sid = `session_${scan._id}`;
  setSessionId(sid);

  // Fetch disease info from database using the prediction key
  let diseaseInfo = null;
  try {
    const diseaseRes = await fetch(`http://localhost:8000/diseases/${scan.prediction}`);
    if (diseaseRes.ok) {
      const d = await diseaseRes.json();
      // make sure it's not an error object
      diseaseInfo = d.key ? d : null;
    }
  } catch {
    diseaseInfo = null;
  }

  setSelected({ ...scan, disease_info: diseaseInfo });

  // Load existing chat for this scan
  try {
    const res  = await fetch(`http://localhost:8000/chat/by-scan/${scan._id}`);
    const data = await res.json();
    if (data.has_chat && data.messages.length > 0) {
      setMessages(data.messages);
    } else {
      setMessages([{
        role   : "assistant",
        content: `I have the scan for **${scan.prediction.replace(/_/g, " ")}** with ${scan.confidence.toFixed(1)}% confidence. Ask me anything about treatment, prevention, or next steps.`,
      }]);
    }
  } catch {
    setMessages([{
      role   : "assistant",
      content: `Ask me anything about **${scan.prediction.replace(/_/g, " ")}**.`,
    }]);
  }
}
  // ── Delete scan ─────────────────────────────────────────────────────────────
  async function deleteScan(e: React.MouseEvent, scanId: string) {
    e.stopPropagation();
    if (!confirm("Delete this scan and its chat history?")) return;
    setDeleting(scanId);
    try {
      await fetch(`http://localhost:8000/history/scans/${scanId}`, { method: "DELETE" });
      setScans((prev) => prev.filter((s) => s._id !== scanId));
      setTotal((prev) => prev - 1);
      if (selected?._id === scanId) setSelected(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  }

  // ── Send chat message ────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!input.trim() || chatLoading || !selected) return;

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          messages     : updated,
          sessionId    : sessionId,
          scanId       : selected._id,
          diseaseContext: {
            prediction  : selected.prediction,
            confidence  : selected.confidence / 100,
            disease_info: selected.disease_info ?? null,
          },
        }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const refs = selected?.disease_info?.references;
  const refsText = Array.isArray(refs) ? refs.join(" · ") : refs;

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-30">
        <Link href="/" className="font-bold text-lg">
          <span className="text-gray-900">Tomato</span>
          <span className="text-green-600">AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/diseases" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition">
            Disease Lab
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">

        {/* ── Scan list ── */}
        <div className={`flex flex-col ${selected ? "w-full md:w-96 border-r border-gray-100" : "w-full max-w-4xl mx-auto"} overflow-y-auto`}>
          <div className="px-8 pt-10 pb-6">
            <p className="text-xs uppercase tracking-widest text-green-600 font-medium mb-2">Records</p>
            <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
            <p className="text-gray-400 text-sm mt-1">{total} total scans recorded.</p>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="flex gap-1.5">
                {[0, 120, 240].map((d) => (
                  <span key={d} className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {!loading && scans.length === 0 && (
            <div className="mx-8 border border-dashed border-gray-200 rounded-2xl py-16 text-center">
              <p className="text-gray-300 text-sm">No scans yet.</p>
              <Link href="/" className="text-green-600 text-sm mt-3 block hover:text-green-700 transition">
                Run your first analysis →
              </Link>
            </div>
          )}

          {!loading && scans.length > 0 && (
            <div className="px-4 pb-8 space-y-2">
              {scans.map((scan) => (
                <div
                  key={scan._id}
                  onClick={() => openScan(scan)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition border ${
                    selected?._id === scan._id
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                    <img
                      src={`http://localhost:8000/${scan.image_path}`}
                      alt={scan.prediction}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium text-sm truncate">
                      {scan.prediction.replace(/_/g, " ")}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(scan.timestamp).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Badge */}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    scan.prediction === "Healthy" ? "bg-green-50 text-green-700" :
                    scan.is_critical ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                  }`}>
                    {scan.prediction === "Healthy" ? "Healthy" : scan.is_critical ? "Critical" : "Disease"}
                  </span>

                  {/* Chat indicator */}
                  {scan.has_chat && (
                    <span className="text-green-400 flex-shrink-0" title="Has chat history">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteScan(e, scan._id)}
                    disabled={deleting === scan._id}
                    className="flex-shrink-0 text-gray-300 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-50"
                    title="Delete scan"
                  >
                    {deleting === scan._id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div className="hidden md:flex flex-col flex-1 overflow-hidden">

            {/* Detail header */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 font-semibold">{selected.prediction.replace(/_/g, " ")}</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date(selected.timestamp).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Toggle chat */}
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition font-medium ${
                    chatOpen
                      ? "bg-green-700 text-white border-green-700"
                      : "text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                  </svg>
                  {chatOpen ? "Hide chat" : "Ask about this"}
                </button>

                {/* Close */}
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-300 hover:text-gray-600 transition p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Detail body — split when chat open */}
            <div className="flex flex-1 overflow-hidden">

              {/* Disease info */}
              <div className={`overflow-y-auto ${chatOpen ? "w-1/2 border-r border-gray-100" : "w-full"}`}>
                <div className="p-8">

                  {/* Image */}
                  <div className="rounded-2xl overflow-hidden border border-gray-100 mb-6">
                    <img
                      src={`http://localhost:8000/${selected.image_path}`}
                      alt={selected.prediction}
                      className="w-full object-cover max-h-64"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Confidence</p>
                      <span className="text-sm font-semibold text-gray-700">{selected.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selected.confidence >= 85 ? "bg-green-500" :
                          selected.confidence >= 70 ? "bg-yellow-400" : "bg-red-400"
                        }`}
                        style={{ width: `${selected.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Critical alert */}
                  {selected.is_critical && (
                    <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-5">
                      ⚠ Critical disease — urgent attention required
                    </p>
                  )}

                  {/* Disease details */}
                  {selected.disease_info ? (
                    <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">What is it?</p>
                        <p>{selected.disease_info.description}</p>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">Symptoms</p>
                        <p>{selected.disease_info.symptoms}</p>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">How to treat it</p>
                        <p>{selected.disease_info.treatment}</p>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold mb-1">How to prevent it</p>
                        <p>{selected.disease_info.prevention}</p>
                      </div>
                      {refsText && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-400 text-xs font-medium mb-1">References</p>
                          <p className="text-gray-400 text-xs">{refsText}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-300 text-sm">No disease details available.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat panel */}
              {chatOpen && (
                <div className="w-1/2 flex flex-col">

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-gray-900 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-700 rounded-bl-sm"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                          {[0, 150, 300].map((d) => (
                            <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="px-4 py-4 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask about treatment, prevention..."
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || chatLoading}
                      className="bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 px-8 py-5 text-center">
        <p className="text-gray-300 text-xs">TomatoAI · Built with Next.js, TensorFlow and FastAPI</p>
      </footer>
    </div>
  );
}
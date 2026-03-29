"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Scan {
  _id: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  image_path: string;
  is_critical?: boolean;
  user_feedback?: boolean;
}

export default function HistoryPage() {
  const [scans, setScans]     = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/history/scans?limit=50")
      .then((r) => r.json())
      .then((d) => { setScans(d.scans ?? []); setTotal(d.total ?? 0); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-white">

      <nav className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-gray-900 font-semibold text-lg tracking-tight">TomatoAI</Link>
        <div className="flex items-center gap-3">
  <Link
    href="/diseases"
    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
  >
    Disease Lab
  </Link>

  <Link
    href="/dashboard"
    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
  >
    Dashboard
  </Link>
</div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-green-600 font-medium mb-4">Records</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan History</h1>
        <p className="text-gray-400 text-sm mb-12">{total} total scans recorded.</p>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="border border-dashed border-gray-200 rounded-2xl py-20 text-center">
            <p className="text-gray-300 text-sm">No scans yet.</p>
            <Link href="/" className="text-green-600 text-sm mt-3 block hover:text-green-700 transition">
              Run your first analysis →
            </Link>
          </div>
        )}

        {!loading && scans.length > 0 && (
          <div className="space-y-3">
            {scans.map((scan) => (
              <div key={scan._id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition">

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img
                    src={`http://localhost:8000/uploads/${scan.image_path.split("/").pop()}`}
                    alt={scan.prediction}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
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
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Confidence */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700">{scan.confidence.toFixed(1)}%</p>
                  <p className="text-xs text-gray-400 mt-0.5">confidence</p>
                </div>

                {/* Status badge */}
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                  scan.prediction === "Healthy"
                    ? "bg-green-50 text-green-700"
                    : scan.is_critical
                    ? "bg-red-50 text-red-600"
                    : "bg-orange-50 text-orange-600"
                }`}>
                  {scan.prediction === "Healthy" ? "Healthy" : scan.is_critical ? "Critical" : "Disease"}
                </span>

                {/* Feedback indicator */}
                {scan.user_feedback !== undefined && (
                  <span className="text-xs text-gray-300 flex-shrink-0">
                    {scan.user_feedback ? "✓ correct" : "✗ wrong"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 px-8 py-6 text-center">
        <p className="text-gray-300 text-xs">TomatoAI · Built with Next.js, TensorFlow and FastAPI</p>
      </footer>
    </div>
  );
}
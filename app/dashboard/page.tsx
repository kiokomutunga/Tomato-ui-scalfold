"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DiseaseCount { _id: string; count: number; }
interface RecentScan   { _id: string; prediction: string; confidence: number; timestamp: string; }

interface DashboardData {
  totalScans:       number;
  diseaseCounts:    DiseaseCount[];
  recentScans:      RecentScan[];
  feedbackAccuracy: number | null;
}

export default function Dashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const maxCount = data ? Math.max(...data.diseaseCounts.map((d) => d.count), 1) : 1;

  const healthyCount  = data?.diseaseCounts.find((d) => d._id === "Healthy")?.count ?? 0;
  const diseasedCount = (data?.totalScans ?? 0) - healthyCount;

  return (
    <div className="min-h-screen bg-[#f7f5f0]">

      {/* Nav */}
      <nav className="px-10 py-5 flex items-center justify-between border-b border-gray-200 bg-white">
        <Link href="/" className="font-bold text-gray-900 text-lg">
          Tomato<span className="text-green-700">AI</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link
          href="/history"
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
          >
           Scan History
          </Link>
          <Link href="/" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-xs font-semibold">
            New Scan
          </Link>
          <Link
         href="/diseases"
        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
        >
        Disease Lab
        </Link>
</div>
      </nav>

      <div className="max-w-5xl mx-auto px-10 py-14">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-green-700 font-medium mb-3">Overview</p>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">All scans and system performance at a glance.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-32">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: "Total Scans",       value: data.totalScans,                              sub: "all time"             },
                { label: "Diseases Found",    value: diseasedCount,                                sub: "infected leaves"      },
                { label: "Healthy Leaves",    value: healthyCount,                                 sub: "no disease detected"  },
                { label: "User Accuracy",     value: data.feedbackAccuracy ? `${data.feedbackAccuracy}%` : "N/A", sub: "from feedback" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-900 font-medium">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Detections by disease</h2>
              <p className="text-xs text-gray-400 mb-8">Total scans per disease class</p>

              <div className="space-y-4">
                {data.diseaseCounts.map((d) => (
                  <div key={d._id} className="flex items-center gap-4">
                    <p className="text-xs text-gray-500 w-44 truncate flex-shrink-0">
                      {d._id.replace(/_/g, " ")}
                    </p>
                    <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden">
                      <div
                        className={`h-full rounded-lg transition-all duration-700 flex items-center px-3 ${
                          d._id === "Healthy" ? "bg-green-100" : "bg-orange-100"
                        }`}
                        style={{ width: `${Math.max((d.count / maxCount) * 100, 4)}%` }}
                      >
                        <span className={`text-xs font-semibold ${
                          d._id === "Healthy" ? "text-green-700" : "text-orange-700"
                        }`}>
                          {d.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent scans */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Recent scans</h2>
              <p className="text-xs text-gray-400 mb-6">Last 5 analyses</p>

              {data.recentScans.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No scans yet.</p>
              )}

              <div className="divide-y divide-gray-50">
                {data.recentScans.map((scan) => (
                  <div key={scan._id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {scan.prediction.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(scan.timestamp).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        scan.prediction === "Healthy"
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                      }`}>
                        {(scan.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
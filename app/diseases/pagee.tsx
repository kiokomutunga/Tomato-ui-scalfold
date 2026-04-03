"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Disease {
  key          : string;
  name         : string;
  severity     : string;
  scientific_name: string;
  description  : string;
  symptoms     : string;
  treatment    : string;
  prevention   : string;
  causes       : string;
  references   : string[];
}

const severityColor: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High    : "bg-orange-50 text-orange-700 border-orange-100",
  Medium  : "bg-yellow-50 text-yellow-700 border-yellow-100",
  None    : "bg-green-50 text-green-700 border-green-100",
};

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/diseases/")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load diseases.");
        return r.json();
      })
      .then((d) => { setDiseases(d.diseases); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-white">

      <nav className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-gray-900 font-semibold text-lg tracking-tight">TomatoAI</Link>
        <div className="flex items-center gap-3">
  <Link
    href="/history"
    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200"
  >
    Scan History
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
        <p className="text-xs uppercase tracking-widest text-green-600 font-medium mb-4">Reference</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Disease Lab</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-12 max-w-xl">
          A complete guide to the 10 conditions this model can detect.
          Each entry includes symptoms, treatment and prevention advice.
        </p>

        {/* Severity legend */}
        <div className="flex flex-wrap gap-2 mb-10">
          {Object.entries(severityColor).map(([level, cls]) => (
            <span key={level} className={`text-xs px-3 py-1 rounded-full border font-medium ${cls}`}>
              {level === "None" ? "Healthy" : level}
            </span>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error} — make sure your FastAPI server is running.
          </p>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {diseases.map((disease) => (
              <details key={disease.key} className="border border-gray-100 rounded-2xl group">
                <summary className="px-6 py-5 cursor-pointer flex items-center justify-between list-none">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium flex-shrink-0 ${severityColor[disease.severity]}`}>
                      {disease.severity === "None" ? "Healthy" : disease.severity}
                    </span>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{disease.name}</p>
                      <p className="text-gray-400 text-xs italic mt-0.5">{disease.scientific_name}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 transition-transform group-open:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>

                <div className="px-6 pb-6 border-t border-gray-50 pt-5">
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{disease.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                    {[
                      { label: "Symptoms",   value: disease.symptoms   },
                      { label: "Treatment",  value: disease.treatment  },
                      { label: "Prevention", value: disease.prevention },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">{item.label}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-50 pt-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">References</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {Array.isArray(disease.references) ? disease.references.join(" · ") : disease.references}
                    </p>
                  </div>
                </div>
              </details>
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

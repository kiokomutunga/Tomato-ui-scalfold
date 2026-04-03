"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Disease {
  key           : string;
  name          : string;
  severity      : string;
  scientific_name: string;
  description   : string;
  symptoms      : string;
  treatment     : string;
  prevention    : string;
  causes        : string;
  references    : string[];
}

const severityMeta: Record<string, { label: string; dot: string; text: string }> = {
  Critical: { label: "Critical",  dot: "#dc2626", text: "#dc2626" },
  High    : { label: "High risk", dot: "#ea580c", text: "#ea580c" },
  Medium  : { label: "Moderate",  dot: "#ca8a04", text: "#ca8a04" },
  None    : { label: "Healthy",   dot: "#16a34a", text: "#16a34a" },
};

export default function DiseasesPage() {
  const [diseases, setDiseases]   = useState<Disease[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selected, setSelected]   = useState<Disease | null>(null);
  const [filter, setFilter]       = useState("All");

  useEffect(() => {
    fetch("http://localhost:8000/diseases/")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load diseases.");
        return r.json();
      })
      .then((d) => { setDiseases(d.diseases); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const filters   = ["All", "Critical", "High", "Medium", "None"];
  const displayed = filter === "All"
    ? diseases
    : diseases.filter((d) => d.severity === filter);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 30 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#111827", fontWeight: 700, fontSize: 18 }}>Tomato</span>
          <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 18 }}>AI</span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/history" style={{ textDecoration: "none", fontSize: 13, color: "#6b7280", padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#fff" }}>
            Scan History
          </Link>
          <Link href="/dashboard" style={{ textDecoration: "none", fontSize: 13, color: "#6b7280", padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 10, backgroundColor: "#fff" }}>
            Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>

        {/* Left sidebar — disease list */}
        <div style={{ width: selected ? 340 : "100%", maxWidth: selected ? 340 : 900, margin: selected ? 0 : "0 auto", borderRight: selected ? "1px solid #f3f4f6" : "none", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Header */}
          <div style={{ padding: "48px 40px 24px" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#16a34a", fontWeight: 600, margin: "0 0 10px" }}>
              Reference Guide
            </p>
            <h1 style={{ fontSize: selected ? 22 : 36, fontWeight: 700, color: "#111827", margin: "0 0 8px", lineHeight: 1.2 }}>
              Disease Lab
            </h1>
            {!selected && (
              <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 480 }}>
                A reference guide to all 10 conditions this model can detect. Select any disease to read the full profile.
              </p>
            )}

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: 12, padding: "5px 14px", borderRadius: 20,
                    border: `1px solid ${filter === f ? "#16a34a" : "#e5e7eb"}`,
                    backgroundColor: filter === f ? "#f0fdf4" : "#fff",
                    color: filter === f ? "#16a34a" : "#6b7280",
                    cursor: "pointer", fontWeight: filter === f ? 600 : 400,
                  }}
                >
                  {f === "None" ? "Healthy" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {[0, 120, 240].map((d) => (
                  <span key={d} style={{ width: 8, height: 8, backgroundColor: "#4ade80", borderRadius: "50%", display: "inline-block", animation: "bounce 1s infinite", animationDelay: `${d}ms` }} />
                ))}
              </div>
              <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 12 }}>Loading diseases...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ margin: "0 40px", padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 12 }}>
              <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error} — make sure your FastAPI server is running.</p>
            </div>
          )}

          {/* Disease list */}
          {!loading && !error && (
            <div style={{ padding: "0 20px 40px" }}>
              {displayed.map((disease) => {
                const meta      = severityMeta[disease.severity] ?? severityMeta["None"];
                const isActive  = selected?.key === disease.key;
                return (
                  <button
                    key={disease.key}
                    onClick={() => setSelected(isActive ? null : disease)}
                    style={{
                      width: "100%", textAlign: "left", display: "flex", alignItems: "center",
                      gap: 14, padding: "14px 16px", borderRadius: 14, marginBottom: 4,
                      border: `1px solid ${isActive ? "#bbf7d0" : "#f3f4f6"}`,
                      backgroundColor: isActive ? "#f0fdf4" : "#fff",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {/* Severity dot */}
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: meta.dot, flexShrink: 0 }} />

                    {/* Name + scientific */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {disease.name}
                      </p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {disease.scientific_name}
                      </p>
                    </div>

                    {/* Severity label */}
                    <span style={{ fontSize: 11, color: meta.text, fontWeight: 500, flexShrink: 0 }}>
                      {meta.label}
                    </span>

                    {/* Arrow */}
                    <svg style={{ width: 14, height: 14, color: "#d1d5db", flexShrink: 0, transform: isActive ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel — disease detail */}
        {selected && (
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#fafafa" }}>

            {/* Close bar */}
            <div style={{ padding: "20px 40px", borderBottom: "1px solid #f3f4f6", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: severityMeta[selected.severity]?.dot, flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{selected.name}</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, fontStyle: "italic" }}>{selected.scientific_name}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
              >
                <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "40px" }}>

              {/* Severity banner */}
              <div style={{ padding: "10px 16px", borderRadius: 10, backgroundColor: selected.severity === "Critical" ? "#fef2f2" : selected.severity === "High" ? "#fff7ed" : selected.severity === "Medium" ? "#fefce8" : "#f0fdf4", border: `1px solid ${selected.severity === "Critical" ? "#fee2e2" : selected.severity === "High" ? "#fed7aa" : selected.severity === "Medium" ? "#fef08a" : "#bbf7d0"}`, marginBottom: 28, display: "inline-block" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: severityMeta[selected.severity]?.text, margin: 0 }}>
                  {selected.severity === "None" ? "✓ No disease" : `⚠ ${severityMeta[selected.severity]?.label} severity`}
                </p>
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, margin: "0 0 36px", maxWidth: 600 }}>
                {selected.description}
              </p>

              {/* Three columns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 32 }}>
                {[
                  { label: "Symptoms",   value: selected.symptoms,   icon: "" },
                  { label: "Treatment",  value: selected.treatment,  icon: "" },
                  { label: "Prevention", value: selected.prevention, icon: "" },
                ].map((item) => (
                  <div key={item.label} style={{ backgroundColor: "#fff", border: "1px solid #f3f4f6", borderRadius: 14, padding: "20px" }}>
                    <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 600, margin: "0 0 10px" }}>
                      {item.icon} {item.label}
                    </p>
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Causes */}
              <div style={{ backgroundColor: "#fff", border: "1px solid #f3f4f6", borderRadius: 14, padding: "20px", marginBottom: 24 }}>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 600, margin: "0 0 10px" }}>
                  Causes
                </p>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                  {selected.causes}
                </p>
              </div>

              {/* References */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 600, margin: "0 0 8px" }}>
                  References
                </p>
                <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
                  {Array.isArray(selected.references) ? selected.references.join(" · ") : selected.references}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid #f3f4f6", padding: "20px 40px", textAlign: "center" }}>
        <p style={{ color: "#d1d5db", fontSize: 12, margin: 0 }}>TomatoAI · Built with Next.js, TensorFlow and FastAPI</p>
      </footer>
    </div>
  );
}
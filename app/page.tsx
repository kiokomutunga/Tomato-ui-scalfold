"use client";

import { useState } from "react";
import ChatPanel from "./components/ChatPanel";

export interface PredictResult {
  prediction: string;
  confidence: number;
  message?: string;
  disease_info: {
    description: string;
    symptoms: string;
    treatment: string;
    prevention: string;
    references: string;
  } | null;
}

export default function Home() {
  const [file, setFile]         = useState<File | null>(null);
  const [result, setResult]     = useState<PredictResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = file ? URL.createObjectURL(file) : null;

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res  = await fetch("/api/predict", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
      setResult(null);
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-gray-100">
        <span className="text-gray-900 font-semibold text-lg tracking-tight">TomatoAI</span>
        <span className="text-gray-400 text-sm">2025</span>
      </nav>

      {/* ── Page body ── */}
      <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-20">

        {/* LEFT — Upload side */}
        <div>
          <p className="text-xs uppercase tracking-widest text-green-600 font-medium mb-4">Step one</p>
          <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-3">
            Upload a tomato leaf photo
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            Take a clear photo of the leaf in good lighting. The model will identify
            the disease and tell you what to do next.
          </p>

          {/* Drop zone */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`block w-full rounded-2xl cursor-pointer transition-all duration-200 ${
              dragOver
                ? "bg-green-50 border-2 border-green-400"
                : previewUrl
                ? "border border-gray-200"
                : "border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-gray-50"
            }`}
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-2xl object-cover max-h-72"
                />
                <div className="absolute bottom-3 right-3 bg-white text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  Click to change
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">
                  {dragOver ? "Drop it here" : "Drag & drop or click to browse"}
                </p>
                <p className="text-gray-300 text-xs mt-1">JPG, PNG, JPEG up to 10MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); }}
            />
          </label>

          {/* File name */}
          {file && (
            <p className="text-gray-400 text-xs mt-3 truncate">
              {file.name} &nbsp;·&nbsp; {(file.size / 1024).toFixed(0)} KB
            </p>
          )}

          {/* Button */}
          <button
            onClick={analyzeImage}
            disabled={!file || loading}
            className="mt-6 w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-medium text-sm transition-all duration-200"
          >
            {loading ? "Analyzing..." : "Analyze leaf"}
          </button>

          {/* Supported diseases */}
          <div className="mt-10">
            <p className="text-xs text-gray-400 mb-3">This model can detect</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot,
              Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, and Healthy leaves.
            </p>
          </div>
        </div>

        {/* RIGHT — Result side */}
        <div className="flex flex-col justify-start pt-1">
          <p className="text-xs uppercase tracking-widest text-green-600 font-medium mb-4">Step two</p>
          <h2 className="text-3xl font-bold text-gray-900 leading-snug mb-3">
            Your diagnosis
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            The result will appear here once the image is analysed.
          </p>

          {/* Empty */}
          {!result && !loading && (
            <div className="border border-dashed border-gray-200 rounded-2xl py-20 text-center">
              <p className="text-gray-300 text-sm">No result yet</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="border border-gray-100 rounded-2xl py-20 text-center">
              <div className="flex justify-center gap-1.5 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
              </div>
              <p className="text-gray-400 text-sm">Running analysis...</p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div>

              {/* Disease name */}
              <div className="mb-8">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Detected</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {result.prediction.replace(/_/g, " ")}
                </h3>

                {/* Confidence */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.confidence >= 0.85 ? "bg-green-500" :
                        result.confidence >= 0.70 ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {(result.confidence * 100).toFixed(1)}% confident
                  </span>
                </div>
              </div>

              {/* Low confidence warning */}
              {result.message && (
                <p className="text-amber-600 text-sm bg-amber-50 rounded-xl px-4 py-3 mb-6 border border-amber-100">
                  {result.message}
                </p>
              )}

              {/* Disease info — plain text, no cards */}
              {result.disease_info && (
                <div className="space-y-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">What is it?</p>
                    <p>{result.disease_info.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Symptoms to look for</p>
                    <p>{result.disease_info.symptoms}</p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">How to treat it</p>
                    <p>{result.disease_info.treatment}</p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">How to prevent it</p>
                    <p>{result.disease_info.prevention}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-400 text-xs font-medium mb-1">References</p>
                    <p className="text-gray-400 text-xs">{result.disease_info.references}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-8 py-6 text-center">
        <p className="text-gray-300 text-xs">
          TomatoAI · Built with Next.js, TensorFlow and FastAPI
        </p>
      </footer>

      {/* ── Floating chat ── */}
      <ChatPanel diseaseContext={result} />
    </div>
  );
}
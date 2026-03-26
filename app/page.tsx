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
  const [file, setFile]       = useState<File | null>(null);
  const [result, setResult]   = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT CARD — Upload */}
        <div className="bg-white rounded-2xl shadow p-8">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
            Step 1: Upload Image
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Tomato Leaf</h1>
          <p className="text-slate-500 mb-6">Upload a clear image of the tomato leaf for analysis</p>

          <label className="border-2 border-dashed border-green-300 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-green-50 transition min-h-[260px]">
            {!previewUrl ? (
              <div className="text-center">
                <p className="font-medium text-slate-700">Drag & drop your image here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG, JPEG (Max 10MB)</p>
              </div>
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-[240px] rounded-lg object-contain" />
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
              }}
            />
          </label>

          <button
            onClick={analyzeImage}
            disabled={!file || loading}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {/* MIDDLE CARD — Result */}
        <div className="bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-center p-10">
          {!result && !loading && (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Ready for Analysis</h2>
              <p className="text-slate-400 max-w-sm">Upload a tomato leaf image to get started. Results will be displayed here.</p>
            </>
          )}

          {loading && (
            <>
              <div className="flex gap-2 mb-6">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-slate-400">Analysing your image...</p>
            </>
          )}

          {result && !loading && (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">{result.prediction}</h2>
              <p className="text-green-400 text-lg mb-4">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
              {result.message && (
                <p className="text-yellow-400 text-sm mb-4">{result.message}</p>
              )}
              {result.disease_info && (
                <div className="text-left text-slate-300 space-y-3 max-w-md overflow-y-auto max-h-[340px] pr-1">
                  <p><span className="font-semibold text-white">Description:</span> {result.disease_info.description}</p>
                  <p><span className="font-semibold text-white">Symptoms:</span> {result.disease_info.symptoms}</p>
                  <p><span className="font-semibold text-white">Treatment:</span> {result.disease_info.treatment}</p>
                  <p><span className="font-semibold text-white">Prevention:</span> {result.disease_info.prevention}</p>
                  <p><span className="font-semibold text-white">References:</span> {result.disease_info.references}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT CARD — Chat */}
        <ChatPanel diseaseContext={result} />

      </div>
    </main>
  );
}
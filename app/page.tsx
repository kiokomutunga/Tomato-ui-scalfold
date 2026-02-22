"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const previewUrl = file ? URL.createObjectURL(file) : null;

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">

        {/* LEFT CARD */}
        <div className="bg-white rounded-2xl shadow p-8">
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
            Step 1: Upload Image
          </span>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Select Tomato Leaf
          </h1>
          <p className="text-slate-500 mb-6">
            Upload a clear image of the tomato leaf for analysis
          </p>

          {/* Upload box */}
          <label className="border-2 border-dashed border-green-300 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-green-50 transition min-h-[260px]">
            
            {!previewUrl ? (
              <div className="text-center">
                <div className="bg-green-100 text-green-600 rounded-full p-4 inline-block mb-4">
                  
                </div>
                <p className="font-medium text-slate-700">
                  Drag & drop your image here
                </p>
                <p className="text-sm text-slate-500">
                  or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  JPG, PNG, JPEG (Max 10MB)
                </p>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[240px] rounded-lg object-contain"
              />
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

          {/* Analyze Button */}
          <button
            onClick={analyzeImage}
            disabled={!file || loading}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
              
            </span>
            <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
              
            </span>
            <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
              
            </span>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-center p-10">

          {!result && (
            <>
              <div className="bg-slate-800 rounded-full p-6 mb-6 text-white text-2xl">
                🔬
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Ready for Analysis
              </h2>
              <p className="text-slate-400 max-w-sm">
                Upload a tomato leaf image to get started.
                results will be displayed here 
              </p>
            </>
          )}

          {result && (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">
                {result.prediction}
              </h2>
              <p className="text-green-400 text-lg">
                Confidence: {result.confidence}%
              </p>
              {result.disease_info && (
      <div className="text-left text-slate-300 space-y-3 max-w-md">
        <p>
          <span className="font-semibold text-white">Description:</span>{" "}
          {result.disease_info.description}
        </p>

        <p>
          <span className="font-semibold text-white">Symptoms:</span>{" "}
          {result.disease_info.symptoms}
        </p>

        <p>
          <span className="font-semibold text-white">Treatment:</span>{" "}
          {result.disease_info.treatment}
        </p>

        <p>
          <span className="font-semibold text-white">Prevention:</span>{" "}
          {result.disease_info.prevention}
        </p>

        <p>
          <span className="font-semibold text-white">References:</span>{" "}
          {result.disease_info.references}
        </p>
      </div>
    )}
            </>
          )}
        </div>

      </div>
    </main>
  );
}

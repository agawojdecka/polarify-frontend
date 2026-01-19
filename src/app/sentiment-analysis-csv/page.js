"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";

export default function SentimentAnalysisCSV() {
  // --- 1. API Configuration ---
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: "http://127.0.0.1:54321" });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("polarify_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  // --- 2. State Management ---
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-12-31");
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 3. Fetch Projects ---
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("polarify_token");
      if (!token) return;
      try {
        const response = await api.get("/projects/");
        setProjects(response.data);
        if (response.data.length > 0) setSelectedProjectId(response.data[0].id);
      } catch (err) {
        setError("Could not load projects.");
      }
    };
    fetchProjects();
  }, [api]);

  // --- 4. Handlers ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid CSV file.");
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProjectId || !file) {
      setError("Please select a project and upload a CSV file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const queryParams = `?project_id=${selectedProjectId}&date_from=${dateFrom}&date_to=${dateTo}`;
      const response = await api.post(`/sentiment-analysis-csv${queryParams}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error processing CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-4 md:p-12 font-sans">
      
      {/* HEADER SECTION - Absolute Layout Fix */}
      <header className="max-w-6xl mx-auto relative flex justify-center items-center mb-16 min-h-[60px]">
        
        {/* BACK TO TERMINAL BUTTON */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50">
          <Link href="/dashboard" className="group flex items-center gap-3 no-underline">
            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all border border-white/10 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
              Terminal
            </span>
          </Link>
        </div>

        {/* LOGO & TITLE */}
        <div className="flex items-center gap-4">
          <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">CSV Analysis</h1>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <button 
            onClick={() => {localStorage.clear(); window.location.href="/"}} 
            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-6 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* STEP 1: Project Selection */}
        <div className="bg-[#242931] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
          <h2 className="text-md font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
            Select Project
          </h2>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Target Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-200"
            >
              {projects.length === 0 ? <option>No projects</option> : projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* STEP 2: Date Selection */}
        <div className="bg-[#242931] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
          <h2 className="text-md font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
            Set Analysis Period
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Start Date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">End Date</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-white transition-all shadow-inner" />
            </div>
          </div>
        </div>

        {/* STEP 3: CSV Upload */}
        <div className="bg-[#242931] p-6 rounded-2xl border border-gray-700/50 shadow-2xl flex flex-col min-h-[220px]">
          <h2 className="text-md font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
            Upload CSV File
          </h2>
          
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all ${file ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-500'}`}
          >
            <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center text-center">
              {!file && <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mb-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>}
              <p className="text-[11px] font-bold text-gray-300 break-all">{file ? file.name : "Choose CSV"}</p>
              {!file && <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter">Click to upload</p>}
            </label>
            {file && (
              <button onClick={() => setFile(null)} className="mt-2 text-[10px] text-red-400 hover:underline uppercase font-bold tracking-widest">Remove</button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-3 flex flex-col items-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedProjectId || !file}
              className="w-full lg:w-1/3 py-5 rounded-2xl bg-gradient-to-r from-[#E63946] via-[#FFB703] to-[#4CAF50] hover:opacity-90 active:scale-[0.98] font-black text-white shadow-2xl shadow-black/40 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {loading ? "Processing AI Analysis..." : "Run AI Sentiment Analysis"}
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-900/10 border border-red-500/20 text-red-400 rounded-xl text-center text-xs font-bold w-full lg:w-1/3">
                {error}
              </div>
            )}
        </div>
      </main>

      {/* Results Section */}
      {results && (
        <section className="max-w-6xl mx-auto mt-12 bg-[#242931] rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
          <div className="p-8 border-b border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-transparent to-white/5">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Analysis Results</h2>
              <p className="text-gray-400 text-sm mt-1 tracking-wide">Dataset: <span className="text-white font-semibold">{projects.find(p => String(p.id) === String(results.project_id))?.name}</span></p>
            </div>
            <div className="text-center">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Average Sentiment Value</p>
                <p className="text-5xl font-black text-white">{results.avg_sentiment.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard label="Processed Rows" value={results.opinions_count} color="text-white" />
            <ResultCard label="Positive" value={results.positive_count} color="text-green-400" />
            <ResultCard label="Neutral" value={results.neutral_count} color="text-yellow-400" />
            <ResultCard label="Negative" value={results.negative_count} color="text-red-400" />
          </div>

          <div className="px-8 pb-10">
            <div className="h-3 w-full bg-[#1a1d23] rounded-full flex overflow-hidden border border-gray-800 shadow-inner">
              <div style={{ width: `${(results.positive_count / results.opinions_count) * 100}%` }} className="bg-green-500 h-full transition-all duration-1000" />
              <div style={{ width: `${(results.neutral_count / results.opinions_count) * 100}%` }} className="bg-yellow-500 h-full transition-all duration-1000" />
              <div style={{ width: `${(results.negative_count / results.opinions_count) * 100}%` }} className="bg-red-500 h-full transition-all duration-1000" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ResultCard({ label, value, color }) {
  return (
    <div className="bg-[#1a1d23] p-5 rounded-2xl border border-gray-800 flex flex-col items-center shadow-inner text-center">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-tight">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
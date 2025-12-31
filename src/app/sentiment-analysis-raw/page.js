"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function SentimentAnalysis() {
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
  const [opinions, setOpinions] = useState([{ id: "1", content: "" }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

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
  const handleOpinionChange = (index, field, value) => {
    const newOpinions = [...opinions];
    newOpinions[index][field] = value;
    setOpinions(newOpinions);
    if (error) setError(null);
  };

  const addOpinion = () => {
    setOpinions([...opinions, { id: (opinions.length + 1).toString(), content: "" }]);
  };

  const removeOpinion = (index) => {
    if (opinions.length > 1) setOpinions(opinions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) return;
    const hasEmptyFields = opinions.some(op => !op.content.trim());
    
    if (hasEmptyFields) {
      setError("All feedback entries must have content.");
      setShowValidation(true);
      return;
    }

    setLoading(true);
    setError(null);
    setShowValidation(false);

    try {
      const queryParams = `?project_id=${selectedProjectId}&date_from=${dateFrom}&date_to=${dateTo}`;
      const response = await api.post(`/sentiment-analysis-raw${queryParams}`, opinions);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-4 md:p-12 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sentiment Analysis</h1>
        </div>
        <button 
          onClick={() => {localStorage.clear(); window.location.href="/"}} 
          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-5 py-2 rounded-lg transition-all text-sm font-medium"
        >
          Logout
        </button>
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

        {/* STEP 2: Date Selection (Separated) */}
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

        {/* STEP 3: Customer Opinions */}
        <div className="bg-[#242931] p-6 rounded-2xl border border-gray-700/50 shadow-2xl flex flex-col">
          <h2 className="text-md font-semibold mb-6 flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
            Input Data
          </h2>
          <div className="flex-1 space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {opinions.map((opinion, index) => (
              <div key={index} className="flex gap-2 animate-in fade-in duration-300">
                <textarea
                  value={opinion.content}
                  onChange={(e) => handleOpinionChange(index, "content", e.target.value)}
                  placeholder="Paste feedback..."
                  className={`w-full bg-[#1a1d23] border rounded-xl p-3 text-sm focus:ring-1 focus:ring-white outline-none min-h-[50px] transition-all resize-none ${
                    showValidation && !opinion.content.trim() ? "border-red-500" : "border-gray-700"
                  }`}
                />
                <button onClick={() => removeOpinion(index)} className="text-gray-600 hover:text-red-400 transition-colors py-2 px-1">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addOpinion} className="mt-4 text-white/50 text-[11px] uppercase tracking-widest font-bold hover:text-white transition-colors text-left">+ Add Entry</button>
        </div>

        {/* Action Button: Spans across all 3 columns */}
        <div className="lg:col-span-3 flex flex-col items-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedProjectId}
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

      {/* Results Section Remains Same */}
      {results && (
        <section className="max-w-6xl mx-auto mt-12 bg-[#242931] rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
          <div className="p-8 border-b border-gray-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-transparent to-white/5">
            <div>
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <p className="text-gray-400 text-sm mt-1 tracking-wide">Project: <span className="text-white font-semibold">{projects.find(p => String(p.id) === String(results.project_id))?.name}</span></p>
            </div>
            <div className="text-center">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Average Sentiment Value</p>
                <p className="text-5xl font-black text-white">{results.avg_sentiment.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard label="Total" value={results.opinions_count} color="text-white" />
            <ResultCard label="Positive" value={results.positive_count} color="text-green-400" />
            <ResultCard label="Neutral" value={results.neutral_count} color="text-yellow-400" />
            <ResultCard label="Negative" value={results.negative_count} color="text-red-400" />
          </div>

          <div className="px-8 pb-10">
            <div className="h-3 w-full bg-[#1a1d23] rounded-full flex overflow-hidden border border-gray-800 shadow-inner">
              <div style={{ width: `${(results.positive_count / results.opinions_count) * 100}%` }} className="bg-green-500 h-full transition-all" />
              <div style={{ width: `${(results.neutral_count / results.opinions_count) * 100}%` }} className="bg-yellow-500 h-full transition-all" />
              <div style={{ width: `${(results.negative_count / results.opinions_count) * 100}%` }} className="bg-red-500 h-full transition-all" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ResultCard({ label, value, color }) {
  return (
    <div className="bg-[#1a1d23] p-5 rounded-2xl border border-gray-800 flex flex-col items-center shadow-inner">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
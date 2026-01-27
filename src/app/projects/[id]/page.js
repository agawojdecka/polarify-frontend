"use client";

import { useState, useEffect, useMemo, use } from "react";
import axios from "axios";
import Link from "next/link";

export default function ProjectDetail({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [results, setResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Filter States
  const [filterYear, setFilterYear] = useState("");
  const [filterScore, setFilterScore] = useState("all");
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showScoreMenu, setShowScoreMenu] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Helper to prevent ReferenceError
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "---" : date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    const years = [];
    for (let i = current; i >= 2020; i--) years.push(i);
    return years;
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: "http://127.0.0.1:54321" });
    instance.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("polarify_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, []);

  const processedResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    let filtered = [...results];
    if (filterScore !== "all") {
      filtered = filtered.filter((record) => {
        const score = Number(record.avg_sentiment);
        if (filterScore === "positive") return score > 0.05;
        if (filterScore === "negative") return score < -0.05;
        if (filterScore === "neutral") return score >= -0.05 && score <= 0.05;
        return true;
      });
    }
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [results, filterScore]);

  const globalAverage = useMemo(() => {
    if (processedResults.length === 0) return 0;
    return processedResults.reduce((acc, curr) => acc + (Number(curr.avg_sentiment) || 0), 0) / processedResults.length;
  }, [processedResults]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, resultsRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/sentiment-analysis_results/${id}${filterYear ? `?year=${filterYear}` : ''}`),
        ]);
        setProject(projRes.data);
        setEditName(projRes.data.name);
        setEditDescription(projRes.data.description || "");
        setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
      } catch (err) { console.error("Fetch error:", err); } 
      finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id, api, filterYear]);

  if (loading || !mounted) return <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center text-white font-black animate-pulse text-xs">Syncing...</div>;

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-6 md:p-12 font-sans">
      {/* Header with Back Button */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
        <Link href="/projects" className="group flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white">Projects Library</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Project Details Card */}
        <div className="bg-[#242931] p-10 rounded-[2.5rem] border border-gray-700/50 shadow-2xl text-center">
          {isEditing ? (
            <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 text-center text-xl font-bold text-white outline-none" />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none" rows={3} />
              <div className="flex gap-2">
                <button onClick={async () => { 
                  await api.put(`/projects/${id}`, { name: editName, description: editDescription });
                  setProject({ ...project, name: editName, description: editDescription });
                  setIsEditing(false);
                }} className="px-6 py-2 bg-white text-black font-black text-[10px] rounded-lg uppercase">Save</button>
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-gray-500 font-black text-[10px] uppercase">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-black tracking-tighter mb-2">{project?.name}</h1>
              <p className="text-gray-400 text-sm mb-6">{project?.description}</p>
              <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase flex items-center gap-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2}/></svg>
                Edit Details
              </button>
            </>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Link href={`/sentiment-analysis-raw`} className="w-full"><button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase hover:scale-105 transition-all">Manual Analysis</button></Link>
            <Link href={`/sentiment-analysis-csv`} className="w-full"><button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase hover:scale-105 transition-all">CSV Analysis</button></Link>
            <Link href={`/projects/${id}/statistical_measures`} className="w-full"><button className="w-full py-5 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase hover:bg-cyan-400 transition-all">Stats View</button></Link>
          </div>
        </div>

        {/* Filters - NOW SIDE BY SIDE */}
        <div className="bg-[#242931] p-8 rounded-[2rem] border border-gray-700/50 flex items-center justify-between px-10">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase text-gray-500 ml-1">Filters</span>
            <div className="flex flex-row gap-4">
              {/* Year Dropdown */}
              <div className="relative">
                <button onClick={() => { setShowYearMenu(!showYearMenu); setShowScoreMenu(false); }} className="min-w-[160px] py-4 px-6 rounded-2xl bg-white text-black font-black text-[10px] uppercase flex justify-between items-center shadow-lg">
                  Year: {filterYear || "All"} <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>
                </button>
                {showYearMenu && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1d23] border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <button onClick={() => { setFilterYear(""); setShowYearMenu(false); }} className="w-full px-6 py-3 text-left text-[9px] font-black text-gray-400 hover:bg-white hover:text-black">ALL INTERVALS</button>
                    {availableYears.map(y => <button key={y} onClick={() => { setFilterYear(y.toString()); setShowYearMenu(false); }} className="w-full px-6 py-3 text-left text-[9px] font-black text-gray-400 hover:bg-white hover:text-black border-t border-gray-800/50">{y}</button>)}
                  </div>
                )}
              </div>

              {/* Score Dropdown */}
              <div className="relative">
                <button onClick={() => { setShowScoreMenu(!showScoreMenu); setShowYearMenu(false); }} className="min-w-[160px] py-4 px-6 rounded-2xl bg-white text-black font-black text-[10px] uppercase flex justify-between items-center shadow-lg">
                  Score: {filterScore.toUpperCase()} <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>
                </button>
                {showScoreMenu && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1d23] border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {["all", "positive", "neutral", "negative"].map(s => (
                      <button key={s} onClick={() => { setFilterScore(s); setShowScoreMenu(false); }} className="w-full px-6 py-3 text-left text-[9px] font-black text-gray-400 hover:bg-white hover:text-black border-t border-gray-800/50 uppercase">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Avg Score</span>
            <span className={`text-3xl font-black ${globalAverage > 0.05 ? "text-green-400" : globalAverage < -0.05 ? "text-red-400" : "text-gray-400"}`}>{globalAverage.toFixed(2)}</span>
          </div>
        </div>

        {/* Analysis History Table */}
        <div className="bg-[#242931] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl">
          <h2 className="text-[10px] font-black uppercase text-gray-500 mb-6 px-2">Analysis History</h2>
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[9px] font-black uppercase text-gray-600">
                <th className="px-4 py-2">Creation Date</th>
                <th className="px-4 py-2">Interval</th>
                <th className="px-4 py-2 text-center">Score</th>
                <th className="px-4 py-2 text-center">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {processedResults.map((r) => (
                <tr key={r.id || Math.random()} className="bg-white/5 hover:bg-white/10 transition-colors">
                  <td className="px-4 py-4 rounded-l-xl text-xs font-bold text-gray-300">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-4 text-[10px] text-gray-500 font-mono">{r.date_from} — {r.date_to}</td>
                  <td className={`px-4 py-4 text-center text-xs font-black ${Number(r.avg_sentiment) > 0.05 ? "text-green-400" : Number(r.avg_sentiment) < -0.05 ? "text-red-400" : "text-gray-400"}`}>{Number(r.avg_sentiment).toFixed(2)}</td>
                  <td className="px-4 py-4 rounded-r-xl text-center text-[9px] font-black space-x-2">
                    <span className="text-green-500/60">{r.positive_count}</span>
                    <span className="text-gray-400/60">{r.neutral_count}</span>
                    <span className="text-red-500/60">{r.negative_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
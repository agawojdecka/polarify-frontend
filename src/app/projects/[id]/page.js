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
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    setMounted(true);
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

  // Format date safely to avoid "Invalid Date"
  const formatDate = (dateString) => {
    if (!dateString) return "Pending...";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Sort results by date (Newest first) and calculate global average
  const sortedResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    return [...results].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [results]);

  const globalAverage = useMemo(() => {
    if (sortedResults.length === 0) return 0;
    const total = sortedResults.reduce((acc, curr) => acc + (Number(curr.avg_sentiment) || 0), 0);
    return total / sortedResults.length;
  }, [sortedResults]);

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedResults.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedResults.length / recordsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, resultsRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/sentiment-analysis_results/${id}`),
        ]);
        setProject(projRes.data);
        setEditName(projRes.data.name);
        setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, api]);

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/projects/${id}`, { name: editName });
      setProject(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Update failed.");
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center text-white font-black animate-pulse uppercase tracking-widest text-xs">
        Synchronizing Neural Records...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-6 md:p-12 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-16">
        <Link href="/projects" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2 transition-colors">
          ← Library
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Project Header Card */}
        <div className="bg-[#242931] p-10 rounded-[2.5rem] border border-gray-700/50 shadow-2xl">
          <div className="flex flex-col items-center gap-6 mb-3">
            {isEditing ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-white/50 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="px-6 py-2 bg-white text-black font-black text-[10px] rounded-lg uppercase tracking-widest">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-gray-500 font-black text-[10px] uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-5xl font-black tracking-tighter text-center leading-tight">{project?.name}</h1>
                <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Rename Project
                </button>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link href={`/sentiment-analysis-raw`}>
              <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Manual Analysis</button>
            </Link>
            <Link href={`/sentiment-analysis-csv`}>
              <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">CSV Analysis</button>
            </Link>
          </div>
        </div>

        {/* Global Score Card */}
        <div className="bg-[#242931] p-6 rounded-[2rem] border border-gray-700/50 shadow-2xl flex items-center justify-between px-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Global Project Score</span>
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${globalAverage > 0 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(Math.max(Math.abs(globalAverage) * 100, 5), 100)}%` }}
              />
            </div>
            <span className={`text-2xl font-black ${globalAverage > 0 ? "text-green-400" : globalAverage < 0 ? "text-red-400" : "text-gray-400"}`}>
              {globalAverage.toFixed(2)}
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-[#242931] p-8 rounded-[2.5rem] border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Sentiment Analysis History</h2>
            {totalPages > 1 && (
              <div className="flex gap-4 items-center">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-20">Prev</button>
                <span className="text-[9px] font-mono text-gray-600">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-20">Next</button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                  <th className="px-4 py-2">Creation Date</th>
                  <th className="px-4 py-2">Scope (From-To)</th>
                  <th className="px-4 py-2 text-center">QTY</th>
                  <th className="px-4 py-2 text-center">Score</th>
                  <th className="px-4 py-2 text-center">P / N / N</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record) => (
                  <tr key={record.id || Math.random()} className="bg-white/5 hover:bg-white/[0.08] transition-colors">
                    <td className="px-4 py-4 rounded-l-xl text-xs font-bold text-gray-300">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="px-4 py-4 text-[10px] text-gray-500 font-mono">
                      {record.date_from || "N/A"} — {record.date_to || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-black text-white">
                      {record.opinions_count}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-black ${record.avg_sentiment > 0 ? "text-green-400" : record.avg_sentiment < 0 ? "text-red-400" : "text-gray-400"}`}>
                        {Number(record.avg_sentiment).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 rounded-r-xl text-center">
                      <div className="flex justify-center gap-2 text-[9px] font-black">
                        <span className="text-green-500/60">{record.positive_count}</span>
                        <span className="text-gray-400/60">{record.neutral_count}</span>
                        <span className="text-red-500/60">{record.negative_count}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
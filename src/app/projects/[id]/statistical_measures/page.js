"use client";

import { useState, useEffect, useMemo, use } from "react";
import axios from "axios";
import Link from "next/link";

export default function StatisticalMeasures({ params }) {
  const { id } = use(params);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    const fetchStats = async () => {
      if (!id || !mounted) return;
      try {
        setLoading(true);
        // Ensure this endpoint matches your FastAPI @app.get route exactly
        const res = await api.get(`/sentiment-analysis_statistical_measures/${id}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch statistical measures:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [id, api, mounted]);

  const StatCard = ({ label, value, colorClass = "text-white" }) => {
    const numericValue = Number(value);
    const isValid = value !== undefined && value !== null && !isNaN(numericValue);

    return (
      <div className="bg-white/5 border border-gray-700/30 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/[0.07]">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{label}</span>
        <span className={`text-4xl font-black tracking-tighter ${colorClass}`}>
          {isValid ? numericValue.toFixed(2) : "0.00"}
        </span>
      </div>
    );
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center text-white font-black animate-pulse uppercase tracking-widest text-xs">
        Synchronizing Neural Metrics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-6 md:p-12 font-sans">
      <header className="max-w-4xl mx-auto mb-12">
        <Link href={`/projects/${id}`} className="group flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white">Back to project</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto">
        <section className="bg-[#242931] p-12 rounded-[3rem] border border-gray-700/50 shadow-2xl">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black tracking-tighter mb-4">Statistical Measures</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Project ID: {id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Mean Score" value={stats?.mean} colorClass="text-yellow-400" />
            <StatCard label="Median" value={stats?.median} colorClass="text-blue-400" />
            <StatCard label="Std Deviation" value={stats?.std} colorClass="text-purple-400" />
            <StatCard label="Min Value" value={stats?.min} colorClass="text-red-400" />
            <StatCard label="Max Value" value={stats?.max} colorClass="text-green-400" />
            {/* Added an extra card to keep the grid balanced if you wish */}
            <StatCard label="Total Samples" value={stats?.count} colorClass="text-gray-400" />
          </div>
        </section>
      </main>
    </div>
  );
}
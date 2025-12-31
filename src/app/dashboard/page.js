"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analysisMode, setAnalysisMode] = useState("raw"); // 'raw' or 'csv'

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: "http://127.0.0.1:54321" });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("polarify_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, projectsRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/projects/")
        ]);
        setUser(userRes.data);
        setProjectCount(projectsRes.data.length);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [api]);

  if (loading) return (
    <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-[#4CAF50] border-gray-700 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-6 md:p-12 font-sans">
      
      {/* High-Impact Branding Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-4">
            <img src="/favicon.png" alt="Logo" className="w-12 h-12 object-contain" />
            <h1 className="text-5xl font-black tracking-tighter text-white">
              Polarify
            </h1>
          </div>
          <p className="text-gray-400 font-medium">
            Welcome, <span className="text-white font-bold">{user?.username}</span>
          </p>
        </div>
        
        <button 
          onClick={() => {localStorage.clear(); window.location.href="/"}} 
          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-5 py-2 rounded-lg transition-all text-sm font-medium"
        >
          Logout
        </button>
      </header>

      {/* Main Command Center */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card 1: Project Management */}
        <DashboardCard 
          title="Project Library" 
          description="Access and manage your registered projects and historical data."
          value={projectCount}
          label="Total Projects"
          href="/projects"
          btnText="Open Library"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />

        {/* Card 2: Merged Analysis Card */}
        <div className="bg-[#242931] p-8 rounded-[2rem] border border-gray-700/50 shadow-2xl flex flex-col hover:border-white/20 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white shadow-inner border border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex bg-[#1a1d23] p-1 rounded-xl border border-gray-800 shadow-inner">
              <button 
                onClick={() => setAnalysisMode("raw")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${analysisMode === 'raw' ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                Raw
              </button>
              <button 
                onClick={() => setAnalysisMode("csv")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${analysisMode === 'csv' ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                CSV
              </button>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">Sentiment Analyzer</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 flex-1">
            {analysisMode === "raw" 
              ? "Input individual opinions." 
              : "Upload CSV file with opinions."}
          </p>
          
          <Link href={analysisMode === "raw" ? "/sentiment-analysis-raw" : "/sentiment-analysis-csv"}>
            <button className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg bg-gradient-to-r from-[#E63946] via-[#FFB703] to-[#4CAF50] text-white hover:opacity-90">
              Run {analysisMode.toUpperCase()} Analysis
            </button>
          </Link>
        </div>

      </main>

      {/* Background Detail */}
      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center opacity-40">
      </footer>
    </div>
  );
}

function DashboardCard({ title, description, value, label, href, btnText, icon }) {
  return (
    <div className="bg-[#242931] p-8 rounded-[2rem] border border-gray-700/50 shadow-2xl flex flex-col hover:border-white/20 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white shadow-inner border border-white/5">
          {icon}
        </div>
        {value !== undefined && (
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-4xl font-black text-white">{value}</p>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">{title}</h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-10 flex-1">{description}</p>
      
      <Link href={href}>
        <button className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg bg-white/10 text-white hover:bg-white/20">
          {btnText}
        </button>
      </Link>
    </div>
  );
}
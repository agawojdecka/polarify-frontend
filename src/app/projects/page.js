"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Link from "next/link";

export default function ProjectLibrary() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  // NEW DESCRIPTION STATE FOR MODAL
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: "http://127.0.0.1:54321" });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("polarify_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get("/projects/");
      const projectsData = response.data;

      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const res = await api.get(`/sentiment-analysis_results/${project.id}`);
            const results = res.data;
            
            const avg = results.length > 0 
              ? results.reduce((acc, curr) => acc + curr.avg_sentiment, 0) / results.length 
              : null;

            return { ...project, globalScore: avg };
          } catch (err) {
            return { ...project, globalScore: null };
          }
        })
      );

      setProjects(enrichedProjects);
    } catch (err) {
      setError("Failed to synchronize project library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProjects(); 
  }, [api]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      // UPDATED TO SEND DESCRIPTION
      await api.post("/projects/", { 
        name: newProjectName,
        description: newProjectDescription 
      });
      setNewProjectName("");
      setNewProjectDescription(""); // RESET
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert("Error creating project.");
    }
  };

  const handleDeleteProject = async (e, id) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete project.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1d23] text-gray-100 p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-16">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Terminal</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tighter text-white">Project Library</h1>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
          <h2 className="text-xl font-bold">Manage Your Projects</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 rounded-xl bg-white text-[#1a1d23] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl">+ New Project</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-[#242931] p-6 rounded-3xl border border-gray-700/50 hover:border-white/20 transition-all group relative cursor-pointer h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-lg">📁</div>
                  
                  <div className="flex items-center gap-4">
                    {project.globalScore !== null && project.globalScore !== undefined && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">Global Score</span>
                        <span className={`text-sm font-black ${project.globalScore > 0 ? 'text-green-400' : project.globalScore < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {Number(project.globalScore).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <button 
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="p-2 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors">{project.name}</h3>
                
                {/* NEW PROJECT DESCRIPTION LINE */}
                <p className="text-xs text-gray-500 line-clamp-2 mb-6 h-8">
                  {project.description || ""}
                </p>

                {project.globalScore !== null && project.globalScore !== undefined && (
                  <div className="mt-auto w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${project.globalScore > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(project.globalScore) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1a1d23]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#242931] w-full max-w-md p-8 rounded-[2rem] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white mb-8">New Registry</h2>
            <form onSubmit={handleCreateProject}>
              <input 
                autoFocus type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 text-white mb-4"
                placeholder="Project Name"
              />
              {/* NEW DESCRIPTION INPUT IN MODAL */}
              <textarea 
                value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm mb-6 resize-none"
                placeholder="Description (Optional)"
                rows={3}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Cancel</button>
                <button type="submit" className="flex-1 py-4 rounded-xl bg-gradient-to-b from-[#f3f4f6] to-[#d1d5db] text-[#1a1d23] font-black text-[10px] uppercase">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
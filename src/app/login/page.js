"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function LoginPage() {
  // 1. Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 3. Persistent Session Check
  useEffect(() => {
    const savedToken = localStorage.getItem("polarify_token");
    const savedUser = localStorage.getItem("polarify_user");
    
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 4. Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:54321/login/", {
        email: email,
        password: password,
      });

      const data = response.data;
      
      // Store credentials
      localStorage.setItem("polarify_token", data.token);
      localStorage.setItem("polarify_user", JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email
      }));

      setUser(data);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    setEmail("");
    setPassword("");
  };

  // --- UI: Logged In State ---
  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1d23] text-gray-100 font-sans p-4">
        <div className="bg-[#242931] p-10 rounded-3xl border border-gray-700/50 shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
          <img src="/favicon.png" alt="Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome back!</h1>
          <p className="text-gray-400 mb-8 font-medium">{user?.username}</p>
          
          <div className="space-y-4">
            <Link 
                href="/dashboard" 
                className="block w-full py-3 rounded-xl bg-white text-[#1a1d23] font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
                Go to Dashboard
            </Link>
            <button 
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium"
            >
                Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UI: Login Form ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1d23] text-gray-100 font-sans p-4">
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10">
            <img 
                src="/favicon.png" 
                alt="Polarify Logo" 
                className="w-24 h-24 object-contain mb-4"
            />
            <h1 className="text-4xl font-bold tracking-tight text-white">Polarify</h1>
            <p className="text-gray-500 mt-2 font-medium">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <form 
            onSubmit={handleLogin} 
            className="bg-[#242931] p-8 rounded-3xl border border-gray-700/50 shadow-2xl space-y-6"
        >
            <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-200 placeholder:text-gray-700"
                    placeholder="name@company.com"
                    required
                />
            </div>

            <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-200 placeholder:text-gray-700"
                    placeholder="••••••••"
                    required
                />
            </div>

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/20 text-red-400 rounded-xl text-center text-xs font-medium animate-pulse">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E63946] via-[#FFB703] to-[#4CAF50] hover:opacity-90 active:scale-[0.98] font-bold text-white shadow-lg shadow-black/30 transition-all disabled:opacity-50"
            >
                {loading ? "Signing In..." : "Sign In"}
            </button>
        </form>
        
        {/* Footer Link */}
        <p className="text-center mt-8 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link 
                href="/register" 
                className="text-white hover:underline font-semibold transition-colors"
            >
                Create an account
            </Link>
        </p>
      </div>
    </div>
  );
}
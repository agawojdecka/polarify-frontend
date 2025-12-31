"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function RegisterPage() {
  // 1. Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. Status State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 3. Register Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:54321/register/", {
        username: username,
        email: email,
        password: password,
      });

      // FastAPI returns RegisterUserResponse: { token: "..." }
      const data = response.data;
      
      // Store the token immediately
      localStorage.setItem("polarify_token", data.token);
      
      setSuccess(true);
      
      // Redirect to login or dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold tracking-tight text-white">Join Polarify</h1>
          <p className="text-gray-500 mt-2 font-medium">Create Account</p>
        </div>

        {/* Registration Card */}
        <form 
          onSubmit={handleRegister} 
          className="bg-[#242931] p-8 rounded-3xl border border-gray-700/50 shadow-2xl space-y-6"
        >
          {/* Username Field */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1a1d23] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-200 placeholder:text-gray-700"
              placeholder="johndoe"
              required
            />
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/20 text-red-400 rounded-xl text-center text-xs font-medium">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-900/20 border border-green-500/20 text-green-400 rounded-xl text-center text-xs font-medium">
              Account created! Redirecting...
            </div>
          )}

          {/* Brand Gradient Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E63946] via-[#FFB703] to-[#4CAF50] hover:opacity-90 active:scale-[0.98] font-bold text-white shadow-lg shadow-black/30 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        {/* Footer Link */}
        <p className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="text-white hover:underline font-semibold transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
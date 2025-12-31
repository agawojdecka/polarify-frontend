"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger the logo animation only after the component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1d23] text-gray-100 font-sans p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-12">
          <img 
            src="/favicon.png" 
            alt="Polarify Logo" 
            className={`w-32 h-32 object-contain mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-1000 ease-out 
              ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-50 blur-sm'}`}
          />

          <h1 className="text-6xl font-black tracking-tighter text-white mb-4">
            Polarify
          </h1>
          <p className="text-l text-gray-400 max-w-md mx-auto font-medium leading-relaxed uppercase">
            AI-powered opinion sentiment analysis tool.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-48">
            <button className="w-full py-4 rounded-2xl bg-gradient-to-b from-[#f3f4f6] to-[#d1d5db] hover:from-[#ffffff] hover:to-[#e5e7eb] active:scale-[0.98] font-bold text-[#1a1d23] shadow-lg transition-all uppercase tracking-wider text-sm">
              Get Started
            </button>
          </Link>

          <Link href="/login" className="w-full sm:w-48">
            <button className="w-full py-4 rounded-2xl bg-gradient-to-b from-[#f3f4f6] to-[#d1d5db] hover:from-[#ffffff] hover:to-[#e5e7eb] active:scale-[0.98] font-bold text-[#1a1d23] shadow-lg transition-all uppercase tracking-wider text-sm">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
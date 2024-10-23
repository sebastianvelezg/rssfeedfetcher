// src/components/LoadMoreButton.js
"use client";

import { ChevronDown } from "lucide-react";

export default function LoadMoreButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full mt-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#EDEDED] font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
      }`}
    >
      <ChevronDown className={`w-5 h-5 ${loading ? "animate-bounce" : ""}`} />
      <span>{loading ? "Loading..." : "Load More"}</span>
    </button>
  );
}

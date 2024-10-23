// src/components/RefreshButton.js
"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function RefreshButton({ type, onRefreshComplete }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatus("Refreshing...");

    try {
      const response = await fetch(`/api/refresh-${type}`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setStatus(
          `${
            type === "movies" ? data.moviesAdded : data.seriesAdded
          } items added`
        );
        if (onRefreshComplete) {
          onRefreshComplete();
        }
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("Refresh failed");
      }
    } catch (error) {
      setStatus("Error refreshing");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`flex items-center gap-1 bg-[#DA0037] hover:bg-[#b8002f] text-white px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
          isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
        }`}
      >
        <RefreshCw
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        <span>{isRefreshing ? "Refreshing" : "Refresh"}</span>
      </button>
      {status && <span className="text-sm text-[#EDEDED]/60">{status}</span>}
    </div>
  );
}

// src/components/timerSettings.js
"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function TimerSettings() {
  const [interval, setInterval] = useState(30);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/timer-settings");
      if (response.ok) {
        const data = await response.json();
        setInterval(data.interval || 30);
        if (data.nextUpdate) {
          setNextUpdate(new Date(data.nextUpdate));
        }
      }
    } catch (error) {
      console.error("Error fetching timer settings:", error);
      setStatus("Error loading settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Updating settings...");

    try {
      const response = await fetch("/api/timer-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: Number(interval) }),
      });

      if (response.ok) {
        setStatus("Settings updated successfully!");
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating timer settings:", error);
      setStatus("Error updating settings");
    }
  };

  const handleForceScan = async () => {
    setScanning(true);
    setStatus("Scanning feeds...");

    try {
      const response = await fetch("/api/force-scan", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setStatus(
          `Scan completed successfully! ${data.moviesAdded || 0} movies and ${
            data.seriesAdded || 0
          } series added.`
        );
        setTimeout(() => setStatus(""), 5000);
      } else {
        setStatus(
          "Failed to complete scan: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error during force scan:", error);
      setStatus("Error during scan");
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <div className="text-[#EDEDED]">Loading timer settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#EDEDED] flex items-center space-x-2">
        <Clock size={20} className="text-[#DA0037]" />
        <span>RSS Feed Update Settings</span>
      </h3>

      <button
        onClick={handleForceScan}
        disabled={scanning}
        className={`w-full bg-[#DA0037] hover:bg-[#b8002f] text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#DA0037] focus:ring-opacity-50 flex items-center justify-center space-x-2 ${
          scanning ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Clock size={18} />
        <span>{scanning ? "Scanning..." : "Force Scan Now"}</span>
      </button>

      {nextUpdate && (
        <p className="text-sm text-[#EDEDED]/60">
          Next scheduled update: {nextUpdate.toLocaleString()}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#EDEDED]">
            Update Interval
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-[#171717] border border-[#444444] rounded-lg text-[#EDEDED] focus:border-[#DA0037] focus:ring focus:ring-[#DA0037] focus:ring-opacity-50 transition-all duration-200"
          >
            {[5, 15, 30, 60, 120, 360, 720, 1440].map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes < 60
                  ? `${minutes} minutes`
                  : `${minutes / 60} hour${minutes === 60 ? "" : "s"}`}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#DA0037] hover:bg-[#b8002f] text-white py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#DA0037] focus:ring-opacity-50"
        >
          Update Interval
        </button>
      </form>

      {status && (
        <p
          className={`text-sm ${
            status.includes("successfully") || status.includes("completed")
              ? "text-green-400"
              : "text-[#DA0037]"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

// src/app/status/page.js
"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle, Check } from "lucide-react";

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status");
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8">Loading status...</div>;
  }

  if (!status) {
    return <div className="p-8">No status available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#171717] to-[#1a1a1a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#EDEDED] mb-8">
          RSS Feed Status
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Movies Status */}
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#EDEDED]">Movies</h2>
              {status.movies.status === "healthy" ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#DA0037]" />
              )}
            </div>
            <div className="space-y-2 text-[#EDEDED]/70">
              <p>
                Last Update:{" "}
                {status.movies.lastUpdate
                  ? new Date(status.movies.lastUpdate).toLocaleString()
                  : "Never"}
              </p>
              <p>
                Minutes Since Update:{" "}
                {status.movies.minutesSinceUpdate || "N/A"}
              </p>
              <p>Last Added Count: {status.movies.lastAddedCount}</p>
            </div>
          </div>

          {/* Series Status */}
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#EDEDED]">Series</h2>
              {status.series.status === "healthy" ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#DA0037]" />
              )}
            </div>
            <div className="space-y-2 text-[#EDEDED]/70">
              <p>
                Last Update:{" "}
                {status.series.lastUpdate
                  ? new Date(status.series.lastUpdate).toLocaleString()
                  : "Never"}
              </p>
              <p>
                Minutes Since Update:{" "}
                {status.series.minutesSinceUpdate || "N/A"}
              </p>
              <p>Last Added Count: {status.series.lastAddedCount}</p>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="md:col-span-2 mt-8">
            <h2 className="text-xl font-semibold text-[#EDEDED] mb-4">
              Recent Updates
            </h2>
            <div className="space-y-4">
              {status.recentLogs.map((log, index) => (
                <div key={index} className="bg-[#2a2a2a] p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#EDEDED]">{log.type}</p>
                      <p className="text-sm text-[#EDEDED]/60">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-[#EDEDED]/70">
                      <p className="text-sm">
                        Items Added:{" "}
                        {log.type === "movies"
                          ? log.moviesAdded
                          : log.seriesAdded}
                      </p>
                      <p className="text-sm">
                        Duration: {Math.round(log.duration / 1000)}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

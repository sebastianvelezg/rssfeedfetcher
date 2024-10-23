// src/components/UpdateStatus.js
"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function UpdateStatus() {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdateStatus = async () => {
      try {
        const response = await fetch("/api/last-update");
        if (response.ok) {
          const data = await response.json();
          setLastUpdate(data);
        }
      } catch (error) {
        console.error("Error fetching update status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdateStatus();
    // Refresh status every minute
    const interval = setInterval(fetchUpdateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  if (!lastUpdate) return null;

  const lastUpdateTime = new Date(lastUpdate.lastUpdate);
  const minutesAgo = Math.floor((Date.now() - lastUpdateTime) / 60000);

  return (
    <div className="flex items-center gap-2 text-sm text-[#EDEDED]/60">
      <Clock className="w-4 h-4" />
      <span>
        Last updated:{" "}
        {minutesAgo < 60
          ? `${minutesAgo} minutes ago`
          : lastUpdateTime.toLocaleString()}
      </span>
      {lastUpdate.errors && lastUpdate.errors.length > 0 && (
        <AlertCircle
          className="w-4 h-4 text-[#DA0037]"
          title="Errors occurred during last update"
        />
      )}
    </div>
  );
}

// src/app/api/last-update/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");

    const lastUpdate = await db.collection("updates").findOne({ type: "feed" });

    return NextResponse.json(lastUpdate || null);
  } catch (error) {
    console.error("Error fetching last update:", error);
    return NextResponse.json(
      { error: "Failed to fetch last update" },
      { status: 500 }
    );
  }
}

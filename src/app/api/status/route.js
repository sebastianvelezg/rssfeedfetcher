// src/app/api/status/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");

    // Get last updates for both types
    const [moviesUpdate, seriesUpdate] = await Promise.all([
      db
        .collection("updates")
        .findOne({ type: "movies" }, { sort: { lastUpdate: -1 } }),
      db
        .collection("updates")
        .findOne({ type: "series" }, { sort: { lastUpdate: -1 } }),
    ]);

    // Get recent cron executions
    const recentLogs = await db
      .collection("cronLogs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Calculate some stats
    const now = new Date();
    const status = {
      movies: {
        lastUpdate: moviesUpdate?.lastUpdate || null,
        minutesSinceUpdate: moviesUpdate?.lastUpdate
          ? Math.floor((now - new Date(moviesUpdate.lastUpdate)) / 60000)
          : null,
        lastAddedCount: moviesUpdate?.moviesAdded || 0,
        status:
          moviesUpdate?.lastUpdate &&
          now - new Date(moviesUpdate.lastUpdate) < 40 * 60000
            ? "healthy"
            : "delayed",
      },
      series: {
        lastUpdate: seriesUpdate?.lastUpdate || null,
        minutesSinceUpdate: seriesUpdate?.lastUpdate
          ? Math.floor((now - new Date(seriesUpdate.lastUpdate)) / 60000)
          : null,
        lastAddedCount: seriesUpdate?.seriesAdded || 0,
        status:
          seriesUpdate?.lastUpdate &&
          now - new Date(seriesUpdate.lastUpdate) < 40 * 60000
            ? "healthy"
            : "delayed",
      },
      recentLogs,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}

// src/app/api/update-feeds/route.js
import { NextResponse } from "next/server";
import { fetchAndStoreRSSFeed } from "@/lib/rssFetcher";
import { fetchAndStorePosterUrls } from "@/lib/tmdbPosterFetcher";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");

    // Check last update time and interval setting
    const settings = await db.collection("settings").findOne({ type: "timer" });
    const lastUpdate = await db.collection("updates").findOne({ type: "feed" });

    const interval = settings?.interval || 30; // Default to 30 minutes
    const now = new Date();
    const minimumWait = interval * 60 * 1000; // Convert minutes to milliseconds

    if (lastUpdate && now - new Date(lastUpdate.lastUpdate) < minimumWait) {
      return NextResponse.json({
        message: "Update skipped - minimum interval not reached",
        nextUpdate: new Date(lastUpdate.lastUpdate.getTime() + minimumWait),
      });
    }

    // Proceed with update
    const feeds = await db.collection("feeds").find().toArray();
    for (const feed of feeds) {
      await fetchAndStoreRSSFeed(feed.url, feed.type);
    }

    await fetchAndStorePosterUrls("movies");
    await fetchAndStorePosterUrls("series");

    // Update last update timestamp
    await db.collection("updates").updateOne(
      { type: "feed" },
      {
        $set: {
          lastUpdate: now,
          type: "feed",
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Movies and series updated successfully",
      nextUpdate: new Date(now.getTime() + minimumWait),
    });
  } catch (error) {
    console.error("Error updating movies and series:", error);
    return NextResponse.json(
      { error: "Failed to update movies and series" },
      { status: 500 }
    );
  }
}

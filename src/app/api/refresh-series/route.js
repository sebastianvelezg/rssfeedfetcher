// src/app/api/refresh-series/route.js
import { NextResponse } from "next/server";
import { fetchAndStoreRSSFeed } from "@/lib/rssFetcher";
import { fetchAndStorePosterUrls } from "@/lib/tmdbPosterFetcher";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");

    const feeds = await db
      .collection("feeds")
      .find({ type: "series" })
      .toArray();
    let seriesAdded = 0;

    for (const feed of feeds) {
      const result = await fetchAndStoreRSSFeed(feed.url, feed.type);
      seriesAdded += result?.newItems || 0;
    }

    const seriesUpdated = await fetchAndStorePosterUrls("series");

    return NextResponse.json({
      message: "Series refresh completed",
      seriesAdded,
      seriesUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to refresh series" },
      { status: 500 }
    );
  }
}

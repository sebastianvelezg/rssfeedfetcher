// src/app/api/refresh-movies/route.js
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
      .find({ type: "movies" })
      .toArray();
    let moviesAdded = 0;

    for (const feed of feeds) {
      const result = await fetchAndStoreRSSFeed(feed.url, feed.type);
      moviesAdded += result?.newItems || 0;
    }

    const moviesUpdated = await fetchAndStorePosterUrls("movies");

    return NextResponse.json({
      message: "Movies refresh completed",
      moviesAdded,
      moviesUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to refresh movies" },
      { status: 500 }
    );
  }
}

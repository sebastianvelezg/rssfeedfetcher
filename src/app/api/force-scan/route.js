// src/app/api/force-scan/route.js
import { NextResponse } from "next/server";
import { fetchAndStoreRSSFeed } from "@/lib/rssFetcher";
import { fetchAndStorePosterUrls } from "@/lib/tmdbPosterFetcher";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  console.log("Starting force scan");
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");

    // Get all feeds
    const feeds = await db.collection("feeds").find().toArray();
    console.log(`Found ${feeds.length} feeds to process`);

    let moviesAdded = 0;
    let seriesAdded = 0;

    // Process each feed
    for (const feed of feeds) {
      console.log(`Processing feed: ${feed.url}`);
      const result = await fetchAndStoreRSSFeed(feed.url, feed.type);
      if (feed.type === "movies") {
        moviesAdded += result?.newItems || 0;
      } else {
        seriesAdded += result?.newItems || 0;
      }
    }

    // Update posters for new content
    console.log("Updating movies posters");
    const moviesUpdated = await fetchAndStorePosterUrls("movies");
    console.log("Updating series posters");
    const seriesUpdated = await fetchAndStorePosterUrls("series");

    // Update last scan time
    await db.collection("updates").updateOne(
      { type: "feed" },
      {
        $set: {
          lastUpdate: new Date(),
          type: "feed",
        },
      },
      { upsert: true }
    );

    console.log("Force scan completed");
    return NextResponse.json({
      message: "Force scan completed successfully",
      moviesAdded,
      seriesAdded,
      moviesUpdated,
      seriesUpdated,
    });
  } catch (error) {
    console.error("Error during force scan:", error);
    return NextResponse.json(
      { error: "Failed to complete force scan" },
      { status: 500 }
    );
  }
}

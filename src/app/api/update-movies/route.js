import { NextResponse } from "next/server";
import { fetchAndStoreRSSFeed } from "@/lib/rssFetcher";
import { fetchAndStorePosterUrls } from "@/lib/tmdbPosterFetcher";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // Fetch all RSS feeds from the database
    const client = await clientPromise;
    const db = client.db("rssApp");
    const feeds = await db.collection("feeds").find().toArray();

    // Update items for each feed
    for (const feed of feeds) {
      await fetchAndStoreRSSFeed(feed.url, feed.type);
    }

    // Fetch posters for new items
    await fetchAndStorePosterUrls("movies");
    await fetchAndStorePosterUrls("series");

    return NextResponse.json({
      message: "Movies and series updated successfully",
    });
  } catch (error) {
    console.error("Error updating movies and series:", error);
    return NextResponse.json(
      { error: "Failed to update movies and series" },
      { status: 500 }
    );
  }
}

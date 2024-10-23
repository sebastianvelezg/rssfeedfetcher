// src/app/api/refresh-posters/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { fetchAndStorePosterUrls } from "@/lib/tmdbPosterFetcher";

export async function POST() {
  console.log("Starting poster refresh process");
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");

    console.log("Fetching and storing posters for movies");
    const moviesUpdated = await fetchAndStorePosterUrls("movies");
    console.log(`Updated ${moviesUpdated} movies posters`);

    console.log("Fetching and storing posters for series");
    const seriesUpdated = await fetchAndStorePosterUrls("series");
    console.log(`Updated ${seriesUpdated} series posters`);

    const totalUpdated = moviesUpdated + seriesUpdated;

    console.log(`Total posters updated: ${totalUpdated}`);

    return NextResponse.json({
      message: "Posters refreshed successfully",
      updatedCount: totalUpdated,
    });
  } catch (error) {
    console.error("Error refreshing posters:", error);
    return NextResponse.json(
      { error: "Failed to refresh posters" },
      { status: 500 }
    );
  }
}

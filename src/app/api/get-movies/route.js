import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Starting get-movies request");
    const client = await clientPromise;
    const db = client.db("rssApp");

    console.log("Connected to MongoDB, fetching from selectedMovies");
    const movies = await db
      .collection("selectedMovies")
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    console.log(`Found ${movies.length} movies`);

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error in get-movies:", error);
    // Return more detailed error for debugging
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: "Error fetching movies",
      },
      { status: 500 }
    );
  }
}

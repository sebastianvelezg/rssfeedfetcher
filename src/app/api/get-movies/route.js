// src/app/api/get-movies/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db("rssApp");

    console.log("Fetching movies...");
    const movies = await db
      .collection("movies")
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    console.log(`Found ${movies.length} movies`);
    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json([], { status: 200 });
  }
}

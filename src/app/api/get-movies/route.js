// src/app/api/get-movies/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");
    const movies = await db
      .collection("movies")
      .find({})
      .sort({ pubDate: -1 }) // Sort by pubDate in descending order
      .toArray();
    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

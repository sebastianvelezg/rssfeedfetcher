// src/app/api/get-series/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");
    const series = await db
      .collection("series")
      .find({})
      .sort({ pubDate: -1 }) // Sort by pubDate in descending order
      .toArray();
    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}

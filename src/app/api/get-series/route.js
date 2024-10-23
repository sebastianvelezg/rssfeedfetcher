// src/app/api/get-series/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db("rssApp");

    console.log("Fetching series...");
    const series = await db
      .collection("series")
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    console.log(`Found ${series.length} series`);
    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}

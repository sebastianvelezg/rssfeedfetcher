// src/app/api/get-series/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { serializeMongoDocArray } from "@/utils/mongoSerializer";

export async function GET() {
  try {
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db("rssApp");

    console.log("Fetching series...");
    const rawSeries = await db
      .collection("series")
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    const series = serializeMongoDocArray(rawSeries);
    console.log(`Found ${series.length} series`);
    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json([], { status: 200 });
  }
}

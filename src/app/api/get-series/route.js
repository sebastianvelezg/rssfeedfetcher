import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Starting get-series request");
    const client = await clientPromise;
    const db = client.db("rssApp");

    console.log("Connected to MongoDB, fetching from selectedSeries");
    const series = await db
      .collection("selectedSeries")
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    console.log(`Found ${series.length} series`);

    return NextResponse.json(series);
  } catch (error) {
    console.error("Error in get-series:", error);
    // Return more detailed error for debugging
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: "Error fetching series",
      },
      { status: 500 }
    );
  }
}

// src/app/api/check-feed-status/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { guids, type } = await req.json();

    const client = await clientPromise;
    const db = client.db("rssApp");
    const collection = db.collection(
      type === "movies" ? "selectedMovies" : "selectedSeries"
    );

    const items = await collection
      .find({ guid: { $in: guids } })
      .project({ guid: 1 })
      .toArray();

    const feedStatus = items.reduce((acc, item) => {
      acc[item.guid] = true;
      return acc;
    }, {});

    return NextResponse.json(feedStatus);
  } catch (error) {
    console.error("Error checking feed status:", error);
    return NextResponse.json(
      { error: "Failed to check feed status" },
      { status: 500 }
    );
  }
}

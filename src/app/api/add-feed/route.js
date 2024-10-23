// src/app/api/add-feed/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { fetchAndStoreRSSFeed } from "@/lib/rssFetcher";

export async function POST(req) {
  try {
    const { url, type } = await req.json();
    const client = await clientPromise;
    const db = client.db("rssApp");

    // Add the feed to the database
    await db.collection("feeds").insertOne({ url, type });

    // Immediately process the new feed
    const newItems = await fetchAndStoreRSSFeed(url, type);

    return NextResponse.json({
      message: "Feed added and processed successfully",
      newItemsCount: newItems.length,
    });
  } catch (error) {
    console.error("Error adding feed:", error);
    return NextResponse.json({ error: "Failed to add feed" }, { status: 500 });
  }
}

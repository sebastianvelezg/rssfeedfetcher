// src/app/api/add-to-feed/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const item = await req.json();

    if (!item || !item.guid) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
    }

    const client = await clientPromise; // Fixed typo here
    const db = client.db("rssApp");

    // Determine collection based on item type
    const collectionName =
      item.type === "movies" ? "selectedMovies" : "selectedSeries";
    const collection = db.collection(collectionName);

    // Check if already in feed
    const existing = await collection.findOne({ guid: item.guid });
    if (existing) {
      return NextResponse.json(
        { message: "Item already in feed" },
        { status: 200 }
      );
    }

    // Prepare item data
    const itemToInsert = {
      ...item,
      addedAt: new Date(),
      guid: item.guid,
      title: item.title || "",
      link: item.link || "",
      description: item.description || item.overview || "",
      type: item.type || "movies", // default to movies if not specified
    };

    // Add to selected items
    await collection.insertOne(itemToInsert);

    return NextResponse.json(
      {
        message: "Added to feed successfully",
        item: itemToInsert,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding to feed:", error);
    return NextResponse.json(
      {
        error: "Failed to add to feed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

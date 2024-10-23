// src/app/api/delete-from-feed/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { guid, type } = await req.json();

    if (!guid || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("rssApp");
    const collection = db.collection(
      type === "movies" ? "selectedMovies" : "selectedSeries"
    );

    const result = await collection.deleteOne({ guid });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Item not found in feed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Item removed from feed successfully",
    });
  } catch (error) {
    console.error("Error removing from feed:", error);
    return NextResponse.json(
      { error: "Failed to remove from feed" },
      { status: 500 }
    );
  }
}

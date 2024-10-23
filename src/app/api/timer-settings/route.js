// src/app/api/timer-settings/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");
    const settings = await db.collection("settings").findOne({ type: "timer" });
    return NextResponse.json(settings || { interval: 30 }); // Default to 30 minutes if no settings found
  } catch (error) {
    console.error("Error fetching timer settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch timer settings" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { interval } = await req.json();
    const client = await clientPromise;
    const db = client.db("rssApp");

    await db.collection("settings").updateOne(
      { type: "timer" },
      {
        $set: {
          type: "timer",
          interval: interval,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Timer settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating timer settings:", error);
    return NextResponse.json(
      { error: "Failed to update timer settings" },
      { status: 500 }
    );
  }
}

// src/app/api/feed/[type]/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import RSS from "rss";
import { getBaseUrl } from "@/utils/getBaseUrl";

export async function GET(request, { params }) {
  try {
    const type = await params.type;
    const client = await clientPromise;
    const db = client.db("rssApp");
    const collection = db.collection(
      type === "movies" ? "selectedMovies" : "selectedSeries"
    );

    const items = await collection
      .find({})
      .sort({ addedAt: -1 })
      .limit(50)
      .toArray();

    const baseUrl = request.headers.get("host")
      ? `${
          request.headers.get("x-forwarded-proto") || "http"
        }://${request.headers.get("host")}`
      : getBaseUrl();

    const feed = new RSS({
      title: `My ${type === "movies" ? "Movies" : "Series"} Feed`,
      description: `Selected ${
        type === "movies" ? "movies" : "series"
      } for automatic download`,
      feed_url: `${baseUrl}/api/feed/${type}`,
      site_url: baseUrl,
      image_url: `${baseUrl}/favicon.ico`,
      language: "en",
      pubDate: new Date(),
      ttl: 60,
      custom_namespaces: {
        media: "http://search.yahoo.com/mrss/",
        content: "http://purl.org/rss/1.0/modules/content/",
        dc: "http://purl.org/dc/elements/1.1/",
      },
    });

    items.forEach((item) => {
      feed.item({
        title: item.title,
        description: item.description || item.overview || "",
        url: item.link,
        guid: item.guid,
        date: item.addedAt,
        categories: [type],
        custom_elements: [
          { "dc:creator": "RSS Feed Generator" },
          item.size ? { size: item.size } : null,
          item.resolution ? { resolution: item.resolution } : null,
          { type: item.type || type },
        ].filter(Boolean),
      });
    });

    return new Response(feed.xml(), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating feed:", error);
    return NextResponse.json(
      { error: "Failed to generate feed" },
      { status: 500 }
    );
  }
}

// src/lib/rssFetcher.js
import Parser from "rss-parser";
import clientPromise from "./mongodb";

const parser = new Parser();

export async function fetchAndStoreRSSFeed(url, type) {
  try {
    const client = await clientPromise;
    const db = client.db("rssApp");
    const collection = db.collection(type);

    const feed = await parser.parseURL(url);
    let newItems = 0;

    // Create an index on pubDate if it doesn't exist
    await collection.createIndex({ pubDate: -1 });

    for (const item of feed.items) {
      const existingItem = await collection.findOne({ guid: item.guid });
      if (!existingItem) {
        await collection.insertOne({
          ...item,
          type: type,
          createdAt: new Date(),
          pubDate: new Date(item.pubDate), // Ensure pubDate is a Date object
          posterUrl: null,
        });
        newItems++;
      }
    }

    console.log(
      `RSS feed (${type}) fetched and stored successfully. Added ${newItems} new items.`
    );
    return { success: true, newItems };
  } catch (error) {
    console.error(`Error fetching or storing RSS feed (${type}):`, error);
    return { success: false, error: error.message };
  }
}

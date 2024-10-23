// src/lib/tmdbPosterFetcher.js
import clientPromise from "./mongodb";

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function fetchTMDBDetails(tmdbId, type) {
  // For TMDB API endpoints, we use "movie" and "tv"
  const mediaType = type === "movies" ? "movie" : "tv";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    },
  };

  const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}`;
  console.log(`Fetching TMDB details from: ${url}`);
  const response = await fetch(url, options);
  const data = await response.json();

  // Check if we got a valid response
  if (data.success === false) {
    console.log(`Invalid response from TMDB:`, data);
    return null;
  }

  return data;
}

function extractTMDBId(item) {
  console.log(`Processing item: ${item.title}`);

  if (item.content) {
    // Set type based on collection
    const type = item.type === "movies" ? "movie" : "tv";

    const tmdbMatch = item.content.match(/TMDB Link: <a[^>]*?\/([^"'\s]+)/);
    if (tmdbMatch) {
      const fullPath = tmdbMatch[1];
      console.log(`Found TMDB path: ${fullPath}`);

      // Extract both the media type and ID from the URL
      const pathMatch = fullPath.match(/(?:movie|tv)\/(\d+)/);
      if (pathMatch) {
        const [, id] = pathMatch;
        console.log(`Found TMDB ID: ${id} for type: ${type}`);
        return { id, type };
      }
    }

    // Backup method: look for the ID at the end of the content
    const simpleMatch = item.content.match(/target="_blank">(\d+)<\/a>/);
    if (simpleMatch) {
      const id = simpleMatch[1];
      console.log(`Found TMDB ID (simple match): ${id} for type: ${type}`);
      return { id, type };
    }
  }

  console.log(`No TMDB ID found for ${item.title}`);
  return null;
}

export async function fetchAndStorePosterUrls(type) {
  console.log(`Starting to fetch posters for ${type}`);
  const client = await clientPromise;
  const db = client.db("rssApp");
  // Use "movies" and "series" for collection names
  const collection = db.collection(type); // type should be either "movies" or "series"

  const items = await collection
    .find({
      $or: [{ posterUrl: null }, { posterUrl: { $exists: false } }],
    })
    .toArray();

  console.log(`Found ${items.length} items without posters`);

  let updatedCount = 0;

  for (const item of items) {
    try {
      const tmdbInfo = extractTMDBId(item);

      if (!tmdbInfo) {
        continue;
      }

      // Make sure we're using the correct type for the API call
      const mediaType = type === "movies" ? "movie" : "tv";
      if (tmdbInfo.type !== mediaType) {
        console.log(
          `Skipping ${item.title} - wrong media type (${tmdbInfo.type} vs ${mediaType})`
        );
        continue;
      }

      const tmdbItem = await fetchTMDBDetails(tmdbInfo.id, type);

      if (tmdbItem && tmdbItem.poster_path) {
        const posterUrl = `${TMDB_IMAGE_BASE_URL}${tmdbItem.poster_path}`;
        console.log(`Found poster URL for ${item.title}: ${posterUrl}`);

        await collection.updateOne(
          { _id: item._id },
          {
            $set: {
              posterUrl: posterUrl,
              tmdbId: tmdbInfo.id,
              overview: tmdbItem.overview,
              releaseDate: tmdbItem.release_date || tmdbItem.first_air_date,
              voteAverage: tmdbItem.vote_average,
            },
          }
        );
        updatedCount++;
        console.log(`Updated poster and info for ${item.title}`);
      } else {
        console.log(`No poster found for ${item.title} in TMDB response`);
      }
    } catch (error) {
      console.error(`Error processing ${item.title}:`, error);
    }
  }

  console.log(
    `Poster URLs and info fetched and stored successfully for ${type}. Updated ${updatedCount} items.`
  );

  return updatedCount;
}

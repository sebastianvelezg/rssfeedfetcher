// src/lib/feedValidator.js
export function validateFeedItem(item) {
  // Required fields
  const required = ["title", "guid", "link"];
  for (const field of required) {
    if (!item[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Clean and format fields
  return {
    title: item.title.trim(),
    description: (item.description || item.overview || "").trim(),
    link: item.link.trim(),
    guid: item.guid.toString(),
    type: item.type || "movies",
    size: item.size || "",
    resolution: item.resolution || "",
    posterUrl: item.posterUrl || "",
    addedAt: item.addedAt || new Date(),
    voteAverage: item.voteAverage || null,
    releaseDate: item.releaseDate || null,
    // Additional metadata
    contentType: getContentType(item),
    quality: parseQuality(item),
  };
}

function getContentType(item) {
  const title = item.title.toLowerCase();
  if (
    title.includes("x264") ||
    title.includes("x265") ||
    title.includes("h264") ||
    title.includes("h265")
  ) {
    return "video/mp4";
  }
  return "video/unknown";
}

function parseQuality(item) {
  const title = item.title.toLowerCase();
  const qualities = ["2160p", "1080p", "720p", "480p"];
  for (const quality of qualities) {
    if (title.includes(quality)) {
      return quality;
    }
  }
  return item.resolution || "unknown";
}

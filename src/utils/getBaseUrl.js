// src/utils/getBaseUrl.js
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use current URL
    return window.location.origin;
  }
  // Server should use vercel url or localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

// src/app/page.js
import Link from "next/link";
import { Settings, AlertTriangle, Activity } from "lucide-react";
import RefreshButton from "@/components/refreshButton";
import PaginatedMovieList from "@/components/PaginatedMovieList";

async function getItems() {
  try {
    // First try to use VERCEL_URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "";

    console.log("Fetching from base URL:", baseUrl); // Debug log

    const [moviesRes, seriesRes] = await Promise.all([
      fetch(`${baseUrl}/api/get-movies`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
      fetch(`${baseUrl}/api/get-series`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
    ]);

    if (!moviesRes.ok) {
      throw new Error(`Movies fetch failed: ${moviesRes.status}`);
    }
    if (!seriesRes.ok) {
      throw new Error(`Series fetch failed: ${seriesRes.status}`);
    }

    const movies = await moviesRes.json();
    const series = await seriesRes.json();

    return { movies, series, error: null };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      movies: [],
      series: [],
      error: error.message || "Failed to fetch items",
    };
  }
}

export default async function Home() {
  const { movies, series, error } = await getItems();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#171717] to-[#1a1a1a]">
      <main className="container mx-auto px-4 py-8 max-w-[2000px]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#DA0037] to-[#b8002f] rounded-lg blur opacity-25"></div>
              <h1 className="relative text-3xl md:text-4xl font-bold text-[#EDEDED] tracking-tight">
                Latest Media
              </h1>
            </div>
          </div>
          <div className="w-100 gap-2 flex">
            <Link
              href="/settings"
              className="flex items-center gap-2 bg-[#DA0037] hover:bg-[#b8002f] text-[#EDEDED] font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg group"
            >
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
              <span>Settings</span>
            </Link>
            <Link
              href="/status"
              className="flex items-center gap-2 bg-[#DA0037] hover:bg-[#b8002f] text-[#EDEDED] font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg group"
            >
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
              <span>Status</span>
            </Link>
          </div>
        </div>

        {movies.length === 0 && series.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#2a2a2a] rounded-full p-6 mb-4">
              <Settings className="w-10 h-10 text-[#DA0037]" />
            </div>
            <h3 className="text-xl font-semibold text-[#EDEDED] mb-2">
              No Media Found
            </h3>
            <p className="text-[#EDEDED]/60 mb-6 max-w-md">
              Start by adding some RSS feeds in the settings to populate your
              media library.
            </p>
            <Link
              href="/settings"
              className="bg-[#DA0037] hover:bg-[#b8002f] text-[#EDEDED] font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Add RSS Feeds
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <section className="lg:w-1/2">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[#EDEDED]">Series</h2>
                <RefreshButton type="series" />
                <div className="h-px flex-grow bg-gradient-to-r from-[#DA0037]/50 to-transparent"></div>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#DA0037]/10 to-transparent rounded-xl blur-xl"></div>
                <div className="relative">
                  <PaginatedMovieList items={series} />
                </div>
              </div>
            </section>

            <div className="h-px lg:hidden bg-gradient-to-r from-[#DA0037]/50 via-[#DA0037]/25 to-transparent my-6"></div>

            <section className="lg:w-1/2">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[#EDEDED]">Movies</h2>
                <RefreshButton type="movies" />
                <div className="h-px flex-grow bg-gradient-to-r from-[#DA0037]/50 to-transparent"></div>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#DA0037]/10 to-transparent rounded-xl blur-xl"></div>
                <div className="relative">
                  <PaginatedMovieList items={movies} />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

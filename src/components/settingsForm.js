// src/components/settingsForm.js
"use client";

import { useState, useEffect } from "react";
import { Rss, Copy, ChevronRight, CheckCircle } from "lucide-react";
import { getBaseUrl } from "@/utils/getBaseUrl";

export default function SettingsForm() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("movies");
  const [message, setMessage] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    const response = await fetch("/api/get-feeds");
    if (response.ok) {
      const data = await response.json();
      setFeeds(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Adding feed...");
    const response = await fetch("/api/add-feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, type }),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage(
        `Feed added successfully. ${data.newItemsCount} new items processed.`
      );
      setUrl("");
      fetchFeeds();
    } else {
      setMessage("Failed to add feed: " + data.error);
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-semibold text-[#EDEDED] flex items-center space-x-2">
          <Rss size={20} className="text-[#DA0037]" />
          <span>RSS Feed Management</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#EDEDED]">
              RSS Feed URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter RSS feed URL"
              required
              className="w-full px-4 py-2.5 bg-[#171717] border border-[#444444] rounded-lg text-[#EDEDED] placeholder-[#666666] focus:border-[#DA0037] focus:ring focus:ring-[#DA0037] focus:ring-opacity-50 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#EDEDED]">
              Feed Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#171717] border border-[#444444] rounded-lg text-[#EDEDED] focus:border-[#DA0037] focus:ring focus:ring-[#DA0037] focus:ring-opacity-50 transition-all duration-200"
            >
              <option value="movies">Movies</option>
              <option value="series">Series</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#DA0037] hover:bg-[#b8002f] text-white py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#DA0037] focus:ring-opacity-50"
          >
            Add Feed
          </button>
        </form>

        {message && (
          <p
            className={`text-sm ${
              message.includes("successfully")
                ? "text-green-400"
                : "text-[#DA0037]"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Current Feeds */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[#EDEDED]">Current Feeds</h3>
        <div className="space-y-2">
          {feeds.map((feed, index) => (
            <div
              key={index}
              className="bg-[#171717] p-4 rounded-lg flex items-center justify-between group hover:bg-[#1f1f1f] transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="text-[#DA0037] font-medium capitalize">
                  {feed.type}
                </div>
                <ChevronRight size={16} className="text-[#666666]" />
                <div className="text-[#EDEDED] truncate">{feed.url}</div>
              </div>
              <button
                onClick={() => handleCopy(feed.url)}
                className="opacity-0 group-hover:opacity-100 text-[#666666] hover:text-[#DA0037] transition-all duration-200"
              >
                <Copy size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Download Feed URLs */}
      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold text-[#EDEDED]">
          Auto-Download Feed URLs
        </h3>
        {["movies", "series"].map((feedType) => (
          <div key={feedType} className="space-y-2">
            <label className="text-sm font-medium text-[#EDEDED] capitalize">
              {feedType} Feed URL
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={`${getBaseUrl()}/api/feed/${feedType}`}
                className="flex-1 px-4 py-2 bg-[#171717] border border-r-0 border-[#444444] rounded-l-lg text-[#EDEDED]"
              />
              <button
                onClick={() =>
                  handleCopy(`${getBaseUrl()}/api/feed/${feedType}`)
                }
                className="px-4 py-2 bg-[#DA0037] text-white rounded-r-lg hover:bg-[#b8002f] transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Copy Alert */}
      {showCopyAlert && (
        <div className="fixed bottom-4 right-4 animate-fade-in">
          <div className="bg-[#2a2a2a] border border-[#DA0037] text-[#EDEDED] p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-[#DA0037]" />
            <div>
              <p className="font-medium">Copied!</p>
              <p className="text-sm text-[#EDEDED]/70">
                URL copied to clipboard
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

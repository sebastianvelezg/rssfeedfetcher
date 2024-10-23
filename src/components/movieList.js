"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  Plus,
  Star,
  Calendar,
  HardDrive,
  Video,
  Maximize2,
  Loader2,
  Trash2,
  Check,
} from "lucide-react";

const Modal = ({ item, onClose }) => {
  const [addingToFeed, setAddingToFeed] = useState(false);

  const handleAddToFeed = async () => {
    try {
      setAddingToFeed(true);
      const response = await fetch("/api/add-to-feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        alert("Added to feed successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add to feed");
      }
    } catch (error) {
      console.error("Error adding to feed:", error);
      alert("Error adding to feed");
    } finally {
      setAddingToFeed(false);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#444444]/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#EDEDED] leading-tight">
              {item.title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#DA0037]/10 rounded-lg transition-colors group"
            >
              <X className="w-6 h-6 text-[#EDEDED] group-hover:text-[#DA0037] transition-colors" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#DA0037] to-[#b8002f] rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full rounded-lg shadow-lg object-cover"
                    />
                  ) : (
                    <div className="aspect-[2/3] w-full bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                      <Video className="w-12 h-12 text-[#EDEDED]/20" />
                    </div>
                  )}
                </div>
              </div>

              {item.voteAverage && (
                <div className="flex items-center gap-2 bg-[#2a2a2a] p-3 rounded-lg">
                  <Star className="w-5 h-5 text-[#DA0037]" />
                  <span className="text-[#EDEDED] font-semibold">
                    {item.voteAverage}/10
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {item.releaseDate && (
                <div className="flex items-center gap-2 text-[#EDEDED]/90">
                  <Calendar className="w-5 h-5 text-[#DA0037]" />
                  <span>
                    Released {new Date(item.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <p className="text-[#EDEDED]/80 leading-relaxed">
                {item.overview || item.contentSnippet}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {item.size && (
                  <div className="bg-[#2a2a2a] p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-[#EDEDED]/60 text-sm mb-1">
                      <HardDrive className="w-4 h-4" />
                      <span>Size</span>
                    </div>
                    <p className="text-[#EDEDED] font-medium">{item.size}</p>
                  </div>
                )}
                {item.resolution && (
                  <div className="bg-[#2a2a2a] p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-[#EDEDED]/60 text-sm mb-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>Quality</span>
                    </div>
                    <p className="text-[#EDEDED] font-medium">
                      {item.resolution}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#DA0037] hover:bg-[#b8002f] text-[#EDEDED] px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group hover:scale-105"
                >
                  <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={handleAddToFeed}
                  disabled={addingToFeed}
                  className="flex-1 bg-[#2a2a2a] text-[#EDEDED] px-6 py-3 rounded-lg border border-[#DA0037] hover:bg-[#DA0037] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>{addingToFeed ? "Adding..." : "Add to Feed"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieList = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [addingToFeed, setAddingToFeed] = useState(null);
  const [status, setStatus] = useState(null);
  const [feedStatus, setFeedStatus] = useState({});
  const [deletingFromFeed, setDeletingFromFeed] = useState(null);

  useEffect(() => {
    const checkFeedStatus = async () => {
      try {
        const response = await fetch("/api/check-feed-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guids: items.map((item) => item.guid),
            type: items[0]?.type || "movies",
          }),
        });

        if (response.ok) {
          const status = await response.json();
          setFeedStatus(status);
        }
      } catch (error) {
        console.error("Error checking feed status:", error);
      }
    };

    if (items.length > 0) {
      checkFeedStatus();
    }
  }, [items]);

  const handleAddToFeed = async (e, item) => {
    e.stopPropagation();
    try {
      setAddingToFeed(item.guid);
      const response = await fetch("/api/add-to-feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          type: item.type || "movies",
          guid: item.guid,
          title: item.title,
          link: item.link,
          description: item.description || item.overview || "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          message: data.message || "Added to feed successfully!",
          type: "success",
        });
        setFeedStatus((prev) => ({ ...prev, [item.guid]: true }));
      } else {
        throw new Error(data.error || "Failed to add to feed");
      }
    } catch (error) {
      console.error("Error adding to feed:", error);
      setStatus({
        message: error.message || "Error adding to feed",
        type: "error",
      });
    } finally {
      setAddingToFeed(null);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleDeleteFromFeed = async (e, item) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this item from your feed?")) {
      return;
    }

    try {
      setDeletingFromFeed(item.guid);
      const response = await fetch("/api/delete-from-feed", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guid: item.guid,
          type: item.type || "movies",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          message: data.message || "Removed from feed successfully!",
          type: "success",
        });
        setFeedStatus((prev) => ({ ...prev, [item.guid]: false }));
      } else {
        throw new Error(data.error || "Failed to remove from feed");
      }
    } catch (error) {
      console.error("Error removing from feed:", error);
      setStatus({
        message: error.message || "Error removing from feed",
        type: "error",
      });
    } finally {
      setDeletingFromFeed(null);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Video className="w-12 h-12 text-[#EDEDED]/20 mb-4" />
        <p className="text-[#EDEDED]/60 text-center">No items to display.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => (
          <div key={item.guid} className="group relative cursor-pointer">
            <div className="relative">
              {feedStatus[item.guid] && (
                <div className="absolute top-2 right-2 z-10 bg-[#DA0037] rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="absolute -inset-1 bg-gradient-to-r from-[#DA0037]/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div
                className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#2a2a2a] shadow-lg transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                onClick={() => setSelectedItem(item)}
              >
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-[#EDEDED]/20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                    <h3 className="text-[#EDEDED] text-sm font-medium line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      {item.voteAverage && (
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-[#DA0037]" />
                          <span className="text-[#EDEDED]/90 text-sm">
                            {item.voteAverage}
                          </span>
                        </div>
                      )}

                      {feedStatus[item.guid] ? (
                        <button
                          onClick={(e) => handleDeleteFromFeed(e, item)}
                          disabled={deletingFromFeed === item.guid}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-[#EDEDED] px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingFromFeed === item.guid ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>
                            {deletingFromFeed === item.guid
                              ? "Removing..."
                              : "Remove"}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAddToFeed(e, item)}
                          disabled={addingToFeed === item.guid}
                          className="flex items-center gap-1 bg-[#DA0037] hover:bg-[#b8002f] text-[#EDEDED] px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingToFeed === item.guid ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          <span>
                            {addingToFeed === item.guid ? "Adding..." : "Add"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {status && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
            status.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {status.message}
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <Modal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            inFeed={feedStatus[selectedItem.guid]}
            onAddToFeed={handleAddToFeed}
            onDeleteFromFeed={handleDeleteFromFeed}
          />
        </div>
      )}
    </>
  );
};

export default MovieList;

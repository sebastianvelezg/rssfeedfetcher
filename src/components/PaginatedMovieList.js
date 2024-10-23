// src/components/PaginatedMovieList.js
"use client";

import { useState } from "react";
import MovieList from "@/components/movieList";
import LoadMoreButton from "@/components/LoadMoreButton";

const ITEMS_PER_PAGE = 50;

export default function PaginatedMovieList({ items }) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
      setLoading(false);
    }, 500);
  };

  const displayedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  return (
    <div>
      <MovieList items={displayedItems} />
      {hasMore && <LoadMoreButton onClick={handleLoadMore} loading={loading} />}
    </div>
  );
}

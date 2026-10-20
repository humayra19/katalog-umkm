"use client";

import { useState } from "react";

export default function TombolBagikan({ judul, teks, url }) {
  const [pesan, setPesan] = useState("");

  const handleBagikan = async () => {
    const linkBagi =
      typeof window !== "undefined"
        ? url || window.location.href
        : url || "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: judul || document.title,
          text: teks || "Lihat produk ini di katalog toko!",
          url: linkBagi,
        });
        setPesan("Link berhasil dibagikan!");
        setTimeout(() => setPesan(""), 2500);
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(linkBagi);
        setPesan("Link tersalin");
        setTimeout(() => setPesan(""), 2500);
        return;
      } catch {
        // Fallback jika clipboard dilarang
      }
    }

    // Fallback prompt sederhana jika browser lama
    try {
      window.prompt("Salin link produk ini:", linkBagi);
      setPesan("Link tersalin");
      setTimeout(() => setPesan(""), 2500);
    } catch {
      setPesan("Gagal menyalin link.");
      setTimeout(() => setPesan(""), 2500);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleBagikan}
        className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
        aria-label="Bagikan atau salin link produk"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
          />
        </svg>
        <span>{pesan ? pesan : "Bagikan"}</span>
      </button>

      {pesan && (
        <span className="sr-only" role="status">
          {pesan}
        </span>
      )}
    </div>
  );
}


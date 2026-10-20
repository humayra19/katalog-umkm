"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BannerPromo({ daftarBanner = [] }) {
  const [indexAktif, setIndexAktif] = useState(0);

  useEffect(() => {
    if (daftarBanner.length <= 1) return;
    const interval = setInterval(() => {
      setIndexAktif((prev) => (prev + 1) % daftarBanner.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [daftarBanner.length]);

  if (!daftarBanner || daftarBanner.length === 0) {
    return null;
  }

  const banner = daftarBanner[indexAktif];

  return (
    <section
      aria-label="Banner Promo"
      className="relative mb-8 overflow-hidden rounded-3xl border border-garis bg-gradient-to-r from-utama/15 via-permukaan to-latar p-6 md:p-8"
    >
      <div className="flex flex-col-reverse items-center justify-between gap-6 md:flex-row">
        {/* Konten Teks */}
        <div className="flex flex-1 flex-col items-start gap-2.5">
          <span className="rounded-full bg-utama/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-utama">
            Promo Spesial
          </span>
          <h2 className="text-2xl font-black tracking-tight text-teks md:text-3xl">
            {banner.judul}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-teks-lembut md:text-base">
            {banner.teks}
          </p>
          {banner.tautan && (
            <Link
              href={banner.tautan}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-utama px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-utama-gelap"
            >
              <span>Lihat Penawaran</span>
              <span>→</span>
            </Link>
          )}
        </div>

        {/* Gambar Banner */}
        {banner.gambar_url && (
          <div className="relative aspect-video w-full max-w-xs shrink-0 overflow-hidden rounded-2xl border border-garis/50 bg-permukaan md:max-w-sm">
            <Image
              src={banner.gambar_url}
              alt={banner.judul}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        )}
      </div>

      {/* Indikator Slider jika lebih dari 1 */}
      {daftarBanner.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {daftarBanner.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndexAktif(i)}
              className={`h-2 rounded-full transition-all ${
                i === indexAktif ? "w-6 bg-utama" : "w-2 bg-garis hover:bg-teks-lembut"
              }`}
              aria-label={`Pindah ke banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}


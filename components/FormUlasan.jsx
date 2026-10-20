"use client";

import { useActionState, useState } from "react";
import { tambahUlasanAction } from "@/app/admin/actions";

export default function FormUlasan({ produkId }) {
  const [rating, setRating] = useState(5);
  const [state, formAction, isPending] = useActionState(tambahUlasanAction, null);

  return (
    <div className="rounded-2xl border border-garis bg-permukaan p-5 sm:p-6">
      <h3 className="text-base font-bold text-teks">Tulis Ulasan Anda</h3>
      <p className="mt-1 text-xs text-teks-lembut">
        Bagikan pengalaman Anda menggunakan produk ini kepada pembeli lain.
      </p>

      {state?.sukses && (
        <div className="mt-4 rounded-xl border border-utama/30 bg-utama/10 p-3 text-xs font-semibold text-utama">
          ✓ {state.sukses}
        </div>
      )}

      {state?.error && (
        <div className="mt-4 rounded-xl border border-bahaya/30 bg-bahaya/10 p-3 text-xs font-semibold text-bahaya">
          ⚠️ {state.error}
        </div>
      )}

      <form action={formAction} className="mt-4 flex flex-col gap-3.5">
        <input type="hidden" name="produk_id" value={produkId} />
        {/* US-38: Honeypot anti-spam */}
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        {/* Rating Bintang */}
        <div>
          <label className="text-xs font-semibold text-teks">Rating:</label>
          <div className="mt-1 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  star <= rating ? "text-amber-500" : "text-garis"
                }`}
                aria-label={`Beri rating ${star} bintang`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-xs font-bold text-teks">{rating} / 5</span>
          </div>
          <input type="hidden" name="rating" value={rating} />
        </div>

        {/* Nama Pengulas */}
        <div>
          <label htmlFor="nama_pengulas" className="text-xs font-semibold text-teks">
            Nama Anda:
          </label>
          <input
            id="nama_pengulas"
            name="nama"
            type="text"
            required
            maxLength={50}
            placeholder="Contoh: Budi Santoso"
            className="mt-1 w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>

        {/* Komentar */}
        <div>
          <label htmlFor="komentar" className="text-xs font-semibold text-teks">
            Ulasan / Komentar:
          </label>
          <textarea
            id="komentar"
            name="komentar"
            rows={3}
            required
            minLength={3}
            maxLength={500}
            placeholder="Tulis ulasan produk di sini..."
            className="mt-1 w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 self-start rounded-lg bg-utama px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-utama-gelap disabled:opacity-50"
        >
          {isPending ? "Mengirim..." : "Kirim Ulasan"}
        </button>
      </form>
    </div>
  );
}


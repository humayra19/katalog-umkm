"use client";

import { useTransition } from "react";
import {
  toggleSembunyikanUlasanAction,
  hapusUlasanAction,
} from "@/app/admin/actions";

export default function AksiModerasiUlasan({ ulasan }) {
  const [isPending, startTransition] = useTransition();

  const isHidden = Boolean(ulasan.is_hidden);

  const handleToggle = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", String(ulasan.id));
    formData.set("target_hidden", (!isHidden).toString());
    formData.set("produk_id", String(ulasan.produk_id || ""));

    startTransition(async () => {
      try {
        await toggleSembunyikanUlasanAction(formData);
      } catch (err) {
        alert(err.message || "Gagal mengubah status ulasan.");
      }
    });
  };

  const handleHapus = (e) => {
    e.preventDefault();
    if (!window.confirm(`Yakin ingin menghapus ulasan dari "${ulasan.nama}" secara permanen?`)) {
      return;
    }

    const formData = new FormData();
    formData.set("id", String(ulasan.id));
    formData.set("produk_id", String(ulasan.produk_id || ""));

    startTransition(async () => {
      try {
        await hapusUlasanAction(formData);
      } catch (err) {
        alert(err.message || "Gagal menghapus ulasan.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
          isHidden
            ? "border-utama/40 bg-utama/10 text-utama hover:bg-utama hover:text-white"
            : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white"
        }`}
      >
        {isPending ? "..." : isHidden ? "Tampilkan" : "Sembunyikan"}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleHapus}
        className="rounded-lg border border-bahaya/30 bg-bahaya/10 px-2.5 py-1 text-xs font-semibold text-bahaya transition-colors hover:bg-bahaya hover:text-white disabled:opacity-50"
      >
        {isPending ? "..." : "Hapus"}
      </button>
    </div>
  );
}


"use client";

import Link from "next/link";
import { toko } from "@/lib/toko";
import { useKeranjang } from "@/components/KeranjangContext";

export default function Header() {
  const { totalItem, setIsBukaModal } = useKeranjang();

  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <button
          type="button"
          onClick={() => setIsBukaModal(true)}
          className="relative inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
          aria-label="Buka keranjang belanja"
        >
          <span>🛒</span>
          <span className="hidden sm:inline">Keranjang</span>
          {totalItem > 0 && (
            <span className="rounded-full bg-utama px-2 py-0.5 text-xs text-white">
              {totalItem}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

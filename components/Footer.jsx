import Link from "next/link";
import { toko } from "@/lib/toko";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-garis bg-permukaan transition-colors">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-teks-lembut sm:flex-row sm:justify-between">
        <div>
          <p className="font-bold text-teks">{toko.nama}</p>
          <p>{toko.alamat}</p>
          <p>{toko.jamBuka}</p>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} {toko.nama}. Hak cipta dilindungi.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            href="/tentang"
            className="underline underline-offset-4 hover:text-utama"
          >
            Tentang kami & kontak
          </Link>
          <Link
            href="/favorit"
            className="underline underline-offset-4 hover:text-utama"
          >
            Produk favorit
          </Link>
          <Link
            href="/admin"
            className="underline underline-offset-4 hover:text-utama"
          >
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

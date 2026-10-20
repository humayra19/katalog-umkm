"use client";

import { useState } from "react";

export default function GaleriFoto({ fotoUrl, nama, fotoTambahan = [] }) {
  let daftarFoto = [];

  if (Array.isArray(fotoTambahan) && fotoTambahan.length > 0) {
    daftarFoto = [fotoUrl, ...fotoTambahan].filter(Boolean);
  } else if (typeof fotoUrl === "string") {
    if (fotoUrl.trim().startsWith("[")) {
      try {
        daftarFoto = JSON.parse(fotoUrl);
      } catch {
        daftarFoto = [fotoUrl];
      }
    } else if (fotoUrl.includes(",")) {
      daftarFoto = fotoUrl.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      daftarFoto = [fotoUrl];
    }
  } else {
    daftarFoto = [fotoUrl].filter(Boolean);
  }

  // Hilangkan duplikasi foto
  daftarFoto = Array.from(new Set(daftarFoto));

  const [fotoAktif, setFotoAktif] = useState(daftarFoto[0] || fotoUrl);

  return (
    <div className="flex flex-col gap-3">
      {/* Foto Utama */}
      <div className="overflow-hidden rounded-2xl border border-garis bg-permukaan">
        <img
          src={fotoAktif}
          alt={nama}
          className="aspect-square w-full object-cover transition-opacity duration-200"
        />
      </div>

      {/* Thumbnail Galeri (jika foto lebih dari 1) */}
      {daftarFoto.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {daftarFoto.map((foto, index) => {
            const isSelected = foto === fotoAktif;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setFotoAktif(foto)}
                className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-utama ring-2 ring-utama/20"
                    : "border-garis opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={foto}
                  alt={`${nama} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


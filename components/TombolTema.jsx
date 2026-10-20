"use client";

import { useEffect, useState } from "react";

export default function TombolTema() {
  const [tema, setTema] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tema");
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setTema("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTema("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTema = () => {
    const temaBaru = tema === "dark" ? "light" : "dark";
    setTema(temaBaru);
    localStorage.setItem("tema", temaBaru);

    if (temaBaru === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg border border-garis bg-latar" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTema}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-latar text-sm text-teks transition-colors hover:border-utama hover:text-utama"
      aria-label={tema === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={tema === "dark" ? "Mode Terang" : "Mode Gelap"}
    >
      {tema === "dark" ? "☀️" : "🌙"}
    </button>
  );
}


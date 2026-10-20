"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FavoritContext = createContext({
  favorit: [],
  totalFavorit: 0,
  isFavorit: () => false,
  toggleFavorit: () => {},
  hapusFavorit: () => {},
});

const STORAGE_KEY = "katalog_favorit";

export function FavoritProvider({ children }) {
  const [favorit, setFavorit] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const dataLokal = localStorage.getItem(STORAGE_KEY);
      if (dataLokal) {
        setFavorit(JSON.parse(dataLokal));
      }
    } catch {
      // Abaikan error saat akses localStorage
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorit));
    } catch {
      // Abaikan error saat simpan localStorage
    }
  }, [favorit, isLoaded]);

  const isFavorit = (id) => {
    return favorit.some((item) => String(item.id) === String(id));
  };

  const toggleFavorit = (produk) => {
    if (!produk || !produk.id) return;
    setFavorit((prev) => {
      const exists = prev.some((item) => String(item.id) === String(produk.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(produk.id));
      } else {
        return [...prev, produk];
      }
    });
  };

  const hapusFavorit = (id) => {
    setFavorit((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  return (
    <FavoritContext.Provider
      value={{
        favorit,
        totalFavorit: favorit.length,
        isFavorit,
        toggleFavorit,
        hapusFavorit,
      }}
    >
      {children}
    </FavoritContext.Provider>
  );
}

export function useFavorit() {
  return useContext(FavoritContext);
}


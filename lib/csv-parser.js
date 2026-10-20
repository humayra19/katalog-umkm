/**
 * Parser CSV RFC 4180 kompatibel tanpa dependensi eksternal.
 * Menangani delimiter koma/titik koma, teks berkutip, koma di dalam kutip, dan kutip ganda ter-escape ("").
 */
export function parseCsv(text) {
  if (!text || typeof text !== "string") return [];

  const lines = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  // Normalisasi line breaks
  const sanitized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const nextChar = sanitized[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // lewati kutip kedua
      } else {
        // Toggle status tanda kutip
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      currentField += char;
    } else if (char === "," || char === ";") {
      // Pemisah kolom (mendukung koma atau titik koma)
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (char === "\n") {
      currentRow.push(currentField.trim());
      // Abaikan baris kosong di akhir
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Tambahkan baris terakhir jika ada sisa
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}


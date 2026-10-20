import { NextResponse } from "next/server";
import { catatKlikWa } from "@/lib/klik-wa";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { produk_id } = body;

    if (produk_id) {
      await catatKlikWa(produk_id);
    }

    return NextResponse.json({ sukses: true });
  } catch (err) {
    // Jangan biarkan error pencatatan mengganggu pengunjung
    return NextResponse.json({ sukses: false, error: err.message }, { status: 200 });
  }
}


"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return { error: "Data formulir tidak ditemukan." };
  }

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesan = error.message;
    if (error.message === "Invalid login credentials") {
      pesan = "Email atau password salah.";
    }
    return { error: pesan };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}


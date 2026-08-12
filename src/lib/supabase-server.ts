import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export type ShareCard = {
  id: string;
  image_url: string;
  name: string;
  title: string;
  mode: "id" | "pfp" | "crew";
  created_at: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isShareConfigured() {
  return Boolean(url && serviceRole);
}

export function shareBucket() {
  return process.env.SUPABASE_SHARE_BUCKET || "hhgoa-shares";
}

export function supabaseAdmin() {
  if (!url || !serviceRole) {
    throw new Error("Public Share is not configured yet.");
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const getShareCard = cache(async (id: string): Promise<ShareCard | null> => {
  if (!isShareConfigured()) return null;
  const { data } = await supabaseAdmin()
    .from("share_cards")
    .select("id, image_url, name, title, mode, created_at")
    .eq("id", id)
    .maybeSingle<ShareCard>();
  return data;
});

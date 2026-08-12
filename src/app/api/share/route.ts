import { NextResponse } from "next/server";
import { isShareConfigured, shareBucket, supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

const MAX_SHARE_IMAGE_BYTES = 3 * 1024 * 1024;

function asString(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.slice(0, 120) : fallback;
}

export async function POST(request: Request) {
  if (!isShareConfigured()) {
    return NextResponse.json({ error: "Public Share is not configured yet." }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File) || !image.size) {
      return NextResponse.json({ error: "A rendered share image is required." }, { status: 400 });
    }
    if (image.size > MAX_SHARE_IMAGE_BYTES) {
      return NextResponse.json({ error: "That share image is too large. Please try again." }, { status: 413 });
    }
    if (image.type !== "image/jpeg") {
      return NextResponse.json({ error: "Share images must be JPEGs." }, { status: 400 });
    }

    const mode = asString(form.get("mode"));
    if (mode !== "id" && mode !== "pfp" && mode !== "crew") {
      return NextResponse.json({ error: "Invalid graphic format." }, { status: 400 });
    }
    const name = asString(form.get("name"), "HH Goa builder");
    const title = asString(form.get("title"), "Builder");
    const id = crypto.randomUUID();
    const supabase = supabaseAdmin();
    const objectPath = `x-previews/${id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(shareBucket())
      .upload(objectPath, image, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from(shareBucket()).getPublicUrl(objectPath);
    const { error: recordError } = await supabase.from("share_cards").insert({
      id,
      image_url: publicUrl.publicUrl,
      name,
      title,
      mode,
    });
    if (recordError) {
      await supabase.storage.from(shareBucket()).remove([objectPath]);
      throw recordError;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    return NextResponse.json({ shareUrl: `${baseUrl.replace(/\/$/, "")}/share/${id}` });
  } catch (error) {
    console.error("Could not create HH Goa share card", error);
    return NextResponse.json({ error: "Could not create your public preview. Please try again." }, { status: 500 });
  }
}

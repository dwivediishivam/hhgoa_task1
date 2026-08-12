import { NextResponse } from "next/server";
import { isShareConfigured, shareBucket, supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

const MAX_SHARE_IMAGE_BYTES = 3 * 1024 * 1024;

function asString(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.slice(0, 120) : fallback;
}

function publicBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  try {
    const candidate = new URL(configured || request.url);
    const isPlaceholder = ["your-production-domain.com", "your-vercel-domain.vercel.app"].includes(candidate.hostname);
    if (!isPlaceholder && (candidate.protocol === "https:" || candidate.protocol === "http:")) {
      return candidate.origin;
    }
  } catch {
    // A deployment should still share from its actual request URL when the setting is incomplete.
  }
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isShareConfigured()) {
    return NextResponse.json({
      error: "Share is not configured on this deployment. Add the Supabase environment variables in Vercel and redeploy.",
      code: "SHARE_NOT_CONFIGURED",
    }, { status: 503 });
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

    return NextResponse.json({ shareUrl: `${publicBaseUrl(request)}/share/${id}` });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Unknown share error";
    console.error("Could not create HH Goa share card", { message: rawMessage });
    const lower = rawMessage.toLowerCase();
    const hint = lower.includes("bucket") || lower.includes("not found")
      ? "Create the hhgoa-shares Storage bucket and the share_cards table in Supabase, then try again."
      : lower.includes("row-level security") || lower.includes("permission") || lower.includes("policy")
        ? "Check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel (not the anon key), then redeploy."
        : "Please try again. If it repeats, check the Vercel function logs for /api/share.";
    return NextResponse.json({
      error: `Could not create your public preview. ${hint}`,
      code: "SHARE_CREATE_FAILED",
    }, { status: 500 });
  }
}

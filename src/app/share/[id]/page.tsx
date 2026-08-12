import type { Metadata } from "next";

/* Social image is a user-generated public Storage URL. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShareCard } from "@/lib/supabase-server";

type PageProps = { params: Promise<{ id: string }> };

const label: Record<string, string> = {
  id: "Builder ID",
  pfp: "PFP Frame",
  crew: "Crew Manifest",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getShareCard(id);
  if (!card) return { title: "HH Goa Builder House" };
  const title = `${card.name} — HH Goa 2026 ${label[card.mode]}`;
  const description = `${card.title}. Make your Builder House identity for HH Goa 2026.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: card.image_url, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [card.image_url] },
  };
}

export default async function SharedCardPage({ params }: PageProps) {
  const { id } = await params;
  const card = await getShareCard(id);
  if (!card) notFound();
  return (
    <main className="share-page">
      <div className="share-card-wrap">
        <p>HH GOA 2026 / BUILDER HOUSE</p>
        <img src={card.image_url} alt={`${card.name}'s HH Goa ${label[card.mode]}`} />
        <h1>{card.name}</h1>
        <span>{card.title}</span>
        <Link href="/">MAKE YOUR OWN <b>↗</b></Link>
      </div>
    </main>
  );
}

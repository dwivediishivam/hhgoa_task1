"use client";

import type { Crop } from "@/lib/types";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function isHeic(file: File) {
  return /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export async function normalizeImage(file: File): Promise<File> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Choose a photo under 20 MB so it stays quick on mobile.");
  }
  if (!file.type.startsWith("image/") && !isHeic(file)) {
    throw new Error("Use a JPG, PNG, WebP, or HEIC photo.");
  }
  if (!isHeic(file)) return file;

  const converter = (await import("heic2any")).default;
  const converted = await converter({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return new File([blob], file.name.replace(/\.hei[cf]$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

export function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("We couldn't read that photo. Try another image."));
    image.src = source;
  });
}

export function coverRect(
  image: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  crop: Crop,
) {
  const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight) * crop.zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const overflowX = Math.max(0, width - box.width);
  const overflowY = Math.max(0, height - box.height);
  return {
    x: box.x + (box.width - width) / 2 + crop.x * overflowX * 0.5,
    y: box.y + (box.height - height) / 2 + crop.y * overflowY * 0.5,
    width,
    height,
  };
}

export function clampCrop(crop: Crop): Crop {
  return {
    zoom: Math.max(1, Math.min(2.6, crop.zoom)),
    x: Math.max(-1, Math.min(1, crop.x)),
    y: Math.max(-1, Math.min(1, crop.y)),
  };
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  crop: Crop,
) {
  const rect = coverRect(image, box, crop);
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed. Please try again."))), "image/jpeg", quality);
  });
}

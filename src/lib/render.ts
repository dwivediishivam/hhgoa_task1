"use client";

import { compactName, compactRole } from "@/lib/title";
import type { BuilderProfile, Crop, StudioMode, Theme } from "@/lib/types";
import { drawImageCover, loadImage, roundedRect } from "@/lib/image";

type RenderOptions = {
  width?: number;
  height?: number;
  social?: boolean;
};

type Palette = {
  ground: string;
  ink: string;
  signal: string;
  accent: string;
  hot: string;
};

const THEMES: Record<Theme, Palette> = {
  tide: { ground: "#FFFBE8", ink: "#0B6839", signal: "#FEE101", accent: "#4EC5D8", hot: "#FF0080" },
  heat: { ground: "#FEE101", ink: "#0B6839", signal: "#FFFBE8", accent: "#FF0080", hot: "#FF0080" },
  night: { ground: "#0B6839", ink: "#FFFBE8", signal: "#FEE101", accent: "#45C5D9", hot: "#FF0080" },
};

const GRAIN_DOTS = Array.from({ length: 190 }, (_, index) => {
  const x = ((index * 67 + 19) % 997) / 997;
  const y = ((index * 131 + 71) % 991) / 991;
  const r = 0.35 + ((index * 17) % 7) / 10;
  return { x, y, r };
});

function font(size: number, family: "display" | "mono" | "sans" = "sans", weight = 700) {
  if (family === "display") return `${weight} ${size}px "Imbue", Georgia, serif`;
  if (family === "mono") return `${weight} ${size}px "Victor Mono", "SFMono-Regular", monospace`;
  return `${weight} ${size}px Inter, Arial, sans-serif`;
}

function scaleText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, initialSize: number, family: "display" | "mono" | "sans", weight = 700) {
  let size = initialSize;
  ctx.font = font(size, family, weight);
  while (ctx.measureText(value).width > maxWidth && size > 10) {
    size -= 1;
    ctx.font = font(size, family, weight);
  }
  return size;
}

function fillNoise(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, alpha = 0.08) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (const dot of GRAIN_DOTS) {
    ctx.beginPath();
    ctx.arc(dot.x * width, dot.y * height, dot.r * (width / 900), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, upsideDown = false) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  if (upsideDown) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size / 2, y + size * 0.86);
  } else {
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size, y + size * 0.86);
    ctx.lineTo(x, y + size * 0.86);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, unit: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, x, y, unit * 1.48, unit * 0.26, unit * 0.13);
  ctx.fill();
  roundedRect(ctx, x + unit * 0.61, y - unit * 0.61, unit * 0.26, unit * 1.48, unit * 0.13);
  ctx.fill();
  ctx.restore();
}

function drawBarCode(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, seed = 17) {
  const units = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 3, 2, 1, 2, 3];
  const gap = width / units.reduce((total, unit) => total + unit + 0.8, 0);
  let cursor = x;
  ctx.save();
  ctx.fillStyle = color;
  units.forEach((unit, index) => {
    const barHeight = height * (index % 5 === 0 || (index + seed) % 7 === 0 ? 1 : 0.76);
    ctx.fillRect(cursor, y + height - barHeight, unit * gap, barHeight);
    cursor += (unit + 0.8) * gap;
  });
  ctx.restore();
}

function drawPhotoPlaceholder(ctx: CanvasRenderingContext2D, box: { x: number; y: number; width: number; height: number }, palette: Palette) {
  const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.width, box.y + box.height);
  gradient.addColorStop(0, palette.accent);
  gradient.addColorStop(0.52, palette.signal);
  gradient.addColorStop(1, palette.hot);
  ctx.fillStyle = gradient;
  ctx.fillRect(box.x, box.y, box.width, box.height);
  ctx.fillStyle = palette.ink;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(box.x + box.width * 0.53, box.y + box.height * 0.36, box.width * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(box.x + box.width * 0.52, box.y + box.height * 0.86, box.width * 0.33, box.height * 0.29, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = Math.max(2, box.width * 0.008);
  for (let i = -box.height; i < box.width; i += box.width * 0.16) {
    ctx.beginPath();
    ctx.moveTo(box.x + i, box.y + box.height);
    ctx.lineTo(box.x + i + box.height, box.y);
    ctx.stroke();
  }
}

async function getLoadedImage(source: string | null) {
  if (!source) return null;
  try {
    return await loadImage(source);
  } catch {
    return null;
  }
}

function clipRounded(ctx: CanvasRenderingContext2D, box: { x: number; y: number; width: number; height: number }, radius: number) {
  roundedRect(ctx, box.x, box.y, box.width, box.height, radius);
  ctx.clip();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  box: { x: number; y: number; width: number; height: number },
  crop: Crop,
  palette: Palette,
) {
  ctx.save();
  if (image) drawImageCover(ctx, image, box, crop);
  else drawPhotoPlaceholder(ctx, box, palette);
  ctx.restore();
}

function splitLine(value: string, maxLength: number) {
  const words = value.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = `${line} ${word}`.trim();
    if (candidate.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

async function renderId(ctx: CanvasRenderingContext2D, profile: BuilderProfile, width: number, height: number) {
  const p = THEMES[profile.theme];
  const sx = width / 1200;
  const sy = height / 1500;
  const s = Math.min(sx, sy);
  ctx.save();
  ctx.scale(sx, sy);
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, 1200, 1500);
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, 1200, 238);
  ctx.fillStyle = p.signal;
  ctx.fillRect(0, 238, 1200, 14);
  ctx.fillStyle = p.hot;
  ctx.fillRect(0, 252, 1200, 8);
  fillNoise(ctx, 1200, 1500, p.ink, 0.08);

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = 2;
  for (let x = -250; x < 1400; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 260);
    ctx.lineTo(x + 550, 1500);
    ctx.stroke();
  }
  ctx.restore();

  drawLogo(ctx, 64, 55, 35, p.signal);
  ctx.fillStyle = p.ground;
  ctx.font = font(30, "mono", 600);
  ctx.fillText("HH GOA / 2026", 136, 84);
  ctx.font = font(16, "mono", 500);
  ctx.fillText("BUILDER IDENTIFICATION", 136, 112);
  ctx.textAlign = "right";
  ctx.fillText("28—31 OCT  •  GOA, INDIA", 1132, 84);
  ctx.fillStyle = p.signal;
  ctx.font = font(23, "mono", 600);
  ctx.fillText("ISSUED // 02:47 PM", 1132, 118);
  ctx.textAlign = "left";

  const image = await getLoadedImage(profile.image);
  const photo = { x: 64, y: 310, width: 680, height: 786 };
  ctx.save();
  clipRounded(ctx, photo, 34);
  drawPhoto(ctx, image, photo, profile.crop, p);
  const shadowGradient = ctx.createLinearGradient(0, photo.y + photo.height * 0.55, 0, photo.y + photo.height);
  shadowGradient.addColorStop(0, "rgba(0,0,0,0)");
  shadowGradient.addColorStop(1, "rgba(4,35,20,.55)");
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(photo.x, photo.y, photo.width, photo.height);
  ctx.restore();
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = 7;
  roundedRect(ctx, photo.x, photo.y, photo.width, photo.height, 34);
  ctx.stroke();

  ctx.fillStyle = p.signal;
  ctx.globalAlpha = 0.95;
  drawTriangle(ctx, 641, 304, 146, p.signal);
  drawTriangle(ctx, 710, 386, 94, p.hot, true);
  ctx.globalAlpha = 1;

  const detailX = 796;
  ctx.fillStyle = p.ink;
  ctx.font = font(17, "mono", 600);
  ctx.fillText("IDENTITY // 0247", detailX, 336);
  ctx.fillStyle = p.hot;
  ctx.fillRect(detailX, 354, 330, 7);

  const name = compactName(profile.name);
  const nameSize = scaleText(ctx, name, 340, 69, "display", 800);
  ctx.fillStyle = p.ink;
  ctx.font = font(nameSize, "display", 800);
  const nameLines = splitLine(name, 12);
  nameLines.forEach((line, index) => ctx.fillText(line, detailX, 442 + index * (nameSize * 0.8)));

  const titleStart = nameLines.length > 1 ? 555 : 508;
  ctx.fillStyle = p.ink;
  ctx.font = font(15, "mono", 600);
  ctx.fillText("BUILDER CLASS", detailX, titleStart);
  ctx.fillStyle = p.hot;
  ctx.font = font(40, "display", 800);
  const titleLines = splitLine(profile.title.toUpperCase(), 17);
  titleLines.forEach((line, index) => ctx.fillText(line, detailX, titleStart + 43 + index * 36));

  const roleStart = titleStart + 130;
  ctx.fillStyle = p.ink;
  ctx.font = font(15, "mono", 600);
  ctx.fillText("STACK / ROLE", detailX, roleStart);
  ctx.font = font(24, "mono", 600);
  const roleLines = splitLine(compactRole(profile.role), 25);
  roleLines.forEach((line, index) => ctx.fillText(line, detailX, roleStart + 33 + index * 29));

  ctx.strokeStyle = p.ink;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(detailX, 826);
  ctx.lineTo(1130, 826);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.font = font(15, "mono", 600);
  ctx.fillText("ACCESS", detailX, 864);
  ctx.fillStyle = p.ink;
  ctx.font = font(29, "display", 800);
  ctx.fillText("BUILD STATION", detailX, 898);
  ctx.font = font(14, "mono", 600);
  ctx.fillText("SIGNAL LOCKED / GOA", detailX, 928);

  ctx.fillStyle = p.ink;
  roundedRect(ctx, 64, 1146, 1072, 212, 30);
  ctx.fill();
  ctx.fillStyle = p.signal;
  ctx.font = font(18, "mono", 600);
  ctx.fillText("BUILDER PASSPORT", 98, 1191);
  ctx.fillStyle = p.ground;
  ctx.font = font(52, "display", 800);
  ctx.fillText(profile.crewName.trim().toUpperCase() || "INDEPENDENT SIGNAL", 98, 1251);
  ctx.font = font(15, "mono", 500);
  ctx.fillText("ONE RHYTHM. EVERYTHING INTENTIONAL.", 98, 1286);
  drawBarCode(ctx, 96, 1306, 510, 28, p.ground, profile.titleSeed);
  ctx.fillStyle = p.signal;
  ctx.font = font(15, "mono", 600);
  ctx.textAlign = "right";
  ctx.fillText("#FRAMEINGOA", 1102, 1212);
  ctx.fillStyle = p.ground;
  ctx.font = font(38, "display", 800);
  ctx.fillText("HH / 26", 1102, 1254);
  ctx.textAlign = "left";

  ctx.fillStyle = p.ink;
  ctx.font = font(16, "mono", 600);
  ctx.fillText("GOA, INDIA  •  28—31 OCT 2026", 64, 1424);
  ctx.textAlign = "right";
  ctx.fillText("247PM STUDIO  /  NOISE ↓  SIGNAL ↑", 1136, 1424);
  ctx.textAlign = "left";
  drawTriangle(ctx, 1038, 1375, 92, p.hot, true);
  ctx.restore();
  return s;
}

async function renderPfp(ctx: CanvasRenderingContext2D, profile: BuilderProfile, width: number, height: number) {
  const p = THEMES[profile.theme];
  const sx = width / 2048;
  const sy = height / 2048;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, 2048, 2048);
  fillNoise(ctx, 2048, 2048, p.ground, 0.1);

  ctx.save();
  ctx.strokeStyle = p.signal;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 4;
  for (let i = -600; i < 2350; i += 94) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 700, 2048);
    ctx.stroke();
  }
  ctx.restore();

  const photo = { x: 176, y: 176, width: 1696, height: 1696 };
  const image = await getLoadedImage(profile.image);
  ctx.save();
  ctx.beginPath();
  ctx.arc(1024, 1024, 850, 0, Math.PI * 2);
  ctx.clip();
  drawPhoto(ctx, image, photo, profile.crop, p);
  ctx.restore();

  ctx.strokeStyle = p.signal;
  ctx.lineWidth = 52;
  ctx.beginPath();
  ctx.arc(1024, 1024, 864, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = p.hot;
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.arc(1024, 1024, 820, -1.2, 0.55);
  ctx.stroke();
  ctx.strokeStyle = p.ground;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(1024, 1024, 905, 1.65, 4.5);
  ctx.stroke();

  ctx.fillStyle = p.signal;
  ctx.save();
  ctx.translate(150, 240);
  ctx.rotate(-0.13);
  roundedRect(ctx, 0, 0, 610, 104, 52);
  ctx.fill();
  ctx.fillStyle = p.ink;
  ctx.font = font(54, "display", 800);
  ctx.fillText("HH GOA ’26", 50, 72);
  ctx.restore();

  ctx.save();
  ctx.translate(1260, 1688);
  ctx.rotate(0.14);
  ctx.fillStyle = p.hot;
  roundedRect(ctx, 0, 0, 638, 125, 58);
  ctx.fill();
  ctx.fillStyle = p.ground;
  ctx.font = font(29, "mono", 700);
  ctx.fillText("#FRAMEINGOA", 68, 75);
  ctx.restore();

  drawTriangle(ctx, 1610, 144, 238, p.hot);
  drawTriangle(ctx, 38, 1692, 226, p.accent, true);
  ctx.fillStyle = p.ground;
  ctx.font = font(24, "mono", 600);
  ctx.fillText("GOA, INDIA", 192, 1900);
  ctx.textAlign = "right";
  ctx.fillText("28—31 OCT 2026", 1855, 1900);
  ctx.textAlign = "left";
  drawLogo(ctx, 944, 938, 53, p.ground);
  ctx.restore();
}

async function renderCrew(ctx: CanvasRenderingContext2D, profile: BuilderProfile, width: number, height: number) {
  const p = THEMES[profile.theme];
  const sx = width / 1600;
  const sy = height / 1200;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, 1600, 1200);
  fillNoise(ctx, 1600, 1200, p.ground, 0.09);
  ctx.save();
  ctx.fillStyle = p.signal;
  ctx.globalAlpha = 0.96;
  ctx.beginPath();
  ctx.arc(1425, 132, 305, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = p.ground;
  ctx.font = font(113, "display", 800);
  ctx.fillText("BUILD", 70, 150);
  ctx.fillStyle = p.signal;
  ctx.font = font(113, "display", 800);
  ctx.fillText("CREW", 70, 238);
  ctx.fillStyle = p.ground;
  ctx.font = font(20, "mono", 600);
  ctx.fillText("HH GOA 2026  /  28—31 OCT  /  GOA, INDIA", 75, 282);
  ctx.fillStyle = p.ink;
  ctx.font = font(20, "mono", 700);
  ctx.textAlign = "right";
  ctx.fillText("ONE RHYTHM. EVERYTHING INTENTIONAL.", 1530, 92);
  ctx.textAlign = "left";

  const visible = [
    { id: "self", name: profile.name, role: profile.role, image: profile.image, crop: profile.crop },
    ...profile.members,
  ].slice(0, 4);
  const slots = [
    { x: 70, y: 360, width: 352, height: 542 },
    { x: 446, y: 360, width: 352, height: 542 },
    { x: 822, y: 360, width: 352, height: 542 },
    { x: 1198, y: 360, width: 332, height: 542 },
  ];
  await Promise.all(
    slots.map(async (slot, index) => {
      const member = visible[index];
      ctx.save();
      roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 24);
      ctx.fillStyle = member ? p.ground : "rgba(255,251,232,.12)";
      ctx.fill();
      ctx.save();
      clipRounded(ctx, slot, 24);
      if (member) {
        const image = await getLoadedImage(member.image);
        drawPhoto(ctx, image, slot, member.crop, p);
        const shade = ctx.createLinearGradient(0, slot.y + slot.height * .55, 0, slot.y + slot.height);
        shade.addColorStop(0, "rgba(0,0,0,0)");
        shade.addColorStop(1, "rgba(4,35,20,.82)");
        ctx.fillStyle = shade;
        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
      } else {
        ctx.fillStyle = p.hot;
        ctx.globalAlpha = .55;
        drawTriangle(ctx, slot.x + slot.width / 2 - 55, slot.y + 200, 110, p.hot);
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.ground;
        ctx.font = font(18, "mono", 700);
        ctx.textAlign = "center";
        ctx.fillText("OPEN SLOT", slot.x + slot.width / 2, slot.y + 350);
        ctx.textAlign = "left";
      }
      ctx.restore();
      ctx.strokeStyle = p.signal;
      ctx.lineWidth = 5;
      roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 24);
      ctx.stroke();
      if (member) {
        ctx.fillStyle = p.ground;
        const memberName = compactName(member.name, "CREW MEMBER");
        const memberSize = scaleText(ctx, memberName, slot.width - 36, 41, "display", 800);
        ctx.font = font(memberSize, "display", 800);
        ctx.fillText(memberName, slot.x + 18, slot.y + slot.height - 58);
        ctx.fillStyle = p.signal;
        ctx.font = font(14, "mono", 600);
        ctx.fillText(compactRole(member.role, "BUILDER").slice(0, 26), slot.x + 20, slot.y + slot.height - 28);
      }
      ctx.restore();
    }),
  );

  ctx.fillStyle = p.signal;
  roundedRect(ctx, 70, 970, 1460, 112, 30);
  ctx.fill();
  ctx.fillStyle = p.ink;
  ctx.font = font(51, "display", 800);
  const crewName = (profile.crewName.trim() || "THE SIGNAL COLLECTIVE").toUpperCase();
  scaleText(ctx, crewName, 930, 51, "display", 800);
  ctx.fillText(crewName, 102, 1045);
  ctx.textAlign = "right";
  ctx.font = font(18, "mono", 700);
  ctx.fillText(`${visible.length.toString().padStart(2, "0")} BUILDERS / #FRAMEINGOA`, 1494, 1038);
  ctx.textAlign = "left";
  ctx.fillStyle = p.ground;
  ctx.font = font(18, "mono", 600);
  ctx.fillText("247PM STUDIO  ×  HH GOA", 70, 1148);
  ctx.textAlign = "right";
  ctx.fillText("BUILD / SHIP / LAUNCH", 1530, 1148);
  ctx.textAlign = "left";
  drawTriangle(ctx, 1418, 169, 150, p.hot, true);
  ctx.restore();
}

export function outputDimensions(mode: StudioMode, social = false) {
  if (social) return { width: 1200, height: 630 };
  if (mode === "pfp") return { width: 2048, height: 2048 };
  if (mode === "crew") return { width: 1600, height: 1200 };
  return { width: 1200, height: 1500 };
}

function drawSocialBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number, profile: BuilderProfile) {
  const p = THEMES[profile.theme];
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = p.signal;
  ctx.beginPath();
  ctx.arc(width * .91, height * .13, width * .24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.ground;
  ctx.font = font(52, "display", 800);
  ctx.fillText("HH GOA ’26", 48, 75);
  ctx.font = font(18, "mono", 600);
  ctx.fillText("BUILDER IDENTITY  /  #FRAMEINGOA", 50, 105);
}

async function renderSocial(ctx: CanvasRenderingContext2D, mode: StudioMode, profile: BuilderProfile, width: number, height: number) {
  drawSocialBackdrop(ctx, width, height, profile);
  const p = THEMES[profile.theme];
  const image = await getLoadedImage(profile.image);
  const cardBox = mode === "id" ? { x: 84, y: 128, width: 328, height: 410 } : { x: 135, y: 124, width: 410, height: 410 };
  ctx.save();
  roundedRect(ctx, cardBox.x, cardBox.y, cardBox.width, cardBox.height, 23);
  ctx.clip();
  if (mode === "pfp") {
    ctx.beginPath();
    ctx.arc(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2, cardBox.width * .47, 0, Math.PI * 2);
    ctx.clip();
  }
  drawPhoto(ctx, image, cardBox, profile.crop, p);
  ctx.restore();
  ctx.strokeStyle = p.signal;
  ctx.lineWidth = mode === "pfp" ? 18 : 7;
  if (mode === "pfp") {
    ctx.beginPath();
    ctx.arc(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2, cardBox.width * .47, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundedRect(ctx, cardBox.x, cardBox.y, cardBox.width, cardBox.height, 23);
    ctx.stroke();
  }
  ctx.fillStyle = p.ground;
  ctx.font = font(67, "display", 800);
  scaleText(ctx, compactName(profile.name), 580, 67, "display", 800);
  ctx.fillText(compactName(profile.name), 600, 262);
  ctx.fillStyle = p.signal;
  ctx.font = font(22, "mono", 700);
  ctx.fillText(compactRole(profile.role), 603, 307);
  ctx.fillStyle = p.hot;
  ctx.font = font(42, "display", 800);
  const title = splitLine(profile.title.toUpperCase(), 24);
  title.forEach((line, index) => ctx.fillText(line, 600, 372 + index * 39));
  ctx.fillStyle = p.ground;
  ctx.font = font(17, "mono", 600);
  ctx.fillText("28—31 OCT 2026  •  GOA, INDIA", 603, 485);
  ctx.fillStyle = p.signal;
  roundedRect(ctx, 600, 512, 425, 58, 29);
  ctx.fill();
  ctx.fillStyle = p.ink;
  ctx.font = font(18, "mono", 700);
  ctx.fillText("MAKE YOURS →", 633, 549);
}

export async function renderGraphic(
  canvas: HTMLCanvasElement,
  mode: StudioMode,
  profile: BuilderProfile,
  options: RenderOptions = {},
) {
  const dimensions = options.social ? outputDimensions(mode, true) : {
    width: options.width ?? outputDimensions(mode).width,
    height: options.height ?? outputDimensions(mode).height,
  };
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Your browser doesn't support image rendering.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (options.social) await renderSocial(ctx, mode, profile, dimensions.width, dimensions.height);
  else if (mode === "id") await renderId(ctx, profile, dimensions.width, dimensions.height);
  else if (mode === "pfp") await renderPfp(ctx, profile, dimensions.width, dimensions.height);
  else await renderCrew(ctx, profile, dimensions.width, dimensions.height);
  return canvas;
}

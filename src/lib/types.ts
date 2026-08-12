export type StudioMode = "id" | "pfp" | "crew";

export type Theme = "tide" | "heat" | "night";

export type Crop = {
  x: number;
  y: number;
  zoom: number;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  image: string | null;
  crop: Crop;
};

export type BuilderProfile = {
  name: string;
  role: string;
  title: string;
  titleSeed: number;
  image: string | null;
  crop: Crop;
  theme: Theme;
  crewName: string;
  members: Member[];
};

export const DEFAULT_CROP: Crop = { x: 0, y: 0, zoom: 1 };

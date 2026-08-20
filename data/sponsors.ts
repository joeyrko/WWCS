export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  // When set, the slideshow renders this artwork instead of the gradient
  // name/tagline card — used for real sponsor board graphics.
  imageUrl?: string;
}

export const sponsors: Sponsor[] = [
  { id: "s1", name: "Honest Solar", tagline: "", imageUrl: "/sponsor-honest-solar.webp" },
  { id: "s7", name: "WWC Sponsors", tagline: "", imageUrl: "/sponsor-board.webp" },
];

export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
}

// Fictional sponsor roster — placeholder brands until real sponsor artwork
// is supplied (see components/events/sponsor-slideshow.tsx).
export const sponsors: Sponsor[] = [
  { id: "s1", name: "Isla Cola", tagline: "Official Soft Drink of WWC" },
  { id: "s2", name: "Coquí Motors", tagline: "Official Vehicle Partner" },
  { id: "s3", name: "Bahía Airlines", tagline: "Official Airline of WWC" },
  { id: "s4", name: "Tropical Brews", tagline: "Official Beer of WWC" },
  { id: "s5", name: "Banco del Caribe", tagline: "Official Banking Partner" },
  { id: "s6", name: "San Juan Wireless", tagline: "Official Mobile Partner" },
];

import type { ShowType } from "@/types";

// Single source of truth for category labels/ordering — used by the video
// card hover badges, the Home/History page browse rows, and the admin
// Events category dropdown, so all three always agree.

export const SHOW_TYPE_LABEL: Record<ShowType, string> = {
  "live-event": "Live Event",
  "tv-event": "TV Event",
  documentary: "Documentary",
  "dark-match": "Dark Match",
  "1970s": "1970's",
  "1980s": "1980's",
  "1990s": "1990's",
  "2000s": "2000's",
  "2010s": "2010's",
  "2020s": "2020's",
};

// Row-title form (plural where that reads better) and the fixed order rows
// render in on the Home and History pages.
export const CATEGORY_ROW_LABEL: Record<ShowType, string> = {
  "live-event": "Live",
  "tv-event": "TV Events",
  documentary: "Documentaries",
  "dark-match": "Dark Matches",
  "1970s": "1970's",
  "1980s": "1980's",
  "1990s": "1990's",
  "2000s": "2000's",
  "2010s": "2010's",
  "2020s": "2020's",
};

export const CATEGORY_ROW_ORDER: ShowType[] = [
  "live-event",
  "tv-event",
  "documentary",
  "dark-match",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "2020s",
];

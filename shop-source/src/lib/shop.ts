import {
  BookOpen,
  Layers,
  MonitorPlay,
  Headphones,
  LayoutGrid,
  Bookmark,
} from "lucide-react";
export type Category = "Books" | "Flashcards" | "Courses" | "Audio companions";
export type Product = {
  id: string;
  position: number;
  title: string;
  category: Category;
  level: string;
  price: number;
  image: string;
  summary: string;
  description: string;
  format: string;
  retailer: string;
  purchase_url: string | null;
  published: boolean;
  coming_soon?: boolean;
  details: {
    features: string[];
    samples: { ar: string; latin: string; en: string }[];
    subtitle: string;
    video?: string;
    poster?: string;
    captions?: string;
    preview_title?: string;
    preview_pages?: string[];
    preview_pdf?: string;
  };
};
export const icons = {
  Books: BookOpen,
  Flashcards: Layers,
  Courses: MonitorPlay,
  "Audio companions": Headphones,
  All: LayoutGrid,
  Saved: Bookmark,
};
export const categories: Category[] = [
  "Books",
  "Flashcards",
  "Courses",
  "Audio companions",
];
export const singular: Record<Category, string> = {
  Books: "Book",
  Flashcards: "Flashcards",
  Courses: "Video course",
  "Audio companions": "Audio companion",
};
export const site = "https://darjawithmongia.com/";
export const asset = (p: string) =>
  /^https:\/\//i.test(p) ? p : import.meta.env.BASE_URL + p;
export const apiBase = import.meta.env.VITE_API_BASE || "";
export const staticMode =
  (location.hostname.endsWith("github.io") ||
    import.meta.env.VITE_STATIC_SHOP === "true") &&
  !apiBase;
export const money = (p: number) =>
  p === 0
    ? "Free"
    : new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: "EUR",
      }).format(p);
export function shelfKey() {
  let key = localStorage.getItem("darja-shelf-key");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("darja-shelf-key", key);
  }
  return key;
}
export const openProduct = (id: string) => {
  location.hash = "/product/" + id;
};
export const openAudio = () => {
  location.hash = "/audio";
};
export const closeView = () => {
  location.hash = "/shop";
};

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { site } from "../lib/shop";

const lessons = site + "free-lessons.html";
const topics = [
  ["Start here · Beginners", "#start-here"],
  ["All free lessons", ""],
  ["Vocabulary", "?category=vocabulary#lessons"],
  ["Conversations", "?category=conversation#lessons"],
  ["Grammar", "?category=grammar#lessons"],
  ["Tunisian culture", "?category=culture#lessons"],
];

export function LessonMenu() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const topicsId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      if (menu.current?.contains(document.activeElement)) {
        event.preventDefault();
        toggle.current?.focus();
      }
    }
    function close() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pageshow", close);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pageshow", close);
    };
  }, [open]);

  return (
    <div
      className="shop-lesson-menu"
      ref={menu}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <a href={lessons}>Free Lessons</a>
      <button
        className="shop-lesson-toggle"
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={topicsId}
        aria-label={open ? "Close Free Lessons topics" : "Open Free Lessons topics"}
        onClick={() => setOpen(!open)}
      >
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <ul id={topicsId} className="shop-lesson-topics" hidden={!open}>
        {topics.map(([label, suffix]) => (
          <li key={label}><a href={lessons + suffix}>{label}</a></li>
        ))}
      </ul>
    </div>
  );
}

// Keep the same preference as the homepage, including changes in other tabs.
const themeKey = "darja-color-theme";

function readDarkMode() {
  try {
    return localStorage.getItem(themeKey) === "dark";
  } catch {
    return false;
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(readDarkMode);

  useEffect(() => {
    const sync = () => setDark(readDarkMode());
    function handleStorage(event: StorageEvent) {
      if (event.key === themeKey || event.key === null) sync();
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pageshow", sync);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#17151d" : "#432840");
  }, [dark]);

  const label = dark ? "Light mode" : "Dark mode";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      className="shop-theme-toggle"
      type="button"
      aria-pressed={dark}
      aria-label={`Switch to ${label.toLowerCase()}`}
      onClick={() => {
        setDark(!dark);
        try {
          localStorage.setItem(themeKey, dark ? "light" : "dark");
        } catch {
          // The toggle still works when storage is unavailable.
        }
      }}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export function ShopFooter() {
  const logo = site + "images/performance/logo-a1aa5bfd1b-";
  const logoSources = [160, 240, 320, 480]
    .map((width) => `${logo}${width}-lossless.webp ${width}w`)
    .join(", ");

  return (
    <footer className="shop-site-footer">
      <div className="shop-footer-main">
        <div className="shop-footer-brand">
          <img
            src={site + "images/full-logo.png"}
            srcSet={logoSources}
            sizes="190px"
            width="1942"
            height="809"
            alt="Darja with Mongia"
          />
          <p>Friendly Tunisian Arabic lessons and free resources to help you speak with confidence.</p>
        </div>
        <div className="shop-footer-column">
          <h3>Explore</h3>
          <a href={site + "#home"}>Home</a>
          <a href={lessons}>Free Lessons</a>
          <a href={site + "#podcast"}>Podcast</a>
          <a href={site + "#about"}>About Mongia</a>
          <a href={site + "#faq"}>FAQ</a>
          <a href={site + "#newsletter"}>Email updates</a>
        </div>
        <div className="shop-footer-column">
          <h3>Learn with me</h3>
          <a href="https://preply.com/en/tutor/2654132" target="_blank" rel="noopener noreferrer">
            Book a private lesson
          </a>
          <a href="https://open.spotify.com/show/4dMV2mNPZem28TFqm37qv8" target="_blank" rel="noopener noreferrer">
            Listen on Spotify
          </a>
        </div>
        <div className="shop-footer-column shop-footer-contact">
          <h3>Say Asslema</h3>
          <p>Questions or learning enquiries?</p>
          <a href="mailto:contact@darjawithmongia.com">contact@darjawithmongia.com</a>
        </div>
      </div>
      <div className="shop-footer-bottom">
        <p>© 2026 Darja with Mongia — Learn Tunisian Arabic Online.</p>
        <p>Made with <span>♥</span> for Tunisian Arabic learners.</p>
      </div>
    </footer>
  );
}

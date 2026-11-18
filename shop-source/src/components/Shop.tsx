import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Headphones,
  LayoutGrid,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  ShoppingBag,
  Flower,
  Diamond,
  RotateCcw,
} from "lucide-react";
import {
  type Product,
  type Category,
  icons,
  categories,
  singular,
  site,
  asset,
  apiBase,
  staticMode,
  money,
  shelfKey,
  openProduct,
  openAudio,
  closeView,
} from "../lib/shop";
import { ProductDetail } from "./ProductDetail";
import { AudioLibrary } from "./AudioLibrary";
import { Modal } from "./Modal";
export default function Shop() {
  const [items, setItems] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [category, setCategory] = useState<Category | "All" | "Saved">("All"),
    [levels, setLevels] = useState<string[]>([]),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("featured");
  const [menu, setMenu] = useState(false),
    [filters, setFilters] = useState(false),
    [route, setRoute] = useState(location.hash);
  const [saved, setSaved] = useState<string[]>([]),
    [saving, setSaving] = useState(""),
    [toast, setToast] = useState("");
  const catalogRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let result;
      try {
        const r = await fetch(
          staticMode ? asset("data/catalog.json") : apiBase + "/api/catalog",
          { signal: AbortSignal.timeout(6000) },
        );
        if (!r.ok) throw Error();
        result = await r.json();
        if (!Array.isArray(result)) throw Error();
      } catch {
        const r = await fetch(asset("data/catalog.json"));
        if (!r.ok) throw Error();
        result = await r.json();
      }
      setItems(result);
    } catch {
      setError("We couldn’t load the collection. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  const loadSaved = useCallback(async () => {
    try {
      if (staticMode) {
        setSaved(
          JSON.parse(localStorage.getItem("darja-static-saved") || "[]"),
        );
        return;
      }
      const r = await fetch(apiBase + "/api/saved", {
        headers: { Authorization: "Bearer " + shelfKey() },
      });
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d)) setSaved(d);
      }
    } catch {
      /* Reading a personal shelf is optional for browsing. */
    }
  }, []);
  useEffect(() => {
    const start = window.setTimeout(() => {
      void load();
      void loadSaved();
    }, 0);
    const change = () => {
      setRoute(location.hash);
      setMenu(false);
    };
    window.addEventListener("hashchange", change);
    return () => {
      window.clearTimeout(start);
      window.removeEventListener("hashchange", change);
    };
  }, [load, loadSaved]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);
  const toggleSave = async (p: Product) => {
    if (saving) return;
    const wasSaved = saved.includes(p.id);
    setSaving(p.id);
    try {
      if (staticMode) {
        const next = wasSaved
          ? saved.filter((id) => id !== p.id)
          : [...saved, p.id];
        localStorage.setItem("darja-static-saved", JSON.stringify(next));
      } else {
        const r = await fetch(apiBase + "/api/saved", {
          method: wasSaved ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + shelfKey(),
          },
          body: JSON.stringify({ product_id: p.id }),
        });
        if (!r.ok) throw Error();
      }
      await loadSaved();
      setToast(
        wasSaved
          ? "Removed from your saved resources"
          : "Added to your saved resources",
      );
    } catch {
      setToast("Your resource couldn’t be saved. Please try again.");
    } finally {
      setSaving("");
    }
  };
  const results = useMemo(() => {
    const arr = items.filter(
      (p) =>
        (category === "All" ||
          (category === "Saved"
            ? saved.includes(p.id)
            : p.category === category)) &&
        (!levels.length || levels.includes(p.level)) &&
        (!query.trim() ||
          [p.title, p.summary, p.category, p.level, p.format]
            .join(" ")
            .toLowerCase()
            .includes(query.trim().toLowerCase())),
    );
    if (sort === "price-low") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-high") arr.sort((a, b) => b.price - a.price);
    if (sort === "az") arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }, [items, category, levels, query, sort, saved]);
  const reset = () => {
    setCategory("All");
    setLevels([]);
    setQuery("");
    setSort("featured");
  };
  const jump = (cat: Category | "All" | "Saved") => {
    setCategory(cat);
    setMenu(false);
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const selected = items.find((p) => route === "#/product/" + p.id);
  const activeFilters = !!(query || levels.length || category !== "All");
  const nav = (
    <>
      <a href={site}>Home</a>
      <a href={site + "free-lessons.html"}>Free lessons</a>
      <a href={site + "podcast.html"}>Podcast</a>
      <a href={site + "#about"}>About</a>
      <a href="mailto:contact@darjawithmongia.com">Contact</a>
      <button
        className="nav-active"
        aria-current="page"
        onClick={() => {
          closeView();
          reset();
          setMenu(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <ShoppingBag size={15} />
        Shop
      </button>
    </>
  );
  const filterContent = (
    <>
      <div className="sidebar-title">
        <SlidersHorizontal size={17} />
        <h2>Browse the shop</h2>
      </div>
      <div className="search-box">
        <Search size={16} />
        <input
          ref={searchRef}
          placeholder="Search resources…"
          aria-label="Search resources"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery("")}>
            <X size={13} />
          </button>
        )}
      </div>
      <div className="filter-block">
        <div className="filter-label">CATEGORIES</div>
        {(["All", ...categories] as const).map((c) => {
          const I = icons[c];
          return (
            <button
              key={c}
              className={"category-row " + (category === c ? "selected" : "")}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              <I size={16} />
              <span>{c === "All" ? "All resources" : c}</span>
              <small>
                {c === "All"
                  ? items.length
                  : items.filter((i) => i.category === c).length}
              </small>
            </button>
          );
        })}
      </div>
      <div className="filter-block levels">
        <div className="filter-label">LEARNING LEVEL</div>
        {["Beginner", "Intermediate", "All levels"].map((l) => (
          <label key={l}>
            <input
              type="checkbox"
              checked={levels.includes(l)}
              onChange={() =>
                setLevels(
                  levels.includes(l)
                    ? levels.filter((x) => x !== l)
                    : [...levels, l],
                )
              }
            />
            <span>{l}</span>
          </label>
        ))}
      </div>
      <button
        className={"saved-row " + (category === "Saved" ? "selected" : "")}
        onClick={() => setCategory("Saved")}
      >
        <Bookmark size={16} />
        Saved resources<span>{saved.length}</span>
      </button>
      {activeFilters && (
        <button className="clear-filters" onClick={reset}>
          <RotateCcw size={12} />
          Reset filters
        </button>
      )}
    </>
  );
  return (
    <>
      <a className="skip-link" href="#collection">
        Skip to collection
      </a>
      <header className="header">
        <div className="shell header-inner">
          <a className="brand" href={site} aria-label="Darja with Mongia home">
            <img src={asset("images/brand.webp")} alt="Darja with Mongia" />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav}
          </nav>
          <div className="header-actions">
            <button
              className="mobile-menu icon-btn"
              aria-label="Open navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav}
          </nav>
        )}
      </header>
      <main>
        <section className="hero">
          <div className="hero-pattern" aria-hidden="true" />
          <div
            className="hero-art"
            role="img"
            aria-label="Watercolor of a blue Tunisian door, bougainvillea, and the Mediterranean Sea"
          />
          <div className="shell hero-inner">
            <div className="hero-copy">
              <span className="eyebrow hero-eyebrow">
                <span className="decor-star">✦</span>THE DARJA LEARNING
                COLLECTION
              </span>
              <h1>
                The Darja Shop<span className="title-dot">.</span>
              </h1>
              <p>
                Books, flashcards, and courses to bring Tunisian Arabic
                <br className="desktop-break" /> into your everyday life.
              </p>
              <div className="hero-chips">
                {categories.map((c) => {
                  const I = icons[c];
                  return (
                    <button
                      key={c}
                      onClick={() =>
                        c === "Audio companions" ? openAudio() : jump(c)
                      }
                    >
                      <I size={15} />
                      {c === "Audio companions" ? "Audio" : c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="tile-trim" />
        </section>
        <section ref={catalogRef} id="collection" className="shop-layout shell">
          <aside className="sidebar">{filterContent}</aside>
          <div className="collection">
            <div className="collection-heading">
              <div>
                <div className="eyebrow collection-eyebrow">
                  <i />
                  EXPLORE THE SHOP
                </div>
                <h2>
                  {category === "All"
                    ? "The collection"
                    : category === "Saved"
                      ? "Saved resources"
                      : category}
                </h2>
              </div>
              <div className="sort-wrapper">
                <label htmlFor="sort">Sort by:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="az">Title: A–Z</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="collection-sub">
              <span aria-live="polite">
                {loading
                  ? "Opening the collection…"
                  : `${results.length} learning resource${results.length === 1 ? "" : "s"}`}
                {query ? " matching “" + query + "”" : ""}
              </span>
              <button
                className="mobile-filter"
                onClick={() => setFilters(true)}
              >
                <SlidersHorizontal size={14} />
                Search & filters{activeFilters ? " •" : ""}
              </button>
            </div>
            {loading ? (
              <div className="product-grid" aria-label="Loading resources">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="empty">
                <h3>Let’s try that again</h3>
                <p>{error}</p>
                <button onClick={load} className="btn primary">
                  Reload collection
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="empty">
                <Search size={30} />
                <h3>
                  {category === "Saved"
                    ? "Your reading shelf awaits"
                    : "No resources found"}
                </h3>
                <p>
                  {category === "Saved"
                    ? "Use the bookmark on a resource to keep it here."
                    : "Try another search or a different learning level."}
                </p>
                <button className="btn outline" onClick={reset}>
                  View all resources
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {results.map((p) => {
                  const I = icons[p.category];
                  return (
                    <article className="product-card" key={p.id}>
                      <div className="card-art">
                        <a
                          href={"#/product/" + p.id}
                          aria-label={"View " + p.title}
                        >
                          <img
                            src={asset(p.image)}
                            alt={p.id === "everyday-darja" ? "Published Tunisian Arabic Fruits Flashcards cover" : p.title + " studio product mockup"}
                            loading={p.position < 4 ? "eager" : "lazy"}
                          />
                        </a>
                        <span
                          className={
                            "type-badge " +
                            p.category.split(" ")[0].toLowerCase()
                          }
                        >
                          <I size={12} />
                          {singular[p.category]}
                        </span>
                        <button
                          className={
                            "save-btn " +
                            (saved.includes(p.id) ? "is-saved" : "")
                          }
                          aria-label={
                            (saved.includes(p.id) ? "Unsave " : "Save ") +
                            p.title
                          }
                          aria-pressed={saved.includes(p.id)}
                          disabled={saving === p.id}
                          onClick={() => toggleSave(p)}
                        >
                          <Bookmark
                            size={15}
                            fill={
                              saved.includes(p.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="card-meta">
                          <span
                            className={
                              "level-tag " +
                              (p.level === "Intermediate"
                                ? "intermediate"
                                : p.level === "All levels"
                                  ? "all-levels"
                                  : "")
                            }
                          >
                            <i />
                            {p.level}
                          </span>
                          <span className="meta-dot">·</span>
                          <span>{p.format}</span>
                        </div>
                        <h3>
                          <a href={"#/product/" + p.id}>{p.title}</a>
                        </h3>
                        <p>{p.summary}</p>
                        <div className="card-bottom">
                          <div>
                            <strong>{money(p.price)}</strong>
                            {!p.published && <small>Sample price</small>}
                          </div>
                          <button
                            className="details-btn"
                            onClick={() => openProduct(p.id)}
                          >
                            View details
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <div className="audio-banner">
              <div className="banner-icon">
                <Headphones size={27} />
              </div>
              <div>
                <span className="eyebrow">FOR BOOK OWNERS</span>
                <h3>Read it. Hear it. Speak it.</h3>
                <p>Find the pronunciation recordings that go with your book.</p>
              </div>
              <button className="btn outline" onClick={openAudio}>
                Audio library
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
        <section className="values-strip">
          <div className="shell values-inner">
            <span>
              <Flower size={19} />
              Rooted in Tunisian culture
            </span>
            <i>✧</i>
            <span>
              <BookOpen size={19} />
              Made for everyday learning
            </span>
            <i>✧</i>
            <span>
              <Sparkles size={18} />
              Learn at your own pace
            </span>
          </div>
        </section>
      </main>
      <footer className="shell footer">
        <div className="footer-brand">
          <img src={asset("images/brand.webp")} alt="Darja with Mongia" />
          <p>A little more Darja, every day.</p>
        </div>
        <div>
          <span className="eyebrow">KEEP EXPLORING</span>
          <a href={site + "free-lessons.html"}>
            Free lessons
            <ArrowUpRight size={12} />
          </a>
          <a href={site + "podcast.html"}>
            Listen to the podcast
            <ArrowUpRight size={12} />
          </a>
        </div>
        <div>
          <span className="eyebrow">SAY ASSLEMA</span>
          <a href="mailto:contact@darjawithmongia.com">
            Contact Mongia
            <ArrowUpRight size={12} />
          </a>
          <a href={site + "#about"}>
            About Darja with Mongia
            <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
      <div className="copyright shell">
        <span>© 2026 Darja with Mongia</span>
        <span>
          <Diamond size={10} />
          Interactive shop preview · Concept product artwork
        </span>
      </div>
      {filters && (
        <Modal
          close={() => setFilters(false)}
          title="Search and filter resources"
          className="filter-modal"
        >
          {filterContent}
          <button
            className="btn primary filter-apply"
            onClick={() => setFilters(false)}
          >
            Show {results.length} resources
            <ArrowRight size={15} />
          </button>
        </Modal>
      )}
      {route === "#/audio" ? (
        <AudioLibrary />
      ) : selected ? (
        <ProductDetail key={selected.id} p={selected} />
      ) : route.startsWith("#/product/") && !loading ? (
        <Modal close={closeView} title="Resource not found">
          <div className="empty">
            <LayoutGrid />
            <h3>Resource not found</h3>
            <p>This resource is no longer in the collection.</p>
            <button className="btn primary" onClick={closeView}>
              Back to the shop
            </button>
          </div>
        </Modal>
      ) : null}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </>
  );
}

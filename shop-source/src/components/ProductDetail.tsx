import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Headphones,
  RotateCcw,
  Play,
  Layers,
  Eye,
  ShoppingBag,
  Mail,
} from "lucide-react";
import { Modal } from "./Modal";
import {
  type Product,
  asset,
  icons,
  singular,
  money,
  closeView,
  openAudio,
} from "../lib/shop";
export function ProductDetail({ p }: { p: Product }) {
  const [tab, setTab] = useState<"About" | "Look inside" | "Purchase options">(
    "About",
  );
  const [page, setPage] = useState(0);
  const [flipped, flip] = useState(false);
  const Icon = icons[p.category];
  const isGuide = p.id === "survival-guide";
  const isFruits = p.id === "everyday-darja";
  const amazonGuideUrl = "https://amzn.eu/d/09VbNQsz";
  const pages = p.details.preview_pages || [];
  const count = pages.length || p.details.samples.length;
  const sample = p.details.samples[page];
  const primary = () => {
    if (p.category === "Audio companions") openAudio();
    else if (p.published && p.purchase_url)
      window.open(p.purchase_url, "_blank", "noopener,noreferrer");
    else setTab("Look inside");
  };
  return (
    <Modal close={closeView} title={p.title} className="detail-modal">
      <div className="detail-top">
        <div className="detail-art">
          <img src={asset(p.image)} alt={isGuide ? "Published Tunisian Arabic Survival Guide cover" : isFruits ? "Published Tunisian Arabic Fruits Flashcards cover" : p.title + " product mockup"} />
        </div>
        <div className="detail-intro">
          <div className="eyebrow">
            <Icon size={14} />
            {singular[p.category]}
          </div>
          <h2>{p.title}</h2>
          <p>{p.summary}</p>
          <div className="meta-row">
            <span
              className={
                "level-tag " +
                (p.level === "Intermediate" ? "intermediate" : "")
              }
            >
              <i />
              {p.level}
            </span>
            <span>{p.format}</span>
          </div>
          <div className="detail-price">
            {money(p.price)}
            <small>
              {!p.published
                ? "Illustrative price"
                : p.price
                  ? "Digital edition"
                  : "Included companion"}
            </small>
          </div>
          <button className="btn primary" onClick={primary}>
            {p.category === "Audio companions"
              ? "Open audio library"
              : p.published
                ? (p.category === "Courses" ? "Enroll on " : "Buy on ") +
                  p.retailer
                : p.category === "Courses"
                  ? "Watch sample lesson"
                  : p.category === "Flashcards"
                    ? "Preview the flashcards"
                    : "Read a sample"}
            {p.published && p.price > 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
          {isGuide && (
            <a className="btn outline amazon-guide-link" href={amazonGuideUrl} target="_blank" rel="noopener noreferrer">
              Buy on Amazon <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
      <div
        className="detail-tabs"
        role="tablist"
        aria-label="Product information"
      >
        {(["About", "Look inside", "Purchase options"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={tab === t ? "active" : ""}
          >
            {p.category === "Courses" && t === "Purchase options"
              ? "Enrollment options"
              : t}
          </button>
        ))}
      </div>
      <div className="detail-content" role="tabpanel">
        {tab === "About" ? (
          <>
            <h3>About this resource</h3>
            <p>{p.description}</p>
            <div className="features">
              {p.details.features.map((f) => (
                <span key={f}>
                  <Check size={15} />
                  {f}
                </span>
              ))}
            </div>
            {!p.published && (
              <div className="note">
                <Eye size={16} />
                <span>
                  <b>Collection preview.</b> This is a sample product with an
                  illustrative price, not a live listing.
                </span>
              </div>
            )}
            {isFruits && (
              <p className="fine-print">Digital download: a printable PDF and pronunciation MP3s in a ZIP file. No physical cards are shipped.</p>
            )}
            {isGuide && (
              <div className="guide-information">
                <p className="guide-byline">By Mongia Ben Naceur · Arabic teacher</p>
                <p>Follow short conversations, discover cultural tips, and listen to the companion audio at your own pace. You can start even if you cannot read Arabic.</p>
                <h3>What you will find inside</h3>
                <ul>
                  <li>Greetings, politeness and asking someone to repeat</li>
                  <li>Numbers, prices, money and paying</li>
                  <li>The airport, taxis, louages, trains and directions</li>
                  <li>Accommodation, cafés and restaurants</li>
                  <li>Local markets, souks and bargaining</li>
                  <li>Museums, excursions, meeting people and getting help</li>
                </ul>
                <h3>Try three phrases from the guide</h3>
                <div className="guide-phrases">
                  <span><b lang="ar-TN" dir="rtl">سامحني</b><strong>Sama7ni</strong>Sorry / excuse me</span>
                  <span><b lang="ar-TN" dir="rtl">بقدّاش؟</b><strong>B9addech?</strong>How much?</span>
                  <span><b lang="ar-TN" dir="rtl">ما فهمتش</b><strong>Ma fhemtch</strong>I did not understand</span>
                </div>
                <h3>Questions about the guide</h3>
                <details><summary>Do I need to read Arabic?</summary><p>No. The phrases include Latin pronunciation and English meanings. Use the companion audio to listen and repeat.</p></details>
                <details><summary>What format is the book?</summary><p>It is a digital PDF guide with companion audio. Use the Payhip purchase page to see the current offer.</p></details>
                <details><summary>Can I look inside before buying?</summary><p>Yes. The free preview contains ten watermarked sample pages, including the contents, first phrases and a complete souk lesson.</p></details>
                <details><summary>How do I find the matching audio?</summary><p>Match the AUDIO label in the book to the recording. Chapter tracks use .1 for Useful Expressions, .2 for Conversation and .3 for You Might Hear. You can listen online or download the recordings.</p></details>
                <div className="guide-actions">
                  <a className="btn outline" href="https://darja-survival-guide-audio.crisptitan32.chatgpt.site/preview/Tunisian_Arabic_Survival_Guide_Free_Preview.pdf?v=preview10">Download the free preview</a>
                  <button className="btn outline" onClick={openAudio}><Headphones size={16} />All book audio</button>
                </div>
              </div>
            )}
          </>
        ) : tab === "Purchase options" ? (
          <>
            <h3>
              {p.published ? "Get this resource" : "Preview purchase options"}
            </h3>
            {p.category === "Audio companions" ? (
              <>
                <p>
                  The published companion recordings are free to access. Match
                  the audio number in your guide to a chapter in the library.
                </p>
                <button className="btn primary" onClick={openAudio}>
                  <Headphones size={16} />
                  Listen to the companion
                </button>
              </>
            ) : p.published && p.purchase_url ? (
              <>
                <p>
                  {isGuide
                    ? "Purchase the digital guide directly from Mongia on Payhip. Your PDF is delivered by Payhip; the matching audio is available in our library."
                    : `Complete your ${p.category === "Courses" ? "enrollment" : "purchase"} directly on ${p.retailer}.`}{" "}
                  The final price is shown at checkout.
                </p>
                <a
                  className="btn primary"
                  href={p.purchase_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShoppingBag size={16} />
                  {p.category === "Courses" ? "Enroll on " : "Buy on "}
                  {p.retailer}
                  <ArrowUpRight size={15} />
                </a>
                {isGuide && (
                  <a className="btn outline amazon-guide-link" href={amazonGuideUrl} target="_blank" rel="noopener noreferrer">
                    Buy on Amazon <ArrowUpRight size={15} />
                  </a>
                )}
              </>
            ) : (
              <>
                <p>
                  This{" "}
                  {p.category === "Courses"
                    ? "course"
                    : p.category === "Books"
                      ? "book"
                      : "flashcard set"}{" "}
                  is part of the visual shop sample.{" "}
                  {p.category === "Courses"
                    ? "Paid enrollment is not open. You can watch the sample lesson or book a private lesson with Mongia."
                    : "No payment is taken and there is no live product listing yet."}
                </p>
                <div className="purchase-info">
                  <span>Planned retailer</span>
                  <strong>{p.retailer}</strong>
                  <span>Sample price</span>
                  <strong>{money(p.price)}</strong>
                </div>
                <div className="action-row">
                  <button
                    className="btn primary"
                    onClick={() => setTab("Look inside")}
                  >
                    Explore the sample
                    <ArrowRight size={15} />
                  </button>
                  {p.category === "Books" ? (
                    <a
                      className="btn outline"
                      target="_blank"
                      rel="noreferrer"
                      href="https://www.amazon.com/s?k=Tunisian+Arabic+books"
                    >
                      Browse books on Amazon
                      <ArrowUpRight size={14} />
                    </a>
                  ) : p.category === "Courses" ? (
                    <a
                      className="btn outline"
                      target="_blank"
                      rel="noreferrer"
                      href="https://preply.com/en/tutor/2654132"
                    >
                      Book a private lesson
                      <ArrowUpRight size={14} />
                    </a>
                  ) : (
                    <a
                      className="btn outline"
                      href={
                        "mailto:contact@darjawithmongia.com?subject=" +
                        encodeURIComponent("Question about " + p.title)
                      }
                    >
                      <Mail size={15} />
                      Ask Mongia
                    </a>
                  )}
                </div>
              </>
            )}
          </>
        ) : p.category === "Audio companions" ? (
          <>
            <h3>Listen alongside your book</h3>
            <p>
              Choose a chapter, listen to useful expressions, then practice with
              a conversation. Slow down or repeat a recording as often as you
              like.
            </p>
            <button className="btn primary" onClick={openAudio}>
              <Headphones size={16} />
              Open the audio player
            </button>
          </>
        ) : p.category === "Courses" && p.details.video ? (
          <>
            <div className="section-mini">
              <span className="eyebrow">
                <Play size={13} />
                SAMPLE LESSON
              </span>
              <span>{p.details.preview_title || "Course preview"}</span>
            </div>
            <video
              className="lesson-video"
              controls
              playsInline
              preload="metadata"
              poster={asset(p.details.poster || p.image)}
              src={asset(p.details.video)}
            >
              {p.details.captions && (
                <track
                  kind="captions"
                  label="English"
                  srcLang="en"
                  src={asset(p.details.captions)}
                  default
                />
              )}
            </video>
            {p.id === "speak-tunisian" && (
              <p className="fine-print">
                An original sample lesson using pronunciation clips from
                Mongia’s free greetings lesson.
              </p>
            )}
          </>
        ) : count === 0 ? (
          <p>
            A sample preview is not available for this resource yet. Read the
            description or explore its purchase options.
          </p>
        ) : (
          <>
            <div className="section-mini">
              <span className="eyebrow">
                <Layers size={14} />
                {pages.length ? "SAMPLE PAGES" : "INTERACTIVE SAMPLE"}
              </span>
              <span>
                {page + 1} of {count}
              </span>
            </div>
            {pages.length > 0 ? (
              <img
                className="sample-page"
                src={asset(pages[page])}
                alt={p.title + " preview, page " + (page + 1)}
              />
            ) : p.category === "Flashcards" ? (
              <button
                className={"flashcard " + (flipped ? "flipped" : "")}
                onClick={() => flip(!flipped)}
                aria-label="Flip sample flashcard"
              >
                <span className="eyebrow">
                  {flipped ? "ENGLISH MEANING" : "TUNISIAN ARABIC"}
                </span>
                {flipped ? (
                  <strong>{sample.en}</strong>
                ) : (
                  <>
                    <strong lang="ar" dir="rtl">
                      {sample.ar}
                    </strong>
                    <em>{sample.latin}</em>
                  </>
                )}
                <small>
                  <RotateCcw size={13} />
                  Tap to flip
                </small>
              </button>
            ) : (
              <div className="story-page">
                <div className="eyebrow">A MOMENT IN TUNIS</div>
                <h3 lang="ar" dir="rtl">
                  {sample.ar}
                </h3>
                <i>{sample.latin}</i>
                <p>{sample.en}</p>
              </div>
            )}
            <div className="preview-nav">
              <button
                className="btn outline"
                disabled={page === 0}
                onClick={() => {
                  setPage(page - 1);
                  flip(false);
                }}
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <span>{isGuide ? "Book preview" : "Sample " + (page + 1)}</span>
              <button
                className="btn outline"
                disabled={page === count - 1}
                onClick={() => {
                  setPage(page + 1);
                  flip(false);
                }}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
            {p.details.preview_pdf && (
              <a
                className="text-link"
                href={asset(p.details.preview_pdf)}
                target="_blank"
                rel="noreferrer"
              >
                {isGuide
                  ? "Open the full 10-page preview"
                  : "Open the sample PDF"}
                <ArrowUpRight size={14} />
              </a>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Headphones,
  Play,
  Music2,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronDown,
  ArrowUpRight,
  Volume2,
} from "lucide-react";
import { Modal } from "./Modal";
import { asset, closeView, site } from "../lib/shop";
type Track = {
  filename: string;
  title: string;
  section: string;
  folder: string;
  version?: string;
};
const recordingRoot =
  "https://darja-survival-guide-audio.crisptitan32.chatgpt.site/audio/";
const group = (t: Track) =>
  t.folder
    .split("/")
    .find((x) => /^\d\d - Audio/.test(x))
    ?.replace(/^\d\d - Audio /, "") || "00 - Start Here";
export function AudioLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [chapter, setChapter] = useState("01 - Greetings And Goodbyes");
  const [file, setFile] = useState("Audio_01.1.mp3");
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [auto, setAuto] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    let live = true;
    fetch(asset("data/tracks.json"))
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        if (live) {
          setTracks(d);
          setError("");
        }
      })
      .catch(() => {
        if (live)
          setError("The recording list could not load. Please try again.");
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const chapters = useMemo(
    () => Array.from(new Set(tracks.map(group))).sort(),
    [tracks],
  );
  const list = tracks
    .filter((t) => group(t) === chapter)
    .sort((a, b) => a.filename.localeCompare(b.filename));
  const track = tracks.find((t) => t.filename === file);
  const idx = list.findIndex((t) => t.filename === file);
  const choose = (f: string, play = true) => {
    if (f === file) {
      if (play)
        ref.current
          ?.play()
          .catch(() =>
            setError("Playback could not start. Try the audio controls."),
          );
      return;
    }
    setError("");
    setAuto(play);
    setFile(f);
  };
  const local = /^Audio_01\.[123]\.mp3$/.test(file);
  const src = local
    ? asset("media/" + file)
    : recordingRoot +
      encodeURIComponent(file) +
      (track?.version ? "?v=" + track.version : "");
  return (
    <Modal
      title="Audio companion library"
      close={closeView}
      className="audio-modal"
    >
      <div className="audio-heading">
        <div className="audio-symbol">
          <Headphones size={27} />
        </div>
        <div className="eyebrow">THE LISTENING ROOM</div>
        <h2>Audio library</h2>
        <p>
          Your book, brought to life. Listen, repeat, and learn at your own
          pace.
        </p>
      </div>
      <div className="audio-body">
        <div className="book-strip">
          <img
            src={asset("images/official-cover.webp")}
            alt="Published Survival Guide cover"
          />
          <div>
            <span className="eyebrow">BOOK COMPANION</span>
            <h3>Tunisian Arabic Survival Guide</h3>
            <p>Mongia Ben Naceur · {tracks.length || "…"} recordings</p>
          </div>
        </div>
        <label className="field-label" htmlFor="chapters">
          Choose a chapter
        </label>
        <div className="select-wrap">
          <select
            id="chapters"
            value={chapter}
            onChange={(e) => {
              setChapter(e.target.value);
              const first = tracks
                .filter((t) => group(t) === e.target.value)
                .sort((a, b) => a.filename.localeCompare(b.filename))[0];
              if (first) choose(first.filename, false);
            }}
          >
            {chapters.map((x) => (
              <option key={x} value={x}>
                {x.replace(" - ", " · ")}
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </div>
        <div className="tracklist">
          {list.map((t, i) => (
            <button
              key={t.filename}
              className={"track " + (file === t.filename ? "selected" : "")}
              onClick={() => choose(t.filename)}
            >
              <span className="track-number">
                {file === t.filename && playing ? (
                  <Volume2 size={15} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <span>{t.title?.split(" — ").pop() || t.section}</span>
              <Play size={14} />
            </button>
          ))}
        </div>
        <div className="player">
          <div className="eyebrow">
            <Music2 size={14} />
            {playing ? "NOW PLAYING" : "READY TO LISTEN"}
          </div>
          <strong>
            {track?.title?.split(" — ").slice(1).join(" · ") ||
              "Loading recordings…"}
          </strong>
          {track && (
            <audio
              key={file}
              ref={ref}
              controls
              preload="metadata"
              src={src}
              aria-label={track.title}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onLoadedMetadata={() => {
                if (ref.current) {
                  ref.current.playbackRate = rate;
                  if (auto) ref.current.play().catch(() => setAuto(false));
                }
              }}
              onError={() =>
                setError(
                  "This recording is unavailable. Try again or open the original audio collection below.",
                )
              }
            />
          )}
          <div className="player-tools">
            <button
              disabled={idx <= 0}
              onClick={() => choose(list[idx - 1].filename)}
              aria-label="Previous recording"
            >
              <SkipBack size={16} />
            </button>
            <button
              aria-label="Rewind five seconds"
              onClick={() => {
                if (ref.current)
                  ref.current.currentTime = Math.max(
                    0,
                    ref.current.currentTime - 5,
                  );
              }}
            >
              <RotateCcw size={15} />
              <small>5s</small>
            </button>
            <button
              disabled={idx < 0 || idx >= list.length - 1}
              onClick={() => choose(list[idx + 1].filename)}
              aria-label="Next recording"
            >
              <SkipForward size={16} />
            </button>
            <label>
              Speed{" "}
              <select
                aria-label="Playback speed"
                value={rate}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setRate(n);
                  if (ref.current) ref.current.playbackRate = n;
                }}
              >
                {[0.75, 1, 1.25, 1.5].map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {error && (
          <p className="error-note" role="alert">
            {error}{" "}
            <button
              onClick={() => {
                setAttempt(attempt + 1);
                ref.current?.load();
                setError("");
              }}
            >
              Retry
            </button>
          </p>
        )}
        <p className="fine-print">
          Match each recording number to the AUDIO label in your book. These
          recordings are freely available from Mongia.
        </p>
        <a
          href={site + "survival-guide-audio.html#collection"}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Visit the original audio collection
          <ArrowUpRight size={14} />
        </a>
      </div>
    </Modal>
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaSpotify,
  FaSoundcloud,
  FaDiscord,
  FaVolumeHigh,
  FaVolumeXmark,
  FaPlay,
  FaPause,
  FaBackwardStep,
  FaForwardStep,
} from "react-icons/fa6";
import { CONFIG } from "./config";

const BASE = import.meta.env.BASE_URL;

// link http(s) giữ nguyên, tên file thì ghép với thư mục public
const asset = (p) =>
  /^(https?:)?\/\//.test(p) || p.startsWith("data:") ? p : `${BASE}${p}`;

const ICONS = {
  facebook: { Icon: FaFacebookF, label: "Facebook" },
  instagram: { Icon: FaInstagram, label: "Instagram" },
  spotify: { Icon: FaSpotify, label: "Spotify" },
  soundcloud: { Icon: FaSoundcloud, label: "SoundCloud" },
  discord: { Icon: FaDiscord, label: "Discord" },
};

const fmt = (s) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

/* ---------------- 3D tilt theo chuột (bật/tắt trong config.js) ---------------- */
function useTilt(ref) {
  useEffect(() => {
    const { enabled, maxDeg, perspective } = CONFIG.tilt;
    const el = ref.current;
    if (!enabled || !el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // bỏ qua trên cảm ứng

    let raf = 0;
    const apply = (x, y) => {
      el.style.transform = `perspective(${perspective}px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) scale3d(1.01,1.01,1.01)`;
      el.style.setProperty("--gx", `${50 + x * 50}%`);
      el.style.setProperty("--gy", `${50 + y * 50}%`);
    };
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        apply(x, y);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0)`;
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/* ---------------- Discord presence qua Lanyard ---------------- */
function useDiscord() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const { userId, pollMs } = CONFIG.discord;
    if (!userId || /^0+$/.test(userId)) return;
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const j = await r.json();
        if (alive && j.success) setData(j.data);
      } catch {
        /* giữ dữ liệu cũ */
      }
    };
    load();
    const id = setInterval(load, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return data;
}

const STATUS_TEXT = {
  online: "online",
  idle: "idle",
  dnd: "do not disturb",
  offline: "offline",
};

function DiscordCard({ data }) {
  const user = data?.discord_user;
  const status = data?.discord_status ?? "offline";
  const name =
    user?.global_name || user?.username || CONFIG.discord.fallbackName;
  const avatar = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : null;
  const activity = data?.activities?.find((a) => a.type !== 4 && a.type !== 2);
  const custom = data?.activities?.find((a) => a.type === 4);
  const sub = activity
    ? `${activity.type === 0 ? "Playing " : ""}${activity.name}`
    : custom?.state || STATUS_TEXT[status];

  return (
    <div className="glass-sub discord">
      <div className="d-avatar">
        {avatar ? <img src={avatar} alt="" /> : <FaDiscord />}
        <span className={`dot ${status}`} />
      </div>
      <div className="d-text">
        <div className="d-name">{name}</div>
        <div className="d-sub">{sub}</div>
      </div>
      <FaDiscord className="d-logo" />
    </div>
  );
}

/* ---------------- Trình phát nhạc nền (thu nhỏ, nằm cạnh thẻ Discord) ---------------- */
function MusicPlayer({ audioRef, playing, index, setIndex, tracks }) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const track = tracks[index];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    onMeta();
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
    };
  }, [audioRef]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    a.paused ? a.play().catch(() => {}) : a.pause();
  };
  const step = (d) => setIndex((i) => (i + d + tracks.length) % tracks.length);
  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = (Number(e.target.value) / 1000) * duration;
  };
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="glass-sub player">
      <img className="p-art" src={asset(track.cover)} alt="" />
      <div className="p-main">
        <div className="p-top">
          <div className="p-title" title={track.title}>
            {track.title}
          </div>
          <div className="p-ctrl">
            {tracks.length > 1 && (
              <button onClick={() => step(-1)} aria-label="Bài trước">
                <FaBackwardStep />
              </button>
            )}
            <button
              className="play"
              onClick={toggle}
              aria-label={playing ? "Tạm dừng" : "Phát"}
            >
              {playing ? <FaPause /> : <FaPlay />}
            </button>
            {tracks.length > 1 && (
              <button onClick={() => step(1)} aria-label="Bài sau">
                <FaForwardStep />
              </button>
            )}
          </div>
        </div>
        <div className="p-bar">
          <span>{fmt(time)}</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={duration ? Math.round((time / duration) * 1000) : 0}
            onChange={seek}
            style={{ "--pct": `${pct}%` }}
            aria-label="Tua nhạc"
          />
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  useTilt(cardRef);
  const discord = useDiscord();

  const tracks = CONFIG.music.tracks;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [entered, setEntered] = useState(!CONFIG.gate.enabled);
  const firstRender = useRef(true);

  // áp dụng cấu hình blur (layout effect => có hiệu lực trước khi vẽ khung hình đầu tiên)
  useLayoutEffect(() => {
    const root = document.documentElement;
    const { enabled, amount } = CONFIG.blur;
    root.classList.toggle("no-blur", !enabled);
    root.style.setProperty("--blur", `${amount}px`);
    root.style.setProperty(
      "--blur-sub",
      `${Math.max(2, Math.round(amount * 0.45))}px`,
    );
  }, []);

  // video nền luôn tắt tiếng; thử lại khi có tương tác nếu trình duyệt chặn autoplay
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      const kick = () => {
        v.play();
        window.removeEventListener("pointerdown", kick);
      };
      window.addEventListener("pointerdown", kick);
    });
  }, []);

  // đồng bộ trạng thái play/pause của <audio>
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = CONFIG.audio.volume;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    const ended = () => {
      if (tracks.length > 1) setIndex((i) => (i + 1) % tracks.length);
      else {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
    };
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    a.addEventListener("ended", ended);
    return () => {
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
      a.removeEventListener("ended", ended);
    };
  }, [tracks.length]);

  // đổi bài => nạp & phát bài mới
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    a.load();
    a.play().catch(() => {});
  }, [index]);

  // Nếu không dùng màn hình chờ: phát nhạc ngay khi người dùng tương tác lần đầu
  useEffect(() => {
    if (CONFIG.gate.enabled) return;
    const start = () => {
      audioRef.current?.play().catch(() => {});
      window.removeEventListener("pointerdown", start);
    };
    window.addEventListener("pointerdown", start);
    return () => window.removeEventListener("pointerdown", start);
  }, []);

  // Bấm vào màn hình chờ => bắt đầu phát nhạc nền
  const enter = () => {
    audioRef.current?.play().catch(() => {});
    setEntered(true);
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  const videoSrc = /^https?:\/\//i.test(CONFIG.video.src)
    ? CONFIG.video.src
    : `${BASE}${CONFIG.video.src.replace(/^\/+/, "")}`;

  const user = discord?.discord_user;
  const avatarSrc = CONFIG.avatar
    ? `${BASE}${CONFIG.avatar}`
    : user?.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : null;

  return (
    <>
      <div className="bg">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={
            CONFIG.video.poster
              ? `${BASE}${CONFIG.video.poster.replace(/^\/+/, "")}`
              : undefined
          }
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="bg-tint" />
        <div className="bg-vignette" />
      </div>

      <audio
        ref={audioRef}
        src={asset(tracks[index].src)}
        preload="auto"
        loop={false}
      />

      {CONFIG.audio.showMuteButton && (
        <button
          className={`mute-btn ${entered ? "show" : ""}`}
          onClick={toggleMute}
          aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
          title={muted ? "Bật tiếng" : "Tắt tiếng"}
        >
          {muted ? <FaVolumeXmark /> : <FaVolumeHigh />}
        </button>
      )}

      {CONFIG.gate.enabled && (
        <div
          className={`gate ${entered ? "gone" : ""}`}
          onClick={enter}
          role="button"
          tabIndex={entered ? -1 : 0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && enter()}
        >
          <span>{CONFIG.gate.text}</span>
        </div>
      )}

      <main className={`stage ${entered ? "in" : ""}`}>
        <section className="card glass" ref={cardRef}>
          <div className="glare" />

          <header className="head">
            <div className="avatar-ring">
              {avatarSrc ? (
                <img src={avatarSrc} alt={CONFIG.name} />
              ) : (
                <div className="avatar-ph" />
              )}
            </div>
            <div className="who">
              <h1>{CONFIG.name}</h1>
              {CONFIG.nickname && <p className="nick">@{CONFIG.nickname}</p>}
              <p className="bio">{CONFIG.bio}</p>
            </div>
          </header>

          <div className="row">
            <DiscordCard data={discord} />
            <MusicPlayer
              audioRef={audioRef}
              playing={playing}
              index={index}
              setIndex={setIndex}
              tracks={tracks}
            />
          </div>

          <nav className="socials">
            {CONFIG.links.map(({ type, url }) => {
              const item = ICONS[type];
              if (!item) return null;
              const { Icon, label } = item;
              return (
                <a
                  key={type}
                  className={`social ${type}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                >
                  <Icon />
                </a>
              );
            })}
          </nav>

          <footer className="foot">
            <span className="pin">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              {CONFIG.location}
            </span>
          </footer>
        </section>
      </main>
    </>
  );
}

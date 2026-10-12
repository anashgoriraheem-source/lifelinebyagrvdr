import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Wind, Activity, Droplet, Gauge, MapPin, LocateFixed, Crosshair, Copy, Share2, Move3d, FlaskConical, Bluetooth, Battery, ShieldCheck } from "lucide-react";
import { u as useApp, c as isStale, d as classify, V as VITAL_META, f as formatReading, g as stopTracking, h as startTracking, m as mapsLink, s as set, j as addLog, r as raiseAlarm, P as PATIENT, k as DEMO_DEVICE, S as SCENARIOS } from "./router-C90MPk4h.js";
import { useState, useEffect, useRef, useCallback } from "react";
import "@tanstack/react-store";
function useNow(ms = 1e3) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
function Sparkline({ data, color = "currentColor", height = 36 }) {
  if (data.length < 2) return /* @__PURE__ */ jsx("div", { style: { height }, className: "rounded bg-slate-100/60" });
  const w = 120;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${i / (data.length - 1) * w},${height - 3 - (v - min) / span * (height - 6)}`);
  return /* @__PURE__ */ jsx("svg", { viewBox: `0 0 ${w} ${height}`, preserveAspectRatio: "none", className: "w-full", style: { height }, "aria-hidden": true, children: /* @__PURE__ */ jsx("polyline", { points: pts.join(" "), fill: "none", stroke: color, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round", vectorEffect: "non-scaling-stroke" }) });
}
const ICON = { bp: Gauge, glucose: Droplet, hr: Activity, spo2: Wind };
const STATUS = {
  normal: { label: "Normal", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", text: "text-slate-900", line: "#10b981" },
  warning: { label: "Watch", badge: "bg-amber-50 text-amber-800 ring-amber-200", text: "text-amber-700", line: "#f59e0b" },
  critical: { label: "Critical", badge: "bg-rose-600 text-white ring-rose-600", text: "text-rose-600", line: "#e11d48" },
  unknown: { label: "No data", badge: "bg-slate-100 text-slate-500 ring-slate-200", text: "text-slate-300", line: "#94a3b8" }
};
function VitalCard({ k, delay = 0 }) {
  const r = useApp((s) => s.vitals[k]);
  const t = useApp((s) => s.thresholds[k]);
  const hist = useApp((s) => s.history[k]);
  const demo = useApp((s) => s.demoMode);
  const now = useNow();
  const meta = VITAL_META[k];
  const Icon = ICON[k];
  const stale = r ? isStale(k, r, now) : false;
  const status = !r || stale ? "unknown" : classify(k, r, t);
  const st = STATUS[status];
  const ago = r ? Math.max(0, Math.round((now - r.measuredAt) / 1e3)) : null;
  const intermittent = k === "bp" || k === "glucose";
  const source = demo ? "Demo" : !r ? "Not provided" : stale ? "Signal lost" : intermittent ? "Last measured" : "Live";
  return /* @__PURE__ */ jsxs(
    "article",
    {
      style: { animationDelay: `${delay}ms` },
      className: `animate-fade-up relative flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 transition ${status === "critical" ? "ring-2 ring-rose-500 shadow-rose-200" : "ring-slate-200"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-600", children: /* @__PURE__ */ jsx(Icon, { className: "size-4" }) }),
          /* @__PURE__ */ jsx("h3", { className: "mr-auto text-sm font-semibold text-slate-600", children: meta.label }),
          /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${st.badge}`, children: st.label })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-baseline gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: `font-mono text-5xl font-bold tracking-tight tabular ${st.text}`, children: r && !stale ? formatReading(k, r) : "—" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-400", children: meta.unit })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-slate-400", style: { color: st.line }, children: /* @__PURE__ */ jsx(Sparkline, { data: hist, color: st.line }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 text-[11px] text-slate-500", children: [
          /* @__PURE__ */ jsx("span", { className: `rounded-md px-1.5 py-0.5 font-semibold ${demo ? "bg-amber-100 text-amber-800" : source === "Live" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`, children: source }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: r ? `${r.source} · ${ago < 2 ? "just now" : `${ago}s ago`}` : "No connected device provides this" })
        ] })
      ]
    }
  );
}
function LocationCard() {
  const loc = useApp((s) => s.location);
  const now = useNow();
  const [copied, setCopied] = useState(false);
  const f = loc.fix;
  const tracking = loc.status === "tracking" || loc.status === "requesting";
  const d = f ? Math.max(15e-4, f.accuracy / 111e3 * 3) : 0;
  const bbox = f ? `${f.lng - d * 1.6},${f.lat - d},${f.lng + d * 1.6},${f.lat + d}` : "";
  const copy = async () => {
    if (!f) return;
    await navigator.clipboard?.writeText(mapsLink(f));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return /* @__PURE__ */ jsxs("article", { className: "overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-5 pb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "grid size-8 place-items-center rounded-xl bg-sky-50 text-sky-600", children: /* @__PURE__ */ jsx(MapPin, { className: "size-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "mr-auto", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-600", children: "Live location" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500", children: loc.status === "tracking" && f ? `±${Math.round(f.accuracy)} m · updated ${Math.max(0, Math.round((now - f.at) / 1e3))}s ago` : loc.status === "requesting" ? "Waiting for permission and GPS…" : loc.status === "denied" ? "Permission denied — enable location for this site" : loc.status === "unavailable" ? "Not supported on this device" : loc.error ?? "Off · attached to every SOS message when on" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => tracking ? stopTracking() : startTracking(),
          className: `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${tracking ? "bg-sky-600 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`,
          children: [
            tracking ? /* @__PURE__ */ jsx(LocateFixed, { className: "size-4" }) : /* @__PURE__ */ jsx(Crosshair, { className: "size-4" }),
            tracking ? "Tracking" : "Start tracking"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative mx-3 h-56 overflow-hidden rounded-2xl bg-slate-100", children: f ? /* @__PURE__ */ jsx(
      "iframe",
      {
        title: "Your current location",
        className: "size-full border-0",
        loading: "lazy",
        src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${f.lat},${f.lng}`
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid size-full place-items-center bg-[radial-gradient(circle_at_center,#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("span", { className: "relative mx-auto grid size-12 place-items-center", children: [
        loc.status === "requesting" && /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-sky-400 animate-ring" }),
        /* @__PURE__ */ jsx(MapPin, { className: "relative size-7 text-slate-400" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-[16rem] text-xs text-slate-500", children: "Your position shows here, and is shared in SOS messages and with responders." })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-4 pt-3", children: [
      /* @__PURE__ */ jsx("code", { className: "mr-auto truncate font-mono text-xs text-slate-600", children: f ? `${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}` : "—" }),
      /* @__PURE__ */ jsxs("button", { disabled: !f, onClick: copy, className: "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40", children: [
        /* @__PURE__ */ jsx(Copy, { className: "size-3.5" }),
        copied ? "Copied" : "Copy link"
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          disabled: !f,
          onClick: () => f && navigator.share?.({ title: "My location", url: mapsLink(f) }).catch(() => {
          }),
          className: "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40",
          children: [
            /* @__PURE__ */ jsx(Share2, { className: "size-3.5" }),
            "Share"
          ]
        }
      )
    ] })
  ] });
}
const G = 9.81;
const FREE_FALL = 0.35 * G;
const FREE_FALL_MIN_MS = 80;
const IMPACT_WINDOW_MS = 1e3;
const INACTIVITY_MS = 1e4;
const STILL_TOLERANCE = 0.25 * G;
const IMPACT = { high: 2.3 * G, medium: 2.8 * G, low: 3.4 * G };
const JOLT = { high: 3.8 * G, medium: 4.4 * G, low: 5.2 * G };
function createFallDetector(sensitivity = "medium", inactivityMs = INACTIVITY_MS) {
  let freeFallStart = null;
  let freeFallEnd = null;
  let impactAt = null;
  let peak = 0;
  let movingSamples = 0;
  let samples = 0;
  return function feed(mag, t) {
    if (impactAt != null) {
      samples++;
      if (Math.abs(mag - G) > STILL_TOLERANCE) movingSamples++;
      const elapsed = t - impactAt;
      if (elapsed >= inactivityMs) {
        const still = movingSamples / Math.max(samples, 1) < 0.2;
        const p = peak;
        impactAt = null;
        return still ? { type: "fall", peak: p } : { type: "recovered" };
      }
      return { type: "checking", remainingMs: inactivityMs - elapsed };
    }
    if (mag < FREE_FALL) {
      freeFallStart ??= t;
      freeFallEnd = t;
      return null;
    }
    const hadFreeFall = freeFallStart != null && freeFallEnd != null && freeFallEnd - freeFallStart >= FREE_FALL_MIN_MS && t - freeFallEnd <= IMPACT_WINDOW_MS;
    if (freeFallEnd != null && t - freeFallEnd > IMPACT_WINDOW_MS) freeFallStart = freeFallEnd = null;
    if (hadFreeFall && mag > IMPACT[sensitivity]) {
      impactAt = t;
      peak = mag;
      movingSamples = 0;
      samples = 0;
      freeFallStart = freeFallEnd = null;
      return { type: "impact", peak: mag };
    }
    if (mag > JOLT[sensitivity]) return { type: "jolt", peak: mag };
    return null;
  };
}
function useMotion(onEvent, sensitivity = "medium") {
  const [permission, setPermission] = useState("unknown");
  const [magnitude, setMagnitude] = useState(null);
  const [checking, setChecking] = useState(null);
  const cb = useRef(onEvent);
  cb.current = onEvent;
  const wakeLock = useRef(null);
  useEffect(() => {
    if (typeof window !== "undefined" && !("DeviceMotionEvent" in window)) setPermission("unsupported");
  }, []);
  useEffect(() => {
    if (permission !== "granted") return;
    const feed = createFallDetector(sensitivity);
    let lastUi = 0;
    const handler = (ev) => {
      const a = ev.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const mag = Math.hypot(a.x, a.y, a.z);
      const now = performance.now();
      if (now - lastUi > 120) {
        setMagnitude(mag);
        lastUi = now;
      }
      const e = feed(mag, now);
      if (!e) return;
      if (e.type === "checking") setChecking(Math.ceil(e.remainingMs / 1e3));
      else {
        setChecking(e.type === "impact" ? 10 : null);
        cb.current(e);
      }
    };
    window.addEventListener("devicemotion", handler);
    const nav = navigator;
    nav.wakeLock?.request("screen").then((l) => wakeLock.current = l).catch(() => {
    });
    return () => {
      window.removeEventListener("devicemotion", handler);
      void wakeLock.current?.release();
    };
  }, [permission, sensitivity]);
  const enable = useCallback(async () => {
    const DM = window.DeviceMotionEvent;
    if (!DM) return setPermission("unsupported");
    if (typeof DM.requestPermission === "function") {
      try {
        setPermission(await DM.requestPermission() === "granted" ? "granted" : "denied");
      } catch {
        setPermission("denied");
      }
    } else setPermission("granted");
  }, []);
  return { permission, magnitude, checking, enable };
}
function MotionCard() {
  const demo = useApp((s) => s.demoMode);
  const motion = useMotion((e) => {
    if (e.type === "impact") addLog("info", `Impact ${(e.peak / 9.81).toFixed(1)} g · checking for movement`);
    if (e.type === "recovered") addLog("info", "Impact followed by movement · no alarm");
    if (e.type === "fall") raiseAlarm({ type: "fall", label: "Fall detected", reading: `impact ${(e.peak / 9.81).toFixed(1)} g, then no movement` }, { demo });
    if (e.type === "jolt") raiseAlarm({ type: "jolt", label: "Violent jolt", reading: `${(e.peak / 9.81).toFixed(1)} g spike` }, { demo });
  });
  const mag = motion.magnitude;
  const pct = mag == null ? 0 : Math.min(100, mag / (4 * 9.81) * 100);
  return /* @__PURE__ */ jsxs("article", { className: "flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "grid size-8 place-items-center rounded-xl bg-violet-50 text-violet-600", children: /* @__PURE__ */ jsx(Move3d, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("h3", { className: "mr-auto text-sm font-semibold text-slate-600", children: "Fall & jolt sensor" }),
      /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${motion.permission === "granted" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`, children: motion.permission === "granted" ? motion.checking ? `Checking ${motion.checking}s` : "Watching" : motion.permission === "unsupported" ? "No sensor" : motion.permission === "denied" ? "Blocked" : "Needs access" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-baseline gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-4xl font-bold tabular text-slate-900", children: mag == null ? "—" : mag.toFixed(1) }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-400", children: "m/s² · rest ≈ 9.8" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-violet-500 transition-[width] duration-150", style: { width: `${pct}%` } }) }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs leading-relaxed text-slate-500", children: "Detects free-fall → impact → 10 s of stillness, and violent jolts. Works while this page is open on your phone." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2", children: [
      motion.permission !== "granted" && /* @__PURE__ */ jsx("button", { onClick: motion.enable, disabled: motion.permission === "unsupported", className: "rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-40", children: "Enable motion sensor" }),
      demo && /* @__PURE__ */ jsx("button", { onClick: () => set({ scenario: "fall" }), className: "rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-300", children: "Simulate fall" })
    ] })
  ] });
}
const HOLD_MS = 1200;
function SosButton({ size = "lg" }) {
  const [progress, setProgress] = useState(0);
  const raf = useRef(null);
  const start = useRef(0);
  const begin = (e) => {
    e.preventDefault();
    navigator.vibrate?.(30);
    start.current = performance.now();
    const step = () => {
      const p = Math.min(1, (performance.now() - start.current) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        navigator.vibrate?.([80, 40, 80]);
        raiseAlarm({ type: "sos", label: "SOS pressed", reading: "manual panic button" }, { demo: false, immediate: true });
        setProgress(0);
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const end = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  };
  const dim = size === "lg" ? "size-28" : "size-16";
  const r = 46;
  const c = 2 * Math.PI * r;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onPointerDown: begin,
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      onContextMenu: (e) => e.preventDefault(),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") raiseAlarm({ type: "sos", label: "SOS pressed", reading: "manual panic button" }, { demo: false, immediate: true });
      },
      "aria-label": "SOS — press and hold to call for help",
      className: `relative ${dim} shrink-0 select-none touch-none rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/40 transition active:scale-95`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute inset-0 rounded-full bg-rose-500 animate-ring" }),
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", className: "pointer-events-none absolute inset-0 -rotate-90", children: [
          /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r, fill: "none", stroke: "white", strokeOpacity: 0.25, strokeWidth: "4" }),
          /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r, fill: "none", stroke: "white", strokeWidth: "4", strokeDasharray: c, strokeDashoffset: c * (1 - progress), strokeLinecap: "round" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "relative flex flex-col items-center leading-none", children: [
          /* @__PURE__ */ jsx("span", { className: `font-display font-extrabold tracking-wide ${size === "lg" ? "text-3xl" : "text-lg"}`, children: "SOS" }),
          size === "lg" && /* @__PURE__ */ jsx("span", { className: "mt-1 text-[10px] font-semibold uppercase tracking-widest opacity-80", children: "Hold" })
        ] })
      ]
    }
  );
}
const KEYS = ["bp", "glucose", "hr", "spo2"];
function Monitor() {
  const demo = useApp((s) => s.demoMode);
  const scenario = useApp((s) => s.scenario);
  const vitals = useApp((s) => s.vitals);
  const thresholds = useApp((s) => s.thresholds);
  const log = useApp((s) => s.log);
  const now = useNow();
  const statuses = KEYS.map((k) => ({
    k,
    s: isStale(k, vitals[k], now) ? "unknown" : classify(k, vitals[k], thresholds[k])
  }));
  const crit = statuses.filter((x) => x.s === "critical");
  const warn = statuses.filter((x) => x.s === "warning");
  const anyData = statuses.some((x) => x.s !== "unknown");
  const headline = !anyData ? {
    t: "No device connected",
    d: "Connect a Bluetooth health device, or switch on demo mode to try Lifeline.",
    c: "text-slate-900"
  } : crit.length ? {
    t: `${VITAL_META[crit[0].k].label} critical`,
    d: "Alarm triggers after 3 s sustained beyond your limit.",
    c: "text-rose-600"
  } : warn.length ? {
    t: `Watching ${VITAL_META[warn[0].k].label.toLowerCase()}`,
    d: "Close to your limit. No alarm yet.",
    c: "text-amber-700"
  } : {
    t: "All vitals stable",
    d: "Readings every second. Alarm after 3 s sustained critical value or any fall / jolt.",
    c: "text-slate-900"
  };
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-6xl px-4 pb-32 pt-6", children: [
    demo && /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-300", children: [
      /* @__PURE__ */ jsx(FlaskConical, { className: "size-4.5 shrink-0" }),
      /* @__PURE__ */ jsxs("p", { className: "mr-auto", children: [
        /* @__PURE__ */ jsx("b", { children: "DEMO MODE: no real alerts." }),
        " Readings are simulated. Automatic alarms won't contact anyone — the SOS button always works for real."
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => set({
        demoMode: false,
        scenario: "stable"
      }), className: "rounded-full bg-amber-950 px-3 py-1.5 text-xs font-bold text-amber-50", children: "Use real devices" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-900", children: PATIENT.name }),
      demo ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Bluetooth, { className: "size-4 text-sky-500" }),
        DEMO_DEVICE.name,
        " · ",
        /* @__PURE__ */ jsx(Battery, { className: "size-4" }),
        DEMO_DEVICE.battery,
        "%"
      ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Bluetooth, { className: "size-4" }),
        "No device paired · Bluetooth pairing arrives next release"
      ] }),
      !demo && /* @__PURE__ */ jsx("button", { onClick: () => set({
        demoMode: true
      }), className: "ml-auto rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-slate-300 hover:bg-white", children: "Try demo mode" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 flex items-center gap-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mr-auto", children: [
        /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }),
          " Status"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: `mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-5xl ${headline.c}`, children: headline.t }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xl text-slate-500", children: headline.d })
      ] }),
      /* @__PURE__ */ jsx(SosButton, {})
    ] }),
    /* @__PURE__ */ jsx("section", { className: "mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: KEYS.map((k, i) => /* @__PURE__ */ jsx(VitalCard, { k, delay: i * 70 }, k)) }),
    demo && /* @__PURE__ */ jsxs("section", { className: "mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-slate-600", children: "Simulate a reading" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "Push the demo feed into danger zones to see detection, the alarm and the first-aid assistant." }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: SCENARIOS.map((sc) => /* @__PURE__ */ jsx("button", { onClick: () => set({
        scenario: sc.key
      }), className: `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${scenario === sc.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`, children: sc.label }, sc.key)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]", children: [
      /* @__PURE__ */ jsx(LocationCard, {}),
      /* @__PURE__ */ jsx(MotionCard, {})
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr]", children: [
      /* @__PURE__ */ jsxs("article", { className: "rounded-3xl bg-slate-900 p-5 text-white shadow-sm", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-slate-300", children: "Medical profile" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Shared with contacts and responders in an emergency." }),
        /* @__PURE__ */ jsxs("dl", { className: "mt-4 grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-400", children: "Blood type" }),
            /* @__PURE__ */ jsx("dd", { className: "font-mono text-2xl font-bold", children: PATIENT.bloodType })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-400", children: "Age" }),
            /* @__PURE__ */ jsx("dd", { className: "font-mono text-2xl font-bold", children: PATIENT.age })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-400", children: "Conditions" }),
            /* @__PURE__ */ jsx("dd", { children: PATIENT.conditions.join(" · ") })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-400", children: "Allergies" }),
            /* @__PURE__ */ jsx("dd", { className: "text-rose-300", children: PATIENT.allergies.join(" · ") })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs text-slate-400", children: "Medications" }),
            /* @__PURE__ */ jsx("dd", { children: PATIENT.medications.join(" · ") })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/contacts", className: "mt-5 inline-block text-xs font-semibold text-sky-300 hover:underline", children: "Emergency contacts →" })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-slate-600", children: "Activity log" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto", children: log.map((l) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3 py-2.5 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: `mt-1.5 size-2 shrink-0 rounded-full ${l.kind === "alarm" || l.kind === "sos" ? "bg-rose-500" : l.kind === "cancel" ? "bg-amber-500" : l.kind === "location" ? "bg-sky-500" : "bg-slate-300"}` }),
          /* @__PURE__ */ jsx("span", { className: "mr-auto text-slate-700", children: l.text }),
          /* @__PURE__ */ jsx("time", { className: "shrink-0 text-xs text-slate-400", children: formatWhen(l.at, now) })
        ] }, l.id)) })
      ] })
    ] })
  ] });
}
function formatWhen(t, now) {
  const d = new Date(t);
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  if (now - t < 864e5 && new Date(now).getDate() === d.getDate()) return time;
  return `${d.toLocaleDateString([], {
    weekday: "short"
  })}, ${time}`;
}
export {
  Monitor as component
};

import { Link, createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { HeartPulse, AlertTriangle, Phone, MapPin, Shield, Ambulance, MessageSquare, Check, Copy, Share2, VolumeX, Volume2, Sparkles, X, MicOff, Mic, Send, ChevronLeft, Square, Play, RotateCcw, ChevronRight, Siren } from "lucide-react";
import { Store, useStore } from "@tanstack/react-store";
import { useState, useEffect, useRef, useCallback } from "react";
const PATIENT = {
  name: "Ravi Sharma",
  age: 58,
  bloodType: "B+",
  conditions: ["Type 2 diabetes", "Hypertension"],
  allergies: ["Penicillin"],
  medications: ["Metformin", "Amlodipine"]
};
const DEFAULT_CONTACTS = [
  { id: "c1", name: "Priya Sharma", relationship: "Daughter", phone: "+91 98765 43210", call: true, sms: true },
  { id: "c2", name: "Arjun Sharma", relationship: "Son", phone: "+91 91234 56780", call: true, sms: true },
  { id: "c3", name: "Dr. Meera Iyer", relationship: "Doctor", phone: "+91 99887 76655", call: false, sms: true }
];
const EMERGENCY_BY_COUNTRY = {
  IN: { country: "India", general: "112", police: "100", ambulance: "108", fire: "101", smsNumber: "112" },
  US: { country: "United States", general: "911", police: "911", ambulance: "911", fire: "911", smsNumber: "911" },
  GB: { country: "United Kingdom", general: "999", police: "999", ambulance: "999", fire: "999", smsNumber: "999" },
  EU: { country: "European Union", general: "112", police: "112", ambulance: "112", fire: "112", smsNumber: "112" },
  AU: { country: "Australia", general: "000", police: "000", ambulance: "000", fire: "000", smsNumber: "106" }
};
const RELATIONSHIPS = ["Spouse", "Daughter", "Son", "Parent", "Sibling", "Friend", "Neighbour", "Doctor", "Caregiver", "Other"];
const DEFAULT_THRESHOLDS = {
  bp: { below: 80, above: 180, above2: 120 },
  glucose: { below: 54, above: 320 },
  hr: { below: 40, above: 130 },
  spo2: { below: 88, above: null }
};
const now = Date.now();
const h = 36e5;
const SEED_LOG = [
  { id: "l1", at: now - 18 * h, kind: "info", text: "Glucose dipped to 68 mg/dL · recovered after 12 min" },
  { id: "l2", at: now - 50 * h, kind: "info", text: "Morning BP logged · 138/86 mmHg" },
  { id: "l3", at: now - 74 * h, kind: "cancel", text: "Hard jolt detected · cancelled by wearer within 4 s" }
];
const SCENARIOS = [
  { key: "stable", label: "Stable" },
  { key: "bp-spike", label: "BP spike" },
  { key: "bp-crash", label: "BP crash" },
  { key: "sugar-spike", label: "Sugar spike" },
  { key: "sugar-crash", label: "Sugar crash" },
  { key: "heart-racing", label: "Heart racing" },
  { key: "low-oxygen", label: "Low oxygen" },
  { key: "fall", label: "Fall" }
];
const SCENARIO_TARGETS = {
  stable: { sys: 124, dia: 80, glucose: 112, hr: 74, spo2: 97 },
  "bp-spike": { sys: 196, dia: 124, glucose: 118, hr: 92, spo2: 96 },
  "bp-crash": { sys: 72, dia: 44, glucose: 110, hr: 112, spo2: 95 },
  "sugar-spike": { sys: 132, dia: 84, glucose: 348, hr: 88, spo2: 97 },
  "sugar-crash": { sys: 118, dia: 76, glucose: 46, hr: 104, spo2: 97 },
  "heart-racing": { sys: 142, dia: 90, glucose: 120, hr: 148, spo2: 96 },
  "low-oxygen": { sys: 128, dia: 82, glucose: 114, hr: 108, spo2: 84 }
};
const DEMO_DEVICE = { name: "Demo band", battery: 82 };
const SETTINGS_KEY = "lifeline:settings:v1";
const initial = {
  demoMode: true,
  scenario: "stable",
  vitals: {},
  history: { bp: [], glucose: [], hr: [], spo2: [] },
  thresholds: DEFAULT_THRESHOLDS,
  contacts: DEFAULT_CONTACTS,
  countryCode: "IN",
  countdownSeconds: 15,
  alarm: { phase: "idle", reason: null, startedAt: null, demo: false },
  log: SEED_LOG,
  location: { status: "idle", fix: null, error: null },
  assistantOpen: false
};
const appStore = new Store(initial);
const set = (patch) => appStore.setState((s) => ({ ...s, ...typeof patch === "function" ? patch(s) : patch }));
const emergencyNumbers = (s) => EMERGENCY_BY_COUNTRY[s.countryCode] ?? EMERGENCY_BY_COUNTRY.IN;
let logSeq = 0;
function addLog(kind, text) {
  set((s) => ({ log: [{ id: `e${Date.now()}-${logSeq++}`, at: Date.now(), kind, text }, ...s.log].slice(0, 50) }));
}
function raiseAlarm(reason, opts) {
  const s = appStore.state;
  if (s.alarm.phase !== "idle") return;
  const immediate = opts.immediate || s.countdownSeconds === 0;
  set({
    alarm: { phase: immediate ? "dispatched" : "countdown", reason, startedAt: Date.now(), demo: opts.demo },
    // Never cover the "I'm OK" button during the countdown.
    assistantOpen: immediate
  });
  addLog(reason.type === "sos" ? "sos" : "alarm", `${reason.label} · ${reason.reading}${opts.demo ? " (demo)" : ""}`);
}
function dispatchAlarm() {
  set((s) => ({ alarm: { ...s.alarm, phase: "dispatched" }, assistantOpen: true }));
}
function cancelAlarm(note) {
  const s = appStore.state;
  if (s.alarm.phase === "idle") return;
  const secs = s.alarm.startedAt ? Math.round((Date.now() - s.alarm.startedAt) / 1e3) : 0;
  addLog("cancel", `${s.alarm.reason?.label ?? "Alarm"} · ${note} after ${secs} s`);
  set({ alarm: { phase: "idle", reason: null, startedAt: null, demo: false } });
  if (s.demoMode && s.scenario !== "stable") set({ scenario: "stable" });
}
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) set(JSON.parse(raw));
  } catch {
  }
  appStore.subscribe((s) => {
    const p = {
      contacts: s.contacts,
      countryCode: s.countryCode,
      countdownSeconds: s.countdownSeconds,
      thresholds: s.thresholds,
      demoMode: s.demoMode
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(p));
  });
}
const useApp = (selector) => useStore(appStore, selector);
function Nav() {
  const demo = useApp((s) => s.demoMode);
  const alarm = useApp((s) => s.alarm.phase);
  const hasVitals = useApp((s) => Object.keys(s.vitals).length > 0);
  const pill = alarm !== "idle" ? { text: "Alarm", cls: "bg-rose-600 text-white", dot: "bg-white animate-flash" } : demo ? { text: "Demo", cls: "bg-amber-100 text-amber-900", dot: "bg-amber-500" } : hasVitals ? { text: "Guarding", cls: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" } : { text: "No device", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  const link = "px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition";
  const active = { className: `${link} !bg-slate-900 !text-white` };
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center gap-2 px-4 py-3", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "mr-auto flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "grid size-8 place-items-center rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-600/30", children: /* @__PURE__ */ jsx(HeartPulse, { className: "size-4.5", strokeWidth: 2.5 }) }),
      /* @__PURE__ */ jsx("span", { className: "font-display text-lg font-bold tracking-tight", children: "Lifeline" })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Link, { to: "/monitor", className: link, activeProps: active, children: "Monitor" }),
      /* @__PURE__ */ jsx(Link, { to: "/contacts", className: link, activeProps: active, children: "Contacts" })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: `ml-1 hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:flex ${pill.cls}`, children: [
      /* @__PURE__ */ jsx("span", { className: `size-1.5 rounded-full ${pill.dot}` }),
      pill.text
    ] })
  ] }) });
}
let watchId = null;
function startTracking() {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    set({ location: { status: "unavailable", fix: null, error: "This browser has no location support." } });
    return;
  }
  if (watchId != null) return;
  set((s) => ({ location: { ...s.location, status: "requesting", error: null } }));
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const first = appStore.state.location.status !== "tracking";
      set({
        location: {
          status: "tracking",
          error: null,
          fix: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, at: pos.timestamp }
        }
      });
      if (first) addLog("location", `Location tracking on · ±${Math.round(pos.coords.accuracy)} m`);
    },
    (err) => {
      const denied = err.code === err.PERMISSION_DENIED;
      if (denied && watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      set((s) => ({
        location: {
          ...s.location,
          status: denied ? "denied" : s.location.fix ? "tracking" : "error",
          error: denied ? "Location permission was denied." : err.code === err.TIMEOUT ? "Waiting for a GPS fix…" : "Location unavailable right now."
        }
      }));
    },
    { enableHighAccuracy: true, maximumAge: 5e3, timeout: 2e4 }
  );
}
function stopTracking() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  set((s) => ({ location: { ...s.location, status: "idle" } }));
}
let ctx = null;
let timer = null;
function beep(freq, at, dur) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = freq;
  g.gain.setValueAtTime(1e-4, at);
  g.gain.exponentialRampToValueAtTime(0.35, at + 0.02);
  g.gain.exponentialRampToValueAtTime(1e-4, at + dur);
  o.connect(g).connect(ctx.destination);
  o.start(at);
  o.stop(at + dur + 0.05);
}
function startSiren() {
  if (timer) return;
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    return;
  }
  const cycle = () => {
    if (!ctx) return;
    const t = ctx.currentTime;
    beep(960, t, 0.28);
    beep(720, t + 0.32, 0.28);
    navigator.vibrate?.([300, 100, 300]);
  };
  cycle();
  timer = setInterval(cycle, 700);
}
function stopSiren() {
  if (timer) clearInterval(timer);
  timer = null;
  navigator.vibrate?.(0);
}
function tick() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    beep(1200, ctx.currentTime, 0.05);
  } catch {
  }
}
const mapsLink = (f) => `https://maps.google.com/?q=${f.lat.toFixed(6)},${f.lng.toFixed(6)}`;
const clockTime = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
function buildSosMessage(reason, fix, opts = {}) {
  const p = PATIENT;
  const lines = [
    `${opts.test ? "[TEST — no action needed] " : ""}EMERGENCY: ${p.name} (${p.age}, blood ${p.bloodType}) needs help.`,
    reason ? `Reason: ${reason.label} — ${reason.reading} at ${clockTime(Date.now())}.` : "Reason: SOS pressed.",
    fix ? `Location: ${mapsLink(fix)} (±${Math.round(fix.accuracy)} m, ${clockTime(fix.at)})` : "Location: unavailable — please call.",
    `Conditions: ${p.conditions.join(", ")}. Allergies: ${p.allergies.join(", ")}. Meds: ${p.medications.join(", ")}.`,
    "Sent via Lifeline."
  ];
  return lines.join("\n");
}
const digits = (phone) => phone.replace(/[^\d+]/g, "");
const isApple = () => typeof navigator !== "undefined" && /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
function smsHref(phones, body) {
  const to = phones.map(digits).join(",");
  return `sms:${to}${isApple() ? "&" : "?"}body=${encodeURIComponent(body)}`;
}
const telHref = (phone) => `tel:${digits(phone)}`;
function isValidPhone(phone) {
  const d = digits(phone);
  return /^\+?\d{3,15}$/.test(d);
}
function AlarmOverlay() {
  const alarm = useApp((s) => s.alarm);
  const countdown = useApp((s) => s.countdownSeconds);
  if (alarm.phase === "idle") return null;
  return alarm.phase === "countdown" ? /* @__PURE__ */ jsx(Countdown, { total: countdown }) : /* @__PURE__ */ jsx(Dispatched, {});
}
function Countdown({ total }) {
  const alarm = useApp((s) => s.alarm);
  const [left, setLeft] = useState(total);
  useEffect(() => {
    startSiren();
    startTracking();
    const started = alarm.startedAt ?? Date.now();
    const id = setInterval(() => {
      const l = Math.max(0, total - Math.floor((Date.now() - started) / 1e3));
      setLeft(l);
      if (l === 0) dispatchAlarm();
    }, 200);
    return () => {
      clearInterval(id);
      stopSiren();
    };
  }, [alarm.startedAt, total]);
  return /* @__PURE__ */ jsxs("div", { role: "alertdialog", "aria-live": "assertive", className: "fixed inset-0 z-40 flex flex-col items-center justify-between overflow-y-auto bg-rose-600 px-6 py-10 text-white", children: [
    alarm.demo && /* @__PURE__ */ jsx(DemoStrip, {}),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "mx-auto size-12 animate-flash", strokeWidth: 2.2 }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-rose-100", children: "Emergency detected" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-display text-4xl font-extrabold sm:text-5xl", children: alarm.reason?.label }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 font-mono text-lg text-rose-100", children: alarm.reason?.reading })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "my-8 grid place-items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "relative grid size-52 place-items-center rounded-full border-8 border-white/30", children: /* @__PURE__ */ jsx("span", { className: "font-display text-8xl font-extrabold tabular", children: left }) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 max-w-xs text-center text-rose-50", children: [
        "Calling for help in ",
        left,
        " s. Your location and medical details will be shared."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full max-w-sm flex-col gap-3", children: [
      /* @__PURE__ */ jsx(HoldToCancel, {}),
      /* @__PURE__ */ jsx("button", { onClick: dispatchAlarm, className: "rounded-2xl border-2 border-white/60 py-4 text-lg font-bold transition hover:bg-white/10", children: "Get help now" })
    ] })
  ] });
}
function HoldToCancel() {
  const [p, setP] = useState(0);
  const raf = useRef(null);
  const begin = () => {
    const t0 = performance.now();
    const step = () => {
      const v = Math.min(1, (performance.now() - t0) / 1500);
      setP(v);
      if (v >= 1) return cancelAlarm("cancelled by wearer");
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const end = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setP(0);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onPointerDown: begin,
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      className: "relative h-20 select-none touch-none overflow-hidden rounded-2xl bg-white text-xl font-extrabold text-rose-700 shadow-2xl",
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 left-0 bg-emerald-400/40", style: { width: `${p * 100}%` } }),
        /* @__PURE__ */ jsx("span", { className: "relative", children: p > 0 ? "Keep holding…" : "I'm OK — hold to cancel" })
      ]
    }
  );
}
function DemoStrip() {
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-xl rounded-xl bg-amber-300 px-4 py-2 text-center text-sm font-bold text-amber-950", children: "DEMO MODE · no real alerts · nobody will be contacted" });
}
function Dispatched() {
  const alarm = useApp((s) => s.alarm);
  const loc = useApp((s) => s.location);
  const contacts = useApp((s) => s.contacts);
  const n = useApp(emergencyNumbers);
  const [done, setDone] = useState({});
  const [siren, setSiren] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    startTracking();
    return () => stopSiren();
  }, []);
  useEffect(() => siren ? startSiren() : stopSiren(), [siren]);
  const msg = buildSosMessage(alarm.reason, loc.fix, { test: alarm.demo });
  const smsContacts = contacts.filter((c) => c.sms);
  const mark = (k) => setDone((d) => ({ ...d, [k]: true }));
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Emergency — Lifeline", text: msg });
      else {
        await navigator.clipboard.writeText(msg);
        setCopied(true);
      }
      mark("share");
    } catch {
    }
  };
  const resolve = () => {
    const okMsg = `${PATIENT.name} is safe now — the Lifeline alert at ${clockTime(alarm.startedAt ?? Date.now())} is resolved. Thank you.`;
    if (!alarm.demo && Object.keys(done).length && smsContacts.length && confirm(`Send an "I'm OK" message to your contacts?`)) {
      window.location.href = smsHref(smsContacts.map((c) => c.phone), okMsg);
    }
    cancelAlarm("marked resolved");
  };
  return /* @__PURE__ */ jsxs("div", { role: "alertdialog", className: "fixed inset-0 z-40 overflow-y-auto bg-slate-950 text-white", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-rose-600 px-5 pb-6 pt-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl", children: [
      alarm.demo && /* @__PURE__ */ jsx(DemoStrip, {}),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-rose-100", children: [
        alarm.reason?.label,
        " · ",
        clockTime(alarm.startedAt ?? Date.now())
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "mt-1 font-display text-3xl font-extrabold sm:text-4xl", children: alarm.demo ? "Demo alert — this is what happens next" : "Get help now" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-rose-50", children: alarm.demo ? "In a real alert these buttons call and message your contacts." : "Tap to call. Messages open in your phone with your location attached — press Send." }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: alarm.demo ? void 0 : telHref(n.general),
          onClick: () => mark("call-general"),
          "aria-disabled": alarm.demo,
          className: `mt-5 flex items-center justify-center gap-3 rounded-2xl bg-white py-5 text-2xl font-extrabold text-rose-700 shadow-2xl ${alarm.demo ? "pointer-events-none opacity-60" : "active:scale-[0.98]"}`,
          children: [
            /* @__PURE__ */ jsx(Phone, { className: "size-7", strokeWidth: 2.6 }),
            " Call emergency ",
            n.general
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-2xl gap-4 px-5 py-6", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white/5 p-4 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "size-4 text-rose-400" }),
          " Live location",
          /* @__PURE__ */ jsx("span", { className: "ml-auto text-xs font-medium text-slate-400", children: loc.status === "tracking" && loc.fix ? `±${Math.round(loc.fix.accuracy)} m · ${clockTime(loc.fix.at)}` : loc.status === "denied" ? "Permission denied" : "Locating…" })
        ] }),
        loc.fix ? /* @__PURE__ */ jsxs("a", { href: mapsLink(loc.fix), target: "_blank", rel: "noreferrer", className: "mt-2 block font-mono text-sm text-sky-300 underline-offset-4 hover:underline", children: [
          loc.fix.lat.toFixed(5),
          ", ",
          loc.fix.lng.toFixed(5),
          " — open map"
        ] }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: loc.status === "denied" ? "Enable location for this site so responders can find you. Say your address when you call." : "Getting a GPS fix. Messages sent now will say location is unavailable." })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(ServiceButton, { icon: /* @__PURE__ */ jsx(Shield, { className: "size-5" }), label: "Police", number: n.police, demo: alarm.demo, onUse: () => mark("police"), done: done.police }),
        /* @__PURE__ */ jsx(ServiceButton, { icon: /* @__PURE__ */ jsx(Ambulance, { className: "size-5" }), label: "Ambulance", number: n.ambulance, demo: alarm.demo, onUse: () => mark("ambulance"), done: done.ambulance }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: alarm.demo ? void 0 : smsHref([n.smsNumber], msg),
            onClick: () => mark("sms-112"),
            className: `col-span-2 flex items-center gap-3 rounded-2xl bg-rose-500/15 p-4 ring-1 ring-rose-400/30 ${alarm.demo ? "pointer-events-none opacity-50" : "hover:bg-rose-500/25"}`,
            children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "size-5 text-rose-300" }),
              /* @__PURE__ */ jsxs("span", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "block font-semibold", children: [
                  "Text police & ambulance (",
                  n.smsNumber,
                  ")"
                ] }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs text-slate-400", children: "Emergency SMS where your region supports it. If unsure, call." })
              ] }),
              done["sms-112"] && /* @__PURE__ */ jsx(Check, { className: "size-5 text-emerald-400" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white/5 p-4 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Your emergency contacts" }),
          smsContacts.length > 0 && /* @__PURE__ */ jsxs(
            "a",
            {
              href: alarm.demo ? void 0 : smsHref(smsContacts.map((c) => c.phone), msg),
              onClick: () => mark("sms-all"),
              className: `rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-900 ${alarm.demo ? "pointer-events-none opacity-50" : ""}`,
              children: [
                done["sms-all"] ? "✓ " : "",
                "Message all"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-3 divide-y divide-white/10", children: contacts.map((c) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-3 py-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "grid size-9 place-items-center rounded-full bg-white/10 text-sm font-bold", children: c.name[0] }),
          /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("span", { className: "block truncate font-medium", children: c.name }),
            /* @__PURE__ */ jsxs("span", { className: "block text-xs text-slate-400", children: [
              c.relationship,
              " · ",
              c.phone
            ] })
          ] }),
          c.sms && /* @__PURE__ */ jsx("a", { "aria-label": `Text ${c.name}`, href: alarm.demo ? void 0 : smsHref([c.phone], msg), onClick: () => mark(`s-${c.id}`), className: `grid size-10 place-items-center rounded-full ${done[`s-${c.id}`] ? "bg-emerald-500" : "bg-white/10"} ${alarm.demo ? "pointer-events-none opacity-50" : ""}`, children: /* @__PURE__ */ jsx(MessageSquare, { className: "size-4" }) }),
          c.call && /* @__PURE__ */ jsx("a", { "aria-label": `Call ${c.name}`, href: alarm.demo ? void 0 : telHref(c.phone), onClick: () => mark(`c-${c.id}`), className: `grid size-10 place-items-center rounded-full ${done[`c-${c.id}`] ? "bg-emerald-500" : "bg-white/10"} ${alarm.demo ? "pointer-events-none opacity-50" : ""}`, children: /* @__PURE__ */ jsx(Phone, { className: "size-4" }) })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl bg-white/5 p-4 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "mr-auto font-semibold", children: "Message being sent" }),
          /* @__PURE__ */ jsxs("button", { onClick: share, className: "flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20", children: [
            copied ? /* @__PURE__ */ jsx(Copy, { className: "size-4" }) : /* @__PURE__ */ jsx(Share2, { className: "size-4" }),
            " ",
            copied ? "Copied" : "Share"
          ] })
        ] }),
        /* @__PURE__ */ jsx("pre", { className: "mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-300", children: msg })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 pb-[48dvh] sm:pb-28", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => setSiren((v) => !v), className: "flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/20", children: [
          siren ? /* @__PURE__ */ jsx(VolumeX, { className: "size-5" }) : /* @__PURE__ */ jsx(Volume2, { className: "size-5" }),
          " ",
          siren ? "Stop siren" : "Sound siren"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: resolve, className: "flex-1 rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-emerald-950 hover:bg-emerald-400", children: "I'm safe — mark resolved" })
      ] })
    ] })
  ] });
}
function ServiceButton(props) {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: props.demo ? void 0 : telHref(props.number),
      onClick: props.onUse,
      className: `flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 ${props.demo ? "pointer-events-none opacity-50" : "hover:bg-white/10"}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "grid size-10 place-items-center rounded-xl bg-white/10", children: props.icon }),
        /* @__PURE__ */ jsxs("span", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-sm text-slate-400", children: props.label }),
          /* @__PURE__ */ jsx("span", { className: "block font-mono text-xl font-bold", children: props.number })
        ] }),
        props.done && /* @__PURE__ */ jsx(Check, { className: "size-5 text-emerald-400" })
      ]
    }
  );
}
function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  const w = window;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
function useSpeech(lang = "en-IN") {
  const [supported, setSupported] = useState({ tts: false, stt: false });
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef(null);
  useEffect(() => {
    setSupported({ tts: "speechSynthesis" in window, stt: !!getRecognitionCtor() });
    return () => {
      recRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);
  const speak = useCallback(
    (text, onEnd) => {
      if (!("speechSynthesis" in window)) return onEnd?.();
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, "map link"));
      u.lang = lang;
      u.rate = 0.95;
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang === lang) ?? window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
      if (voice) u.voice = voice;
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [lang]
  );
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  const listen = useCallback(
    (onFinal) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return;
      window.speechSynthesis?.cancel();
      recRef.current?.stop();
      const rec = new Ctor();
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e) => {
        let text = "";
        let final = false;
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
          if (e.results[i].isFinal) final = true;
        }
        setInterim(text);
        if (final) {
          setInterim("");
          onFinal(text.trim());
        }
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    },
    [lang]
  );
  const stopListening = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);
  return { supported, listening, speaking, interim, speak, stopSpeaking, listen, stopListening };
}
const GUIDES = [
  {
    id: "cpr",
    title: "Not breathing · CPR",
    keywords: ["cpr", "not breathing", "unconscious", "unresponsive", "no pulse", "cardiac arrest", "collapsed", "heart stopped", "passed out not breathing"],
    call: "always",
    intro: "If the person is unresponsive and not breathing normally, start CPR now.",
    steps: [
      "Check the scene is safe. Tap their shoulders and shout. If no response, call the emergency number on speaker.",
      "Lay them flat on their back on a firm surface.",
      "Put the heel of one hand in the centre of the chest, the other hand on top. Lock your elbows.",
      "Push hard and fast: about 5 centimetres deep, 100 to 120 times a minute. Follow the beat.",
      "Let the chest come all the way back up between pushes.",
      "If you are trained, give 2 rescue breaths after every 30 pushes. If not, keep pushing without stopping.",
      "If someone brings an AED, switch it on and follow its voice prompts.",
      "Keep going until help takes over or the person starts breathing normally."
    ],
    metronome: true
  },
  {
    id: "choking",
    title: "Choking",
    keywords: ["choking", "choke", "can't breathe food", "something stuck", "swallowed", "stuck in throat"],
    call: "if-severe",
    intro: "If they can cough, encourage them to keep coughing. If they cannot speak, cough or breathe, act now.",
    steps: [
      "Stand to the side and slightly behind them. Support their chest with one hand and lean them forward.",
      "Give up to 5 firm back blows between the shoulder blades with the heel of your hand.",
      "If still choking, stand behind them, make a fist just above the belly button, grasp it with your other hand.",
      "Give up to 5 sharp inward and upward abdominal thrusts.",
      "Repeat 5 back blows and 5 thrusts. Call the emergency number if it has not cleared after three rounds.",
      "If they become unresponsive, lower them to the floor and start CPR."
    ],
    avoid: ["Do not use abdominal thrusts on babies under one year or on pregnant women; use chest thrusts instead."]
  },
  {
    id: "chest-pain",
    title: "Chest pain · possible heart attack",
    keywords: ["chest pain", "heart attack", "chest tight", "pressure in chest", "pain in left arm", "jaw pain", "angina"],
    call: "always",
    intro: "Don't wait to see if it passes. Call the emergency number now.",
    steps: [
      'Call the emergency number now and say "possible heart attack".',
      "Sit down and rest in a comfortable position, ideally on the floor leaning against a wall with knees bent.",
      "Loosen tight clothing. Stay calm and keep still.",
      "Ask the emergency operator whether you should chew an aspirin. Do not take it if you are allergic to aspirin.",
      "If you have prescribed angina medicine, use it as your doctor told you.",
      "Unlock the door if you can, so responders can reach you.",
      "If you become unresponsive and stop breathing, anyone with you should start CPR."
    ]
  },
  {
    id: "stroke",
    title: "Stroke signs · F.A.S.T.",
    keywords: ["stroke", "face drooping", "slurred speech", "arm weakness", "numb one side", "confused speech", "fast test", "paralysis"],
    call: "always",
    intro: "Every minute matters. Don't wait — call the emergency number now.",
    steps: [
      "Face: ask them to smile. Does one side droop?",
      "Arms: ask them to raise both arms. Does one drift down?",
      "Speech: ask them to repeat a simple sentence. Is it slurred or strange?",
      'Time: if you see any of these, call the emergency number immediately and say "stroke".',
      "Note the time the symptoms started. Doctors need this.",
      "Keep them comfortable and supported. If drowsy, place them on their side."
    ],
    avoid: ["Do not give food, drink or medicine — swallowing may be affected."]
  },
  {
    id: "low-sugar",
    title: "Low blood sugar",
    keywords: ["low sugar", "sugar crash", "hypo", "hypoglycemia", "hypoglycaemia", "shaky", "sweating diabetic", "low glucose", "sugar low", "sugar is low", "sugar dropped"],
    call: "if-severe",
    intro: "Act fast while the person can still swallow safely.",
    steps: [
      "Sit down right away so you do not fall.",
      "If conscious and able to swallow safely, take fast-acting sugar: a glass of juice or regular soft drink, glucose tablets, or a spoon of sugar or honey.",
      "Wait 15 minutes, then check sugar again if you can.",
      "If it is still low or you feel no better, take fast sugar again.",
      "Once you feel better, eat a snack with starch, like bread or biscuits.",
      "If the person is drowsy, confused, cannot swallow or is unconscious, call the emergency number. Place them on their side. Give nothing by mouth."
    ]
  },
  {
    id: "high-sugar",
    title: "High blood sugar",
    keywords: ["high sugar", "sugar spike", "hyperglycemia", "hyperglycaemia", "high glucose", "sugar high", "sugar is high", "very thirsty"],
    call: "if-severe",
    intro: "Very high sugar can become dangerous, especially with vomiting or drowsiness.",
    steps: [
      "Sip water slowly if you can swallow safely.",
      "Re-check your blood sugar to confirm the reading.",
      "Follow the sick-day plan your doctor gave you. Do not change medicine doses on your own.",
      "Call the emergency number if you are vomiting, breathing fast, very drowsy, confused, or have fruity-smelling breath.",
      "Contact your doctor today even if you feel okay."
    ]
  },
  {
    id: "high-bp",
    title: "Very high blood pressure",
    keywords: ["high bp", "high blood pressure", "bp spike", "hypertension", "pressure very high", "severe headache"],
    call: "if-severe",
    intro: "Sit quietly and re-check. Some symptoms need emergency care immediately.",
    steps: [
      "Sit down, back supported, feet flat. Rest for 5 minutes.",
      "Re-measure your blood pressure with the cuff on a bare upper arm at heart level.",
      "Call the emergency number now if you also have chest pain, shortness of breath, a severe headache, confusion, vision changes, weakness or trouble speaking.",
      "If the reading stays very high without symptoms, contact your doctor today.",
      "Do not take extra blood pressure medicine unless your doctor told you to."
    ]
  },
  {
    id: "heart-racing",
    title: "Heart racing",
    keywords: ["heart racing", "palpitations", "fast heartbeat", "heart pounding", "tachycardia", "pulse high"],
    call: "if-severe",
    intro: "Stop what you are doing and sit down.",
    steps: [
      "Sit or lie down. Stop any activity.",
      "Breathe slowly: in for 4 seconds, out for 6 seconds.",
      "Call the emergency number if you also have chest pain, fainting, severe breathlessness or confusion.",
      "If it does not settle within a few minutes, seek medical help."
    ]
  },
  {
    id: "breathing",
    title: "Breathing difficulty · low oxygen",
    keywords: ["breathing", "breathless", "short of breath", "can't breathe", "asthma", "wheezing", "low oxygen", "spo2"],
    call: "if-severe",
    intro: "Help the person sit upright and breathe slowly.",
    steps: [
      "Sit upright, leaning slightly forward. Loosen tight clothing.",
      "If you have a prescribed reliever inhaler, use it as your doctor told you.",
      "Breathe slowly through the nose and out through pursed lips.",
      "Check the oximeter is on a warm finger and you are keeping still; cold hands and movement give false low readings.",
      "Call the emergency number if lips or face turn blue or grey, speaking is hard, or it is not improving."
    ]
  },
  {
    id: "bleeding",
    title: "Severe bleeding",
    keywords: ["bleeding", "blood loss", "cut", "wound", "deep cut", "haemorrhage", "hemorrhage"],
    call: "if-severe",
    intro: "Press hard on the wound and keep pressing.",
    steps: [
      "Wear gloves if you have them. Press firmly on the wound with a clean cloth or dressing.",
      "Keep steady pressure for at least 10 minutes. Do not keep lifting to check.",
      "If blood soaks through, add more cloth on top. Do not remove the first layer.",
      "Raise the injured part above heart level if it does not cause pain.",
      "Call the emergency number for heavy bleeding that will not stop, spurting blood, or if they feel faint."
    ],
    avoid: ["Do not remove an object stuck in the wound — press around it."]
  },
  {
    id: "burns",
    title: "Burns",
    keywords: ["burn", "burned", "burnt", "scald", "fire", "hot water"],
    call: "if-severe",
    intro: "Cool the burn with running water straight away.",
    steps: [
      "Move away from the heat source.",
      "Cool the burn under cool running water for 20 minutes.",
      "Remove rings, watches or clothing near the burn unless stuck to the skin.",
      "Cover loosely with cling film or a clean, non-fluffy cloth.",
      "Call the emergency number for large burns, burns on the face, hands or genitals, or electrical and chemical burns."
    ],
    avoid: ["Do not use ice, butter, toothpaste or creams.", "Do not burst blisters."]
  },
  {
    id: "fall",
    title: "After a fall · head injury",
    keywords: ["fall", "fell", "fallen", "tripped", "head injury", "hit my head", "bump on head", "concussion"],
    call: "if-severe",
    intro: "Don't get up quickly. Check yourself first.",
    steps: [
      "Stay still for a moment. Breathe and check for pain.",
      "If you are badly hurt, or have neck or back pain, do not move — call for help.",
      "If you can, roll onto your side, get onto hands and knees, and crawl to a sturdy chair.",
      "Use the chair to push yourself up slowly, then sit down.",
      "Call the emergency number for confusion, vomiting, seizure, severe headache, bleeding that will not stop, or if you take blood thinners and hit your head."
    ]
  },
  {
    id: "fainting",
    title: "Fainting · dizziness",
    keywords: ["faint", "fainted", "fainting", "dizzy", "lightheaded", "low bp", "blood pressure low", "bp crash", "collapse"],
    call: "if-severe",
    intro: "Lie down before you fall.",
    steps: [
      "Lie down on your back right away.",
      "Raise your legs about 30 centimetres on a pillow or chair.",
      "Loosen tight clothing and get fresh air.",
      "Stay lying down for 10 to 15 minutes, then sit up slowly.",
      "If they do not wake within a minute, check breathing. If not breathing normally, call the emergency number and start CPR."
    ]
  },
  {
    id: "seizure",
    title: "Seizure",
    keywords: ["seizure", "having a fit", "convulsion", "epilepsy", "shaking uncontrollably"],
    call: "if-severe",
    intro: "Keep them safe. Do not hold them down.",
    steps: [
      "Note the time the seizure started.",
      "Move hard or sharp objects away. Cushion their head.",
      "Do not hold them down and do not put anything in their mouth.",
      "When the shaking stops, roll them onto their side and check breathing.",
      "Call the emergency number if it lasts more than 5 minutes, it is their first seizure, they are injured, or they do not wake up."
    ]
  },
  {
    id: "allergy",
    title: "Severe allergic reaction",
    keywords: ["allergy", "allergic", "anaphylaxis", "swelling", "swollen throat", "hives", "bee sting", "epipen"],
    call: "always",
    intro: "Swelling of the face or throat, or trouble breathing, is an emergency.",
    steps: [
      'Call the emergency number and say "anaphylaxis".',
      "If they have an adrenaline auto-injector, help them use it in the outer thigh.",
      "If breathing is hard, let them sit up. If they feel faint, lay them down with legs raised.",
      "If there is no improvement after 5 minutes and they have a second auto-injector, use it.",
      "If they stop breathing, start CPR."
    ]
  },
  {
    id: "heat",
    title: "Heat stroke",
    keywords: ["heat stroke", "heatstroke", "sunstroke", "overheated", "too hot", "heat exhaustion"],
    call: "if-severe",
    intro: "Cool them down as fast as possible.",
    steps: [
      "Move them to a cool, shaded place.",
      "Remove extra clothing.",
      "Cool the skin with cool water and fan them. Place cold packs in the armpits and neck.",
      "If they are alert, give small sips of cool water.",
      "Call the emergency number if they are confused, stop sweating, faint or have a seizure."
    ]
  },
  {
    id: "poisoning",
    title: "Poisoning · overdose",
    keywords: ["poison", "poisoning", "overdose", "swallowed chemical", "took too many pills"],
    call: "always",
    intro: "Call the emergency number. Keep the container to show responders.",
    steps: [
      "Call the emergency number and tell them what was taken, how much and when.",
      "Do not make them vomit unless told to.",
      "If they are drowsy but breathing, place them on their side.",
      "If they stop breathing, start CPR."
    ]
  },
  {
    id: "shock",
    title: "Electric shock",
    keywords: ["electric shock", "electrocuted", "electrocution", "electric current"],
    call: "always",
    intro: "Do not touch them until the power is off.",
    steps: [
      "Switch off the power at the mains or unplug the device.",
      "If you cannot, stand on dry material and push the source away with something wooden or plastic.",
      "Call the emergency number.",
      "If they are not breathing normally, start CPR.",
      "Cool any burns with running water."
    ]
  }
];
const guideById = (id) => GUIDES.find((g) => g.id === id);
function matchGuide(text) {
  const q = ` ${text.toLowerCase().replace(/[^\w\s']/g, " ").replace(/\s+/g, " ")} `;
  let best = null;
  for (const g of GUIDES) {
    let score = 0;
    for (const k of g.keywords) if (q.includes(` ${k}`)) score += k.split(" ").length + 1;
    if (score > 0 && (!best || score > best.score)) best = { g, score };
  }
  return best?.g ?? null;
}
const SUSTAIN_MS = 3e3;
const MAX_AGE_MS = { hr: 1e4, spo2: 1e4, bp: 30 * 6e4, glucose: 30 * 6e4 };
const WARN_MARGIN = { hr: 15, spo2: 4, bp: 20, glucose: 25 };
const HYSTERESIS = { hr: 5, spo2: 2, bp: 5, glucose: 8 };
function isStale(key, r, now2 = Date.now()) {
  return !r || now2 - r.measuredAt > MAX_AGE_MS[key];
}
function beyond(v, t, margin = 0) {
  return t.below != null && v < t.below + margin || t.above != null && v > t.above - margin;
}
function classify(key, r, t, prev = "normal") {
  if (!r || r.quality === "stale") return "unknown";
  const crit = beyond(r.value, t) || key === "bp" && t.above2 != null && r.value2 != null && r.value2 > t.above2;
  if (crit) return "critical";
  if (prev === "critical") {
    const h2 = HYSTERESIS[key];
    const stillNear = t.below != null && r.value < t.below + h2 || t.above != null && r.value > t.above - h2;
    if (stillNear) return "critical";
  }
  return beyond(r.value, t, WARN_MARGIN[key]) ? "warning" : "normal";
}
function createSustainTracker(sustainMs = SUSTAIN_MS) {
  const since = {};
  return (statuses, now2 = Date.now()) => {
    const fired = [];
    for (const k of Object.keys(statuses)) {
      if (statuses[k] === "critical") {
        since[k] ??= now2;
        if (now2 - since[k] >= sustainMs) fired.push(k);
      } else {
        delete since[k];
      }
    }
    return fired;
  };
}
const VITAL_META = {
  bp: { label: "Blood pressure", unit: "mmHg", guide: "high-bp" },
  glucose: { label: "Blood sugar", unit: "mg/dL", guide: "low-sugar" },
  hr: { label: "Heart rate", unit: "bpm", guide: "heart-racing" },
  spo2: { label: "Oxygen", unit: "% SpO₂", guide: "breathing" }
};
function formatReading(key, r) {
  return key === "bp" ? `${Math.round(r.value)}/${Math.round(r.value2 ?? 0)}` : `${Math.round(r.value)}`;
}
function guideFor(key, r, t) {
  const low = t.below != null && r.value < t.below;
  if (key === "glucose") return low ? "low-sugar" : "high-sugar";
  if (key === "bp") return low ? "fainting" : "high-bp";
  if (key === "hr") return low ? "fainting" : "heart-racing";
  return "breathing";
}
const QUICK_CHIPS = ["What's my status?", "Explain this alert", "What should I do?", "Summarise today", "Where am I?", "Help me connect my watch"];
const has = (q, ...words) => words.some((w) => q.includes(w));
function respond(input, s) {
  const q = input.toLowerCase().trim();
  const n = emergencyNumbers(s);
  const callAll = [{ kind: "call", number: n.general, label: `Call ${n.general}` }];
  const inAlarm = s.alarm.phase !== "idle";
  const prefix = inAlarm ? s.alarm.demo ? "Demo alert — nobody is being contacted. " : "Help is being contacted. " : "";
  if (has(q, "police")) {
    return {
      text: `${prefix}Police: ${n.police}. All-in-one emergency: ${n.general}. I can also start SOS, which prepares a message with your live location for police, ambulance and your contacts.`,
      actions: [{ kind: "call", number: n.police, label: `Call police ${n.police}` }, { kind: "start-sos" }]
    };
  }
  if (has(q, "ambulance")) {
    return {
      text: `${prefix}Ambulance: ${n.ambulance}. All-in-one emergency: ${n.general}. Say what happened, your location, and whether the person is breathing.`,
      actions: [{ kind: "call", number: n.ambulance, label: `Call ambulance ${n.ambulance}` }, { kind: "start-sos" }]
    };
  }
  if (has(q, "sos", "emergency", "call for help", "send alert", "need help") || /^help( me)?[.!]*$/.test(q)) {
    return {
      text: `${prefix}Do you want me to start SOS? It sounds the alarm, shares your live location and prepares messages for emergency services and your contacts. If life is at risk, call ${n.general} now.`,
      actions: [{ kind: "start-sos" }, ...callAll]
    };
  }
  if (has(q, "where am i", "location", "my address", "share my")) {
    const f = s.location.fix;
    if (f) {
      return {
        text: `Your location (±${Math.round(f.accuracy)} m, ${clockTime(f.at)}): ${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}. Map link: ${mapsLink(f)}`,
        actions: [{ kind: "share-location" }]
      };
    }
    return {
      text: s.location.status === "denied" ? "Location access is blocked. Enable it for this site in your browser settings so SOS messages can include where you are." : "I don't have your location yet. Turn on location tracking so SOS messages include a live map link.",
      actions: [{ kind: "start-location" }]
    };
  }
  if (has(q, "status", "how am i", "my vitals", "readings")) {
    const parts = Object.keys(VITAL_META).map((k) => {
      const r = s.vitals[k];
      if (!r) return `${VITAL_META[k].label}: no data from a connected device`;
      if (isStale(k, r)) return `${VITAL_META[k].label}: signal lost (last ${clockTime(r.measuredAt)})`;
      return `${VITAL_META[k].label} ${formatReading(k, r)} ${r.unit}`;
    });
    const src = s.demoMode ? " These are demo readings, not real measurements." : "";
    return { text: `${prefix}${parts.join(". ")}.${src}` };
  }
  if (has(q, "explain", "why did", "why alert", "alert fired")) {
    const last = inAlarm ? s.alarm.reason : null;
    if (last) return { text: `The alarm fired because of ${last.label.toLowerCase()}: ${last.reading}. Lifeline alarms when a vital stays beyond your limit for 3 seconds, or on a detected fall, jolt or SOS press.` };
    const lastLog = s.log.find((l) => l.kind === "alarm" || l.kind === "sos" || l.kind === "cancel");
    return { text: lastLog ? `The most recent alert: ${lastLog.text} (${new Date(lastLog.at).toLocaleString()}).` : "There are no recent alerts." };
  }
  if (has(q, "what should i do", "what do i do", "what now", "first aid")) {
    const reason = s.alarm.reason;
    let id = null;
    if (reason?.type === "vital") {
      const r = s.vitals[reason.vital];
      id = r ? guideFor(reason.vital, r, s.thresholds[reason.vital]) : VITAL_META[reason.vital].guide;
    } else if (reason?.type === "fall" || reason?.type === "jolt") id = "fall";
    if (id) return guideReply(guideById(id), s, prefix);
    return {
      text: `${prefix}Tell me what is happening — for example "chest pain", "choking", "low sugar" or "not breathing" — and I'll guide you step by step. If anyone's life is at risk, call ${n.general} first.`,
      actions: [{ kind: "open-guide", id: "cpr" }, { kind: "open-guide", id: "chest-pain" }, { kind: "open-guide", id: "low-sugar" }, ...callAll]
    };
  }
  if (has(q, "summar", "today", "this week")) {
    const day = Date.now() - 864e5;
    const today = s.log.filter((l) => l.at > day);
    const alarms = today.filter((l) => l.kind === "alarm" || l.kind === "sos").length;
    const cancels = today.filter((l) => l.kind === "cancel").length;
    return {
      text: today.length ? `In the last 24 hours: ${today.length} events, ${alarms} alarm${alarms === 1 ? "" : "s"}, ${cancels} cancelled. Latest: ${today[0].text}.` : "Nothing logged in the last 24 hours."
    };
  }
  if (has(q, "connect", "watch", "bluetooth", "pair", "device", "band")) {
    return {
      text: 'Lifeline connects to devices using standard Bluetooth health profiles: heart-rate straps, watches in heart-rate broadcast mode, pulse oximeters, BP cuffs and glucometers. Use Chrome or Edge on Android or desktop; iPhone Safari does not support Web Bluetooth (the native app will). On Garmin, turn on "Broadcast Heart Rate". On Polar and Coros, enable HR sharing. Apple Watch, Galaxy Watch and Fitbit need their cloud or native connection. Device pairing is on the way in the next release.'
    };
  }
  const g = matchGuide(q);
  if (g) return guideReply(g, s, prefix);
  if (has(q, "thank")) return { text: "You're welcome. I'm here if you need me." };
  if (has(q, "hello", "hi ", "hey") || q === "hi") {
    return { text: `Hi, I'm the Lifeline assistant. Ask me for first-aid steps, your status, your location, or say "SOS".` };
  }
  return {
    text: `I can guide you through first aid for: ${GUIDES.slice(0, 8).map((x) => x.title.split(" · ")[0].toLowerCase()).join(", ")} and more. I'm not a doctor and can't diagnose. If something feels seriously wrong, call ${n.general}.`,
    actions: callAll
  };
}
function guideReply(g, s, prefix = "") {
  const n = emergencyNumbers(s);
  const callLine = g.call === "always" ? `Call ${n.general} now. ` : "";
  return {
    text: `${prefix}${callLine}${g.intro}`,
    guide: g,
    actions: [{ kind: "call", number: n.general, label: `Call ${n.general}` }]
  };
}
let seq = 0;
function Assistant() {
  const open = useApp((s) => s.assistantOpen);
  const alarmPhase = useApp((s) => s.alarm.phase);
  const alarmStart = useApp((s) => s.alarm.startedAt);
  const [msgs, setMsgs] = useState([
    {
      id: seq++,
      role: "assistant",
      text: `Hi, I'm your Lifeline assistant. Ask for first-aid steps ("someone is choking"), your status or location, or say "SOS". Tap the mic to talk.`
    }
  ]);
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [active, setActive] = useState(null);
  const speech = useSpeech();
  const scroller = useRef(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);
  const push = useCallback(
    (reply, speakIt) => {
      setMsgs((m) => [...m, { ...reply, id: seq++, role: "assistant" }]);
      if (reply.guide) setActive({ guide: reply.guide, step: 0 });
      if (speakIt) speech.speak(reply.text);
    },
    [speech]
  );
  const ask = useCallback(
    (text, viaVoice = false) => {
      if (!text.trim()) return;
      setMsgs((m) => [...m, { id: seq++, role: "user", text }]);
      setInput("");
      push(respond(text, appStore.state), voiceOn || viaVoice);
    },
    [push, voiceOn]
  );
  useEffect(() => {
    if (alarmPhase !== "dispatched" || !alarmStart) return;
    setVoiceOn(true);
    push(respond("what should I do", appStore.state), true);
  }, [alarmPhase, alarmStart]);
  const runAction = (a) => {
    if (a.kind === "call") window.location.href = telHref(a.number);
    else if (a.kind === "start-sos") raiseAlarm({ type: "sos", label: "SOS from assistant", reading: "requested by voice or chat" }, { demo: false, immediate: true });
    else if (a.kind === "open-guide") {
      const g = guideById(a.id);
      if (!g) return;
      setMsgs((m) => [...m, { id: seq++, role: "user", text: g.title }]);
      push(guideReply(g, appStore.state), voiceOn);
    } else if (a.kind === "start-location") {
      startTracking();
      push({ text: "Turning on location tracking. Your browser may ask for permission." }, false);
    } else if (a.kind === "share-location") {
      const f = appStore.state.location.fix;
      if (f) void navigator.share?.({ title: "My location", url: mapsLink(f) }).catch(() => {
      });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    !open && alarmPhase !== "countdown" && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => set({ assistantOpen: true }),
        className: "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-slate-900 py-3 pl-4 pr-5 font-semibold text-white shadow-2xl shadow-slate-900/30 transition hover:-translate-y-0.5",
        children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "size-5 text-rose-400" }),
          " First-aid assistant"
        ]
      }
    ),
    open && alarmPhase !== "countdown" && /* @__PURE__ */ jsxs(
      "section",
      {
        "aria-label": "Lifeline assistant",
        className: `fixed inset-x-2 bottom-2 z-50 flex flex-col ${alarmPhase !== "idle" ? "max-h-[46dvh] sm:max-h-[min(720px,calc(100dvh-1rem))]" : "max-h-[min(720px,calc(100dvh-1rem))]"} overflow-hidden rounded-3xl border bg-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[420px] ${alarmPhase !== "idle" ? "border-rose-300 ring-4 ring-rose-500/30" : "border-slate-200"}`,
        children: [
          /* @__PURE__ */ jsxs("header", { className: `flex items-center gap-2 px-4 py-3 ${alarmPhase !== "idle" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"}`, children: [
            /* @__PURE__ */ jsx(HeartPulse, { className: "size-5" }),
            /* @__PURE__ */ jsxs("div", { className: "mr-auto leading-tight", children: [
              /* @__PURE__ */ jsx("p", { className: "font-display font-bold", children: alarmPhase !== "idle" ? "Emergency guidance" : "Lifeline assistant" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] opacity-75", children: "Works offline · voice guided" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => voiceOn ? (speech.stopSpeaking(), setVoiceOn(false)) : setVoiceOn(true),
                disabled: !speech.supported.tts,
                title: voiceOn ? "Voice replies on" : "Voice replies off",
                className: "grid size-9 place-items-center rounded-full hover:bg-white/15 disabled:opacity-40",
                children: voiceOn ? /* @__PURE__ */ jsx(Volume2, { className: "size-4.5" }) : /* @__PURE__ */ jsx(VolumeX, { className: "size-4.5" })
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => set({ assistantOpen: false }), className: "grid size-9 place-items-center rounded-full hover:bg-white/15", "aria-label": "Close assistant", children: /* @__PURE__ */ jsx(X, { className: "size-4.5" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { ref: scroller, className: "flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4", children: msgs.map(
            (m) => m.role === "user" ? /* @__PURE__ */ jsx("p", { className: "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-slate-900 px-3.5 py-2 text-sm text-white", children: m.text }, m.id) : /* @__PURE__ */ jsxs("div", { className: "max-w-[92%] space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "w-fit whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200", children: m.text }),
              m.guide && active?.guide.id === m.guide.id && m.id === lastGuideMsg(msgs) && /* @__PURE__ */ jsx(GuidePlayer, { guide: active.guide, step: active.step, setStep: (step) => setActive({ guide: active.guide, step }), speech }),
              m.actions && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: m.actions.map((a, i) => /* @__PURE__ */ jsx(ActionChip, { a, onRun: runAction }, i)) })
            ] }, m.id)
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-200 bg-white px-3 pb-3 pt-2", children: [
            /* @__PURE__ */ jsx("div", { className: "-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1", children: QUICK_CHIPS.map((c) => /* @__PURE__ */ jsx("button", { onClick: () => ask(c), className: "shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-400", children: c }, c)) }),
            /* @__PURE__ */ jsxs(
              "form",
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  ask(input);
                },
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      disabled: !speech.supported.stt,
                      onClick: () => speech.listening ? speech.stopListening() : speech.listen((t) => ask(t, true)),
                      title: speech.supported.stt ? "Speak" : "Voice input is not supported in this browser",
                      className: `grid size-11 shrink-0 place-items-center rounded-full transition disabled:opacity-40 ${speech.listening ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
                      children: speech.listening ? /* @__PURE__ */ jsx(MicOff, { className: "size-5" }) : /* @__PURE__ */ jsx(Mic, { className: "size-5" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: speech.listening ? speech.interim || "Listening…" : input,
                      onChange: (e) => setInput(e.target.value),
                      placeholder: 'Try "someone is choking"',
                      className: "h-11 min-w-0 flex-1 rounded-full bg-slate-100 px-4 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                    }
                  ),
                  /* @__PURE__ */ jsx("button", { type: "submit", className: "grid size-11 shrink-0 place-items-center rounded-full bg-slate-900 text-white", "aria-label": "Send", children: /* @__PURE__ */ jsx(Send, { className: "size-4.5" }) })
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[10.5px] leading-snug text-slate-500", children: "Not a doctor or a medical device. In an emergency, always call your local emergency number." })
          ] })
        ]
      }
    )
  ] });
}
const lastGuideMsg = (msgs) => [...msgs].reverse().find((m) => m.guide)?.id;
function ActionChip({ a, onRun }) {
  const base = "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition";
  if (a.kind === "call") return /* @__PURE__ */ jsxs("button", { onClick: () => onRun(a), className: `${base} bg-rose-600 text-white hover:bg-rose-700`, children: [
    /* @__PURE__ */ jsx(Phone, { className: "size-3.5" }),
    a.label
  ] });
  if (a.kind === "start-sos") return /* @__PURE__ */ jsxs("button", { onClick: () => onRun(a), className: `${base} bg-rose-100 text-rose-800 ring-1 ring-rose-300 hover:bg-rose-200`, children: [
    /* @__PURE__ */ jsx(Siren, { className: "size-3.5" }),
    "Yes, start SOS"
  ] });
  if (a.kind === "open-guide") return /* @__PURE__ */ jsx("button", { onClick: () => onRun(a), className: `${base} bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-slate-500`, children: guideById(a.id)?.title });
  if (a.kind === "start-location") return /* @__PURE__ */ jsxs("button", { onClick: () => onRun(a), className: `${base} bg-sky-100 text-sky-800`, children: [
    /* @__PURE__ */ jsx(MapPin, { className: "size-3.5" }),
    "Turn on location"
  ] });
  return /* @__PURE__ */ jsxs("button", { onClick: () => onRun(a), className: `${base} bg-sky-100 text-sky-800`, children: [
    /* @__PURE__ */ jsx(Share2, { className: "size-3.5" }),
    "Share location"
  ] });
}
const COMMANDS = { next: /\b(next|done|okay|ok|continue)\b/, back: /\b(back|previous)\b/, stop: /\b(stop|pause|quiet)\b/ };
function GuidePlayer({ guide, step, setStep, speech }) {
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(false);
  const stepRef = useRef(step);
  stepRef.current = step;
  const gen = useRef(0);
  const playingRef = useRef(false);
  playingRef.current = playing;
  const total = guide.steps.length;
  const say = useCallback(
    (i) => {
      setStep(i);
      const my = ++gen.current;
      const text = `Step ${i + 1} of ${total}. ${guide.steps[i]}`;
      speech.speak(text, () => {
        if (my !== gen.current || !playingRef.current || !speech.supported.stt) return;
        speech.listen((heard) => {
          const h2 = heard.toLowerCase();
          if (COMMANDS.stop.test(h2)) return setPlaying(false);
          if (stepRef.current >= total - 1 && COMMANDS.next.test(h2)) return setPlaying(false);
          if (COMMANDS.back.test(h2)) return say(Math.max(0, stepRef.current - 1));
          if (COMMANDS.next.test(h2) && stepRef.current < total - 1) return say(stepRef.current + 1);
          say(stepRef.current);
        });
      });
    },
    [guide, setStep, speech, total]
  );
  useEffect(() => {
    if (!beat) return;
    const id = setInterval(tick, 6e4 / 110);
    return () => clearInterval(id);
  }, [beat]);
  useEffect(() => () => {
    speech.stopSpeaking();
    speech.stopListening();
  }, [guide.id]);
  const go = (i) => playing ? say(i) : setStep(i);
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-slate-100 px-3.5 py-2.5", children: [
      /* @__PURE__ */ jsx("p", { className: "mr-auto font-display text-sm font-bold", children: guide.title }),
      guide.call === "always" && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700", children: "Call now" })
    ] }),
    /* @__PURE__ */ jsx("ol", { className: "space-y-1 px-2 py-2", children: guide.steps.map((s, i) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => go(i),
        className: `flex w-full gap-2.5 rounded-xl px-2 py-1.5 text-left text-[13px] leading-snug transition ${i === step ? "bg-rose-50 text-slate-900 ring-1 ring-rose-200" : i < step ? "text-slate-400" : "text-slate-600 hover:bg-slate-50"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: `mt-px grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i === step ? "bg-rose-600 text-white" : "bg-slate-100"}`, children: i + 1 }),
          s
        ]
      }
    ) }, i)) }),
    guide.avoid && /* @__PURE__ */ jsx("div", { className: "mx-3 mb-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900", children: guide.avoid.map((a) => /* @__PURE__ */ jsxs("p", { children: [
      "⚠ ",
      a
    ] }, a)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 border-t border-slate-100 bg-slate-50 px-2.5 py-2", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => go(Math.max(0, step - 1)), className: "grid size-9 place-items-center rounded-full hover:bg-slate-200", "aria-label": "Previous step", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4.5" }) }),
      playing ? /* @__PURE__ */ jsxs("button", { onClick: () => {
        setPlaying(false);
        playingRef.current = false;
        gen.current++;
        speech.stopSpeaking();
        speech.stopListening();
      }, className: "flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white", children: [
        /* @__PURE__ */ jsx(Square, { className: "size-3.5" }),
        " ",
        speech.listening ? 'Listening… say "next"' : "Stop"
      ] }) : /* @__PURE__ */ jsxs("button", { disabled: !speech.supported.tts, onClick: () => {
        setPlaying(true);
        playingRef.current = true;
        say(step);
      }, className: "flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-40", children: [
        /* @__PURE__ */ jsx(Play, { className: "size-3.5" }),
        " Read aloud"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => go(step), className: "grid size-9 place-items-center rounded-full hover:bg-slate-200", "aria-label": "Repeat step", children: /* @__PURE__ */ jsx(RotateCcw, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("button", { onClick: () => go(Math.min(total - 1, step + 1)), className: "grid size-9 place-items-center rounded-full hover:bg-slate-200", "aria-label": "Next step", children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4.5" }) }),
      guide.metronome && /* @__PURE__ */ jsx("button", { onClick: () => setBeat((b) => !b), className: `ml-auto rounded-full px-3 py-2 text-xs font-bold ${beat ? "bg-rose-600 text-white animate-pulse" : "bg-white ring-1 ring-slate-300"}`, children: beat ? "Beat on · 110/min" : "CPR beat" })
    ] })
  ] });
}
const drift = (cur, target, noise) => {
  const base = cur ?? target;
  return base + (target - base) * 0.35 + (Math.random() - 0.5) * noise;
};
function VitalsEngine() {
  useEffect(() => {
    loadSettings();
    let sustained = createSustainTracker();
    const statuses = {};
    let tickNo = 0;
    const id = setInterval(() => {
      const s = appStore.state;
      if (!s.demoMode) {
        if (Object.keys(s.vitals).length) set({ vitals: {}, history: { bp: [], glucose: [], hr: [], spo2: [] } });
        return;
      }
      tickNo++;
      if (s.scenario === "fall") {
        raiseAlarm({ type: "fall", label: "Fall detected", reading: "impact then no movement" }, { demo: true });
        set({ scenario: "stable" });
        return;
      }
      const t = SCENARIO_TARGETS[s.scenario] ?? SCENARIO_TARGETS.stable;
      const now2 = Date.now();
      const mk = (value, unit, value2) => ({
        value,
        value2,
        unit,
        source: DEMO_DEVICE.name,
        measuredAt: now2,
        receivedAt: now2,
        quality: "good"
      });
      const v = { ...s.vitals };
      v.hr = mk(Math.round(drift(v.hr?.value, t.hr, 3)), "bpm");
      v.spo2 = mk(Math.min(100, Math.round(drift(v.spo2?.value, t.spo2, 1))), "%");
      if (!v.bp || tickNo % 5 === 0 || s.scenario !== "stable") {
        v.bp = mk(Math.round(drift(v.bp?.value, t.sys, 4)), "mmHg", Math.round(drift(v.bp?.value2, t.dia, 3)));
      }
      if (!v.glucose || tickNo % 5 === 0 || s.scenario !== "stable") {
        v.glucose = mk(Math.round(drift(v.glucose?.value, t.glucose, 4)), "mg/dL");
      }
      const history = { ...s.history };
      for (const k of Object.keys(history)) history[k] = [...history[k], v[k].value].slice(-60);
      set({ vitals: v, history });
      for (const k of Object.keys(VITAL_META)) statuses[k] = classify(k, v[k], s.thresholds[k], statuses[k]);
      if (s.alarm.phase !== "idle") {
        sustained = createSustainTracker();
        return;
      }
      const fired = sustained(statuses);
      if (fired.length) {
        const k = fired[0];
        raiseAlarm(
          { type: "vital", vital: k, label: `${VITAL_META[k].label} critical`, reading: `${formatReading(k, v[k])} ${v[k].unit}` },
          { demo: true }
        );
      }
    }, 1e3);
    return () => clearInterval(id);
  }, []);
  return null;
}
const siteName = "Lifeline — automatic emergency response";
const siteDescription = "Lifeline watches your vitals from real Bluetooth health devices, detects emergencies and falls, shares your live location and helps you reach police, ambulance and family — with a voice first-aid assistant.";
const Route$3 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0f172a" },
      { title: siteName },
      { name: "description", content: siteDescription },
      { property: "og:title", content: siteName },
      { property: "og:description", content: siteDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "grain min-h-screen", children: [
      /* @__PURE__ */ jsx(VitalsEngine, {}),
      /* @__PURE__ */ jsx(Nav, {}),
      children,
      /* @__PURE__ */ jsx(Assistant, {}),
      /* @__PURE__ */ jsx(AlarmOverlay, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$2 = () => import("./index-Mt0SIeaq.js");
const Route$2 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./contacts-C_WJn6Z8.js");
const Route$1 = createFileRoute("/contacts")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Contacts & alerts · Lifeline"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./monitor-BTNhAryJ.js");
const Route = createFileRoute("/monitor")({
  ssr: false,
  head: () => ({
    meta: [{
      title: "Monitor · Lifeline"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const ContactsRoute = Route$1.update({
  id: "/contacts",
  path: "/contacts",
  getParentRoute: () => Route$3
});
const MonitorRoute = Route.update({
  id: "/monitor",
  path: "/monitor",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  ContactsRoute,
  MonitorRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  DEFAULT_THRESHOLDS as D,
  EMERGENCY_BY_COUNTRY as E,
  PATIENT as P,
  RELATIONSHIPS as R,
  SCENARIOS as S,
  VITAL_META as V,
  smsHref as a,
  buildSosMessage as b,
  isStale as c,
  classify as d,
  emergencyNumbers as e,
  formatReading as f,
  stopTracking as g,
  startTracking as h,
  isValidPhone as i,
  addLog as j,
  DEMO_DEVICE as k,
  router as l,
  mapsLink as m,
  raiseAlarm as r,
  set as s,
  telHref as t,
  useApp as u
};

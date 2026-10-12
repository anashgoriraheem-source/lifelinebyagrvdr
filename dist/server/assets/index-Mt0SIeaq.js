import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mic, Sparkles, Gauge, Droplet, Activity, Wind, Move3d, Hand, MapPin, PhoneCall, ShieldCheck, Bluetooth } from "lucide-react";
import { s as set } from "./router-C90MPk4h.js";
import "@tanstack/react-store";
import "react";
const DETECTS = [{
  icon: Gauge,
  title: "Blood pressure",
  body: "Systolic above 180 or below 80, diastolic above 120 — confirmed by a second reading."
}, {
  icon: Droplet,
  title: "Blood sugar",
  body: "Below 54 or above 320 mg/dL from Bluetooth glucometers and CGMs."
}, {
  icon: Activity,
  title: "Heart rate",
  body: "Above 130 or below 40 at rest, sustained for 3 seconds, with HRV when available."
}, {
  icon: Wind,
  title: "Oxygen",
  body: "SpO₂ under 88% from a pulse oximeter, with movement-artefact checks."
}, {
  icon: Move3d,
  title: "Falls & jolts",
  body: "Free-fall, impact, then stillness — plus violent jolts like a crash."
}, {
  icon: Hand,
  title: "Panic button",
  body: "Hold SOS for one second. No countdown. Help is called immediately."
}];
function Landing() {
  return /* @__PURE__ */ jsxs("main", { className: "overflow-hidden", children: [
    /* @__PURE__ */ jsxs("section", { className: "relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20", children: [
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-40 -top-24 size-[36rem] rounded-full bg-rose-200/50 blur-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "animate-fade-up inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200", children: [
            /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-emerald-500" }),
            " Real Bluetooth health devices · voice first-aid"
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "animate-fade-up mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight [animation-delay:80ms] sm:text-7xl", children: [
            "When your body says ",
            /* @__PURE__ */ jsx("span", { className: "text-rose-600", children: "danger" }),
            ", Lifeline calls for help."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "animate-fade-up mt-6 max-w-xl text-lg text-slate-600 [animation-delay:160ms]", children: "It watches your vitals, spots falls, and shares your live location with police, ambulance and family — then talks you through first aid, step by step, until help arrives." }),
          /* @__PURE__ */ jsxs("div", { className: "animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:240ms]", children: [
            /* @__PURE__ */ jsxs(Link, { to: "/monitor", className: "group flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 font-bold text-white shadow-lg shadow-slate-900/20", children: [
              "Open the monitor ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "size-4 transition group-hover:translate-x-0.5" })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => set({
              assistantOpen: true
            }), className: "flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-slate-900 ring-1 ring-slate-300 hover:ring-slate-500", children: [
              /* @__PURE__ */ jsx(Mic, { className: "size-4 text-rose-600" }),
              " Ask the first-aid assistant"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "animate-fade-up relative mx-auto w-full max-w-sm [animation-delay:200ms]", children: [
          /* @__PURE__ */ jsx("div", { className: "rotate-2 rounded-[2.5rem] bg-slate-900 p-3 shadow-2xl shadow-slate-900/30", children: /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] bg-white p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Ravi · Lifeline Band" }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700", children: [
                /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-emerald-500" }),
                "Guarding"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-5 text-xs uppercase tracking-widest text-slate-400", children: "Heart rate" }),
            /* @__PURE__ */ jsxs("p", { className: "font-mono text-6xl font-bold tabular", children: [
              "74",
              /* @__PURE__ */ jsx("span", { className: "ml-1 text-base text-slate-400", children: "bpm" })
            ] }),
            /* @__PURE__ */ jsx("svg", { viewBox: "0 0 300 60", className: "mt-2 h-14 w-full text-rose-500", children: /* @__PURE__ */ jsx("path", { className: "ecg-path", d: "M0 30 H70 L80 30 L90 10 L100 52 L110 22 L118 30 H180 L190 30 L198 8 L208 54 L218 24 L226 30 H300", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinejoin: "round", strokeLinecap: "round" }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-3 gap-2 text-center", children: [["BP", "124/80"], ["Sugar", "112"], ["SpO₂", "97%"]].map(([l, v]) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-slate-50 py-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400", children: l }),
              /* @__PURE__ */ jsx("p", { className: "font-mono text-sm font-bold", children: v })
            ] }, l)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center gap-3 rounded-2xl bg-rose-600 p-3 text-white", children: [
              /* @__PURE__ */ jsx("span", { className: "grid size-10 place-items-center rounded-full bg-white/20 font-display font-extrabold", children: "SOS" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs leading-tight", children: [
                /* @__PURE__ */ jsx("b", { className: "block text-sm", children: "Hold for help" }),
                "Calls 112 · texts family your location"
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-6 -left-8 -rotate-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5 text-xs font-bold", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5 text-rose-600" }),
              " Assistant"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-[13rem] text-xs text-slate-600", children: '"Help is being contacted. Sit down. Take fast-acting sugar if you can swallow."' })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "border-y border-slate-200 bg-white", children: /* @__PURE__ */ jsx("div", { className: "mx-auto grid max-w-6xl gap-px bg-slate-200 sm:grid-cols-3", children: [["01", "Watch", "Reads every second from your band, strap, oximeter, BP cuff or glucometer — and your phone's motion sensors."], ["02", "Confirm", "A 15-second alarm you can cancel with a deliberate hold. Sustained-value rules cut false alarms."], ["03", "Respond", "One tap calls emergency services. Your contacts get your reading, medical details and a live map link."]].map(([n, t, d]) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "font-mono text-sm text-rose-600", children: n }),
      /* @__PURE__ */ jsx("h3", { className: "mt-2 font-display text-2xl font-bold", children: t }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-slate-600", children: d })
    ] }, n)) }) }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-6xl px-4 py-20", children: [
      /* @__PURE__ */ jsx("h2", { className: "max-w-xl font-display text-4xl font-extrabold tracking-tight", children: "Six ways Lifeline knows something is wrong." }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: DETECTS.map((d, i) => /* @__PURE__ */ jsxs("article", { className: `rounded-3xl p-6 ring-1 transition hover:-translate-y-1 ${i === 5 ? "bg-rose-600 text-white ring-rose-600" : "bg-white ring-slate-200"}`, children: [
        /* @__PURE__ */ jsx(d.icon, { className: `size-6 ${i === 5 ? "text-white" : "text-rose-600"}` }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 font-display text-xl font-bold", children: d.title }),
        /* @__PURE__ */ jsx("p", { className: `mt-1.5 text-sm ${i === 5 ? "text-rose-50" : "text-slate-600"}`, children: d.body })
      ] }, d.title)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "bg-slate-950 text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-4xl font-extrabold tracking-tight", children: "Help that knows where you are." }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-slate-400", children: "The moment an alarm starts, Lifeline begins tracking your GPS position and builds the message responders need." })
      ] }),
      [{
        icon: Sparkles,
        t: "Voice first-aid assistant",
        d: 'Talk or type. It reads CPR, choking, stroke, low sugar, bleeding and 13 more guides aloud, one step at a time, and listens for "next". Works offline.'
      }, {
        icon: MapPin,
        t: "Live location tracking",
        d: "High-accuracy GPS with a live map, shareable link and accuracy radius — attached to every SOS message."
      }, {
        icon: PhoneCall,
        t: "SOS to police & ambulance",
        d: "One-tap calls to 112, 100 and 108, an emergency SMS to 112, and messages to every contact in your priority order."
      }, {
        icon: ShieldCheck,
        t: "Honest data",
        d: 'Every reading shows its device and age. No data is never shown as "normal". Demo mode is always labelled.'
      }].map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-white/5 p-6 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsx(f.icon, { className: "size-6 text-rose-400" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 font-display text-xl font-bold", children: f.t }),
        /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-slate-400", children: f.d })
      ] }, f.t))
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "mx-auto max-w-6xl px-4 py-20", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-8 rounded-[2rem] bg-white p-8 ring-1 ring-slate-200 lg:grid-cols-[1fr_1.3fr] lg:p-12", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Bluetooth, { className: "size-7 text-sky-600" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-3 font-display text-3xl font-extrabold", children: "What it works with" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-slate-600", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { className: "text-slate-900", children: "Works with:" }),
          " any Bluetooth heart rate device (including watches in heart-rate broadcast mode), Bluetooth pulse oximeters, BP monitors and glucometers using standard profiles."
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { className: "text-slate-900", children: "Needs a cloud or native connection:" }),
          " Apple Watch, Galaxy Watch, Fitbit and Garmin health data usually need their cloud or native app link."
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { className: "text-slate-900", children: "Browsers:" }),
          " Chrome or Edge on Android and desktop support Web Bluetooth. iPhone Safari does not — the native Lifeline app covers iOS."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-slate-200 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsx("p", { className: "font-display text-lg font-bold text-slate-900", children: "Lifeline" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-3xl", children: "Lifeline supports, but does not replace, medical care or emergency services. It is not a certified medical device and does not diagnose. In an emergency, call your local emergency number (112 in India)." })
    ] }) })
  ] });
}
export {
  Landing as component
};

import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Siren, Shield, Ambulance, Flame, Plus, Phone, MessageSquare, ArrowUp, ArrowDown, Pencil, Trash2, RotateCcw, X } from "lucide-react";
import { u as useApp, E as EMERGENCY_BY_COUNTRY, s as set, t as telHref, a as smsHref, b as buildSosMessage, V as VITAL_META, e as emergencyNumbers, i as isValidPhone, R as RELATIONSHIPS, D as DEFAULT_THRESHOLDS } from "./router-C90MPk4h.js";
import "@tanstack/react-router";
import "@tanstack/react-store";
const card = "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6";
function Contacts() {
  const contacts = useApp((s) => s.contacts);
  const country = useApp((s) => s.countryCode);
  const countdown = useApp((s) => s.countdownSeconds);
  const thresholds = useApp((s) => s.thresholds);
  const fix = useApp((s) => s.location.fix);
  const n = useApp(emergencyNumbers);
  const [editing, setEditing] = useState(null);
  const move = (i, d) => set((s) => {
    const c = [...s.contacts];
    const j = i + d;
    if (j < 0 || j >= c.length) return {};
    [c[i], c[j]] = [c[j], c[i]];
    return {
      contacts: c
    };
  });
  const patch = (id, p) => set((s) => ({
    contacts: s.contacts.map((c) => c.id === id ? {
      ...c,
      ...p
    } : c)
  }));
  const smsList = contacts.filter((c) => c.sms);
  return /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-4xl px-4 pb-32 pt-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-extrabold tracking-tight", children: "Contacts & alerts" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-slate-500", children: "Who Lifeline reaches in an emergency, in what order, and when." }),
    /* @__PURE__ */ jsxs("section", { className: `${card} mt-6`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "mr-auto font-display text-xl font-bold", children: "Emergency services" }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-500", children: [
          "Country",
          " ",
          /* @__PURE__ */ jsx("select", { value: country, onChange: (e) => set({
            countryCode: e.target.value
          }), className: "ml-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-900", children: Object.entries(EMERGENCY_BY_COUNTRY).map(([code, v]) => /* @__PURE__ */ jsx("option", { value: code, children: v.country }, code)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [{
        label: "Emergency",
        num: n.general,
        icon: Siren,
        c: "bg-rose-600 text-white"
      }, {
        label: "Police",
        num: n.police,
        icon: Shield,
        c: "bg-slate-100"
      }, {
        label: "Ambulance",
        num: n.ambulance,
        icon: Ambulance,
        c: "bg-slate-100"
      }, {
        label: "Fire",
        num: n.fire,
        icon: Flame,
        c: "bg-slate-100"
      }].map((x) => /* @__PURE__ */ jsxs("a", { href: telHref(x.num), className: `rounded-2xl p-4 transition hover:-translate-y-0.5 ${x.c}`, children: [
        /* @__PURE__ */ jsx(x.icon, { className: "size-5 opacity-80" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-semibold opacity-70", children: x.label }),
        /* @__PURE__ */ jsx("p", { className: "font-mono text-2xl font-bold", children: x.num })
      ] }, x.label)) }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 text-xs leading-relaxed text-slate-500", children: [
        "Lifeline never auto-dials emergency services. During an alert you get a one-tap call button and an SMS to ",
        n.smsNumber,
        " pre-filled with your location and medical details, where your region accepts emergency SMS."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: `${card} mt-5`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "mr-auto", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "Personal contacts" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Top of the list is contacted first." })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setEditing("new"), className: "flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white", children: [
          /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
          " Add"
        ] })
      ] }),
      contacts.length === 0 && /* @__PURE__ */ jsx("div", { className: "mt-5 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500", children: "No contacts yet. Add at least one person who should hear from you in an emergency." }),
      /* @__PURE__ */ jsx("ol", { className: "mt-4 space-y-2", children: contacts.map((c, i) => /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200", children: [
        /* @__PURE__ */ jsx("span", { className: "grid size-7 place-items-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white", children: i + 1 }),
        /* @__PURE__ */ jsxs("div", { className: "mr-auto min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate font-semibold", children: c.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
            c.relationship,
            " · ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: c.phone })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Toggle, { on: c.call, onClick: () => patch(c.id, {
          call: !c.call
        }), icon: /* @__PURE__ */ jsx(Phone, { className: "size-3.5" }), label: "Call" }),
        /* @__PURE__ */ jsx(Toggle, { on: c.sms, onClick: () => patch(c.id, {
          sms: !c.sms
        }), icon: /* @__PURE__ */ jsx(MessageSquare, { className: "size-3.5" }), label: "SMS" }),
        /* @__PURE__ */ jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsx(IconBtn, { label: "Move up", onClick: () => move(i, -1), disabled: i === 0, children: /* @__PURE__ */ jsx(ArrowUp, { className: "size-4" }) }),
          /* @__PURE__ */ jsx(IconBtn, { label: "Move down", onClick: () => move(i, 1), disabled: i === contacts.length - 1, children: /* @__PURE__ */ jsx(ArrowDown, { className: "size-4" }) }),
          /* @__PURE__ */ jsx(IconBtn, { label: "Edit", onClick: () => setEditing(c), children: /* @__PURE__ */ jsx(Pencil, { className: "size-4" }) }),
          /* @__PURE__ */ jsx(IconBtn, { label: "Delete", onClick: () => confirm(`Remove ${c.name}?`) && set((s) => ({
            contacts: s.contacts.filter((x) => x.id !== c.id)
          })), children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
        ] })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900", children: [
        /* @__PURE__ */ jsx("p", { className: "mr-auto", children: "Check your contacts get your messages. The test is clearly labelled and asks for no action." }),
        /* @__PURE__ */ jsx("a", { href: smsList.length ? smsHref(smsList.map((c) => c.phone), buildSosMessage({
          label: "Test alert",
          reading: "checking Lifeline works"
        }, fix, {
          test: true
        })) : void 0, className: `rounded-full bg-sky-700 px-4 py-2 font-bold text-white ${smsList.length ? "" : "pointer-events-none opacity-40"}`, children: "Send a test alert" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: `${card} mt-5`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "Cancel countdown" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-3xl font-bold", children: countdown === 0 ? "Instant" : `${countdown}s` })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: `Time you get to press "I'm OK" before help is called. SOS is always instant.` }),
      /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 60, value: countdown, onChange: (e) => set({
        countdownSeconds: Number(e.target.value)
      }), className: "mt-4 w-full accent-rose-600" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: `${card} mt-5`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "mr-auto font-display text-xl font-bold", children: "Critical limits" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => set({
          thresholds: DEFAULT_THRESHOLDS
        }), className: "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-slate-300 hover:bg-slate-50", children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "size-3.5" }),
          " Reset to defaults"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Talk to your doctor before changing these." }),
      /* @__PURE__ */ jsxs("table", { className: "mt-4 w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs uppercase tracking-wide text-slate-400", children: [
          /* @__PURE__ */ jsx("th", { className: "pb-2 font-semibold", children: "Vital" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 font-semibold", children: "Below" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 font-semibold", children: "Above" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: Object.keys(VITAL_META).map((k) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsxs("td", { className: "py-2.5 pr-2 font-medium", children: [
            VITAL_META[k].label,
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: VITAL_META[k].unit })
          ] }),
          ["below", "above"].map((f) => /* @__PURE__ */ jsxs("td", { className: "py-2.5 pr-2", children: [
            /* @__PURE__ */ jsx("input", { type: "number", value: thresholds[k][f] ?? "", placeholder: "—", onChange: (e) => set((s) => ({
              thresholds: {
                ...s.thresholds,
                [k]: {
                  ...s.thresholds[k],
                  [f]: e.target.value === "" ? null : Number(e.target.value)
                }
              }
            })), className: "w-20 rounded-lg border border-slate-300 px-2 py-1 font-mono" }),
            k === "bp" && f === "above" && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs text-slate-400", children: [
              "sys · dia > ",
              thresholds.bp.above2
            ] })
          ] }, f))
        ] }, k)) })
      ] })
    ] }),
    editing && /* @__PURE__ */ jsx(ContactForm, { initial: editing === "new" ? null : editing, onClose: () => setEditing(null) })
  ] });
}
function Toggle({
  on,
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxs("button", { type: "button", onClick, "aria-pressed": on, className: `flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${on ? "bg-emerald-600 text-white" : "bg-white text-slate-400 ring-1 ring-slate-300"}`, children: [
    icon,
    label
  ] });
}
function IconBtn({
  children,
  label,
  ...rest
}) {
  return /* @__PURE__ */ jsx("button", { type: "button", "aria-label": label, title: label, ...rest, className: "grid size-8 place-items-center rounded-full text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30", children });
}
function ContactForm({
  initial,
  onClose
}) {
  const [f, setF] = useState(initial ?? {
    id: `c${Date.now()}`,
    name: "",
    relationship: "Daughter",
    phone: "+91 ",
    call: true,
    sms: true
  });
  const [touched, setTouched] = useState(false);
  const phoneOk = isValidPhone(f.phone);
  const nameOk = f.name.trim().length > 1;
  const save = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!phoneOk || !nameOk) return;
    set((s) => ({
      contacts: initial ? s.contacts.map((c) => c.id === f.id ? f : c) : [...s.contacts, f]
    }));
    onClose();
  };
  const input = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-300";
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 grid place-items-end bg-slate-900/40 p-2 backdrop-blur-sm sm:place-items-center", onClick: onClose, children: /* @__PURE__ */ jsxs("form", { onSubmit: save, onClick: (e) => e.stopPropagation(), className: "w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "mr-auto font-display text-xl font-bold", children: initial ? "Edit contact" : "New contact" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, "aria-label": "Close", className: "grid size-8 place-items-center rounded-full hover:bg-slate-100", children: /* @__PURE__ */ jsx(X, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "mt-4 block text-sm font-medium", children: [
      "Name",
      /* @__PURE__ */ jsx("input", { className: input, value: f.name, onChange: (e) => setF({
        ...f,
        name: e.target.value
      }), autoFocus: true }),
      touched && !nameOk && /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-600", children: "Enter a name." })
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "mt-3 block text-sm font-medium", children: [
      "Relationship",
      /* @__PURE__ */ jsx("select", { className: input, value: f.relationship, onChange: (e) => setF({
        ...f,
        relationship: e.target.value
      }), children: RELATIONSHIPS.map((r) => /* @__PURE__ */ jsx("option", { children: r }, r)) })
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "mt-3 block text-sm font-medium", children: [
      "Phone (with country code)",
      /* @__PURE__ */ jsx("input", { className: `${input} font-mono`, inputMode: "tel", value: f.phone, onChange: (e) => setF({
        ...f,
        phone: e.target.value
      }) }),
      touched && !phoneOk && /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-600", children: "Enter a valid number, e.g. +91 98765 43210." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2", children: [
      /* @__PURE__ */ jsx(Toggle, { on: f.call, onClick: () => setF({
        ...f,
        call: !f.call
      }), icon: /* @__PURE__ */ jsx(Phone, { className: "size-3.5" }), label: "Call" }),
      /* @__PURE__ */ jsx(Toggle, { on: f.sms, onClick: () => setF({
        ...f,
        sms: !f.sms
      }), icon: /* @__PURE__ */ jsx(MessageSquare, { className: "size-3.5" }), label: "SMS" })
    ] }),
    /* @__PURE__ */ jsx("button", { className: "mt-6 w-full rounded-2xl bg-slate-900 py-3 font-bold text-white", children: "Save contact" })
  ] }) });
}
export {
  Contacts as component
};

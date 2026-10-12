import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, ArrowRight, Bluetooth, Droplet, Gauge, Hand, MapPin, Mic, Move3d, PhoneCall, ShieldCheck, Sparkles, Wind } from 'lucide-react'
import { set } from '@/lib/store'

export const Route = createFileRoute('/')({
  component: Landing,
})

const DETECTS = [
  { icon: Gauge, title: 'Blood pressure', body: 'Standard Bluetooth blood-pressure measurement profile. Measurements are manual and may be intermittent.' },
  { icon: Droplet, title: 'Blood sugar', body: 'Standard Bluetooth glucose measurement profile. No CGM or manufacturer cloud integration is configured.' },
  { icon: Activity, title: 'Heart rate', body: 'Standard Bluetooth heart-rate service, when the device exposes it to this browser.' },
  { icon: Wind, title: 'Oxygen', body: 'Standard Bluetooth pulse-oximeter profile, when available on the selected device.' },
  { icon: Move3d, title: 'Phone motion', body: 'Motion detection can run while the monitor is open and the browser provides sensor access.' },
  { icon: Hand, title: 'Manual SOS', body: 'Choose SOS intentionally. Lifeline opens call or message actions; it does not dispatch them automatically.' },
]

function Landing() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20">
        <div className="pointer-events-none absolute -right-40 -top-24 size-[36rem] rounded-full bg-rose-200/50 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
              <span className="size-1.5 rounded-full bg-amber-500" /> Early access · local device storage · integrations vary
            </p>
            <h1 className="animate-fade-up mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight [animation-delay:80ms] sm:text-7xl">
              Keep emergency options and first-aid guidance close.
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-lg text-slate-600 [animation-delay:160ms]">
              Lifeline can read supported Bluetooth health measurements, show your location when permitted, and prepare a call or message for you to send. It does not monitor in the background or contact anyone automatically.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link to="/monitor" className="group flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 font-bold text-white shadow-lg shadow-slate-900/20">
                Open the monitor <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              <button onClick={() => set({ assistantOpen: true })} className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-slate-900 ring-1 ring-slate-300 hover:ring-slate-500">
                <Mic className="size-4 text-rose-600" /> Ask the first-aid assistant
              </button>
            </div>
          </div>

          {/* Illustrative sample only; these values are not readings. */}
          <div className="animate-fade-up relative mx-auto w-full max-w-sm [animation-delay:200ms]">
            <div className="rotate-2 rounded-[2.5rem] bg-slate-900 p-3 shadow-2xl shadow-slate-900/30">
              <div className="rounded-[2rem] bg-white p-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Illustration · sample data</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-900">Not live</span>
                </div>
                <p className="mt-5 text-xs uppercase tracking-widest text-slate-400">Heart rate</p>
                <p className="font-mono text-6xl font-bold tabular">74<span className="ml-1 text-base text-slate-400">bpm</span></p>
                <svg viewBox="0 0 300 60" className="mt-2 h-14 w-full text-rose-500">
                  <path className="ecg-path" d="M0 30 H70 L80 30 L90 10 L100 52 L110 22 L118 30 H180 L190 30 L198 8 L208 54 L218 24 L226 30 H300" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[['BP', '124/80'], ['Sugar', '112'], ['SpO₂', '97%']].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-slate-50 py-2"><p className="text-[10px] text-slate-400">{l}</p><p className="font-mono text-sm font-bold">{v}</p></div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-rose-600 p-3 text-white">
                  <span className="grid size-10 place-items-center rounded-full bg-white/20 font-display font-extrabold">SOS</span>
              <span className="text-xs leading-tight"><b className="block text-sm">SOS preview</b>Calls and messages require your action</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-8 -rotate-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
              <p className="flex items-center gap-1.5 text-xs font-bold"><Sparkles className="size-3.5 text-rose-600" /> Assistant</p>
              <p className="mt-1 max-w-[13rem] text-xs text-slate-600">Example guidance · not personalized medical advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-px bg-slate-200 sm:grid-cols-3">
          {[
            ['01', 'Connect', 'Pair a nearby device that exposes a supported Bluetooth health profile in your browser.'],
            ['02', 'Review', 'Readings show their device source and timestamp. Missing measurements remain unavailable.'],
            ['03', 'Choose', 'Manual SOS presents call and prepared-message options. You decide whether to call or send.'],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-white p-8">
              <p className="font-mono text-sm text-rose-600">{n}</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{t}</h3>
              <p className="mt-2 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detections */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="max-w-xl font-display text-4xl font-extrabold tracking-tight">Supported inputs and alert controls.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DETECTS.map((d, i) => (
            <article key={d.title} className={`rounded-3xl p-6 ring-1 transition hover:-translate-y-1 ${i === 5 ? 'bg-rose-600 text-white ring-rose-600' : 'bg-white ring-slate-200'}`}>
              <d.icon className={`size-6 ${i === 5 ? 'text-white' : 'text-rose-600'}`} />
              <h3 className="mt-4 font-display text-xl font-bold">{d.title}</h3>
              <p className={`mt-1.5 text-sm ${i === 5 ? 'text-rose-50' : 'text-slate-600'}`}>{d.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Emergency response */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">Help that knows where you are.</h2>
            <p className="mt-4 text-slate-400">Location is available only with browser permission while the app is open. SOS does not contact responders automatically.</p>
          </div>
          {[
            { icon: Sparkles, t: 'Voice first-aid assistant', d: 'Talk or type. It reads CPR, choking, stroke, low sugar, bleeding and 13 more guides aloud, one step at a time, and listens for "next". Works offline.' },
            { icon: MapPin, t: 'Permitted location', d: 'When location access is granted, the current fix can be included in a message you choose to share.' },
            { icon: PhoneCall, t: 'Manual SOS', d: 'Call links open your phone dialer. Prepared messages open the messaging app and need your confirmation.' },
            { icon: ShieldCheck, t: 'Local-only profile', d: 'Contacts and preferences are stored in this browser. Accounts, cloud backup and provider dispatch are not configured.' },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <f.icon className="size-6 text-rose-400" />
              <h3 className="mt-4 font-display text-xl font-bold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compatibility */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-8 rounded-[2rem] bg-white p-8 ring-1 ring-slate-200 lg:grid-cols-[1fr_1.3fr] lg:p-12">
          <div>
            <Bluetooth className="size-7 text-sky-600" />
            <h2 className="mt-3 font-display text-3xl font-extrabold">What it works with</h2>
          </div>
          <div className="space-y-4 text-slate-600">
            <p><b className="text-slate-900">Standard services implemented:</b> Bluetooth SIG Heart Rate, Blood Pressure, Pulse Oximeter and Glucose measurement profiles. A device must expose a compatible GATT service and notify measurements.</p>
            <p><b className="text-slate-900">Compatibility varies:</b> Many consumer watches expose data only through manufacturer apps or cloud APIs. No Apple, Samsung, Fitbit, Garmin, CGM, or native-app integration is configured.</p>
            <p><b className="text-slate-900">Browser support:</b> Web Bluetooth availability varies by browser and operating system. The app reports when the browser cannot pair; no physical-device verification has been performed.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500">
          <p className="font-display text-lg font-bold text-slate-900">Lifeline</p>
          <p className="mt-2 max-w-3xl">
            Lifeline supports, but does not replace, medical care or emergency services. It is not a certified medical device and does not diagnose. In an emergency, call your local emergency number (112 in India).
          </p>
        </div>
      </footer>
    </main>
  )
}

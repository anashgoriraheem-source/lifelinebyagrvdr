# AGENTS.md

Lifeline: a health-monitoring + emergency-response PWA (TanStack Start, React 19, Tailwind 4, Netlify). **Continue from [PLAN.md](./PLAN.md)** — milestone 1 (product surface) is done; start at milestone 2.

## Layout
```
src/
  routes/            __root.tsx (shell: Nav, VitalsEngine, Assistant, AlarmOverlay), index (landing), monitor, contacts
  components/        Nav, VitalCard, Sparkline, SosButton, AlarmOverlay, Assistant (+GuidePlayer), LocationCard, MotionCard, VitalsEngine
  hooks/             useApp (store selector), useSpeech (TTS + recognition), useMotion (accelerometer + fall detector), useNow
  lib/
    types.ts         Reading (value, unit, source, measuredAt, receivedAt, quality), alarm/contact types
    fixtures.ts      ALL stub data (patient, contacts, emergency numbers, thresholds, seed log, demo scenarios)
    store.ts         global TanStack Store + actions: raiseAlarm / dispatchAlarm / cancelAlarm / addLog; settings → localStorage
    detection.ts     pure: classify (normal/warning/critical + hysteresis), sustain tracker (3 s), staleness
    fallDetection.ts pure: free-fall → impact → stillness state machine + jolt rule (documented in file)
    firstAid.ts      offline guides + keyword matcher
    assistant.ts     on-device intent engine; reads AppState, never invents numbers
    sos.ts           message builder, sms:/tel: hrefs, phone validation
    location.ts      watchPosition tracking into the store
    siren.ts         Web Audio alarm + CPR tick
```

## Conventions & decisions
- Every reading carries provenance; "no data" renders as "—"/"No data", never as normal. Demo mode is always bannered; demo alarms disable real call/SMS buttons.
- Manual SOS is always real (`demo: false`), skips the countdown, and nothing is sent silently — `sms:`/`tel:` hand off to the phone's apps. Emergency services are never auto-dialled.
- The assistant must keep its safety rules (not a doctor, no diagnoses, no dose changes, always point to the emergency number). During an alarm its replies start with "Help is being contacted." (or a demo disclaimer).
- The alarm countdown must never be covered: the assistant hides during `countdown` and opens on `dispatched`.
- `/monitor` and `/contacts` are `ssr: false` (they depend on browser state and APIs).
- Persistence is device-local (`localStorage`) for now; move to Netlify Database in milestone 5. Keep stubs in `fixtures.ts`.

# Lifeline roadmap

Lifeline is a health-monitoring and automatic emergency-response PWA. The product surface is live first so every later milestone plugs into screens people can already use.

## 1. Product surface ✅ (done)
- Landing page, Monitor (`/monitor`), Contacts & alerts (`/contacts`).
- Voice first-aid assistant on every page: 18 offline guides, hands-free step-by-step read-aloud ("next / repeat / back / stop"), CPR metronome, emergency mode.
- Live GPS location tracking with map, accuracy and shareable link.
- SOS: press-and-hold button, full-screen alarm with countdown and hold-to-cancel, one-tap calls to 112/100/108, SMS to 112 and to contacts with location and medical details, test alert.
- Pure detection engine (sustained-critical + hysteresis) and fall/jolt detector.
- Demo mode simulator with scenario chips. Stub data lives in `src/lib/fixtures.ts`.

## 2. Core BLE parsers + tests (in progress)
`packages/core`-style module (`src/core/ble/`): Heart Rate 0x2A37 (8/16-bit, contact bits, RR → RMSSD), PLX 0x2A5F/0x2A5E, BP 0x2A35/0x2A36, Glucose 0x2A18/0x2A34 + RACP, Thermometer 0x2A1C, Battery, Device Info. IEEE-11073 SFLOAT/FLOAT decoders. Vitest with byte fixtures. Tests for detection, fall detector and staleness.

Status: parser primitives and a passing BLE-focused test suite are now in place in `src/core/ble`, with the project built and verified.

## 3. Device adapters + Devices page (`/devices`)
`DeviceAdapter` interface; StandardBleAdapter (Web Bluetooth) with reconnect/backoff, `getDevices()`, multi-device; MotionAdapter extracted from `useMotion`; DemoAdapter extracted from `VitalsEngine`. Pairing UI with Scanning → Receiving → Signal lost states, unsupported-browser detection, watch broadcast guide. BLE mock harness for CI.

## 4. Vitals pipeline
Validity ranges, median + moving-average smoothing, motion-artefact "uncertain" quality, sensor-contact handling, per-vital staleness and "monitoring gap" warnings, measurement reminders for BP/glucose, IndexedDB (Dexie) ring buffer.

## 5. Accounts + data model
Netlify Identity (email OTP), Netlify Database (Postgres + Drizzle): profiles, medical info, contacts, thresholds, readings, incidents, audit log. Move settings from localStorage to the database. Onboarding flow with consent screens (DPDP Act 2023).

## 6. Server-side dispatch
`POST /api/emergency/dispatch` (Netlify Function): Twilio SMS + voice escalation chain with "press 1 to acknowledge", delivery receipts, rate limiting/de-duplication, "I'm OK" on resolution. Status checklist (Sent / Delivered / Acknowledged) in the alarm screen. Emergency services stay one-tap `tel:` (never auto-dialled).

## 7. Live view (`/live/:token`)
Token-protected, expiring page for contacts: latest vitals, live map (SSE/WebSocket location push), medical summary, acknowledge button, access audit log.

## 8. History + Settings
`/history` charts (24 h / 7 d / 30 d), incident timeline, CSV/PDF export. `/settings`: privacy, export/delete, units, English + Hindi, accessibility.

## 9. Claude-powered assistant
Server endpoint via Netlify AI Gateway with streaming, minimised server-assembled context, and confirmation-chip tool calls (`update_threshold`, `set_countdown`, `add_contact`, `toggle_contact_channel`, `start_scan`, `cancel_alarm`, `send_test_alert`). The offline engine stays as fallback. Same hard safety rules.

## 10. PWA + Capacitor, hardening, docs
Service worker + offline shell, Web Push/FCM "monitoring stopped" alerts, Capacitor Android/iOS with `@capacitor-community/bluetooth-le`, Playwright E2E, CSP/zod/rate limits, cloud adapters (Fitbit, Dexcom), and a limitations & legal doc (browser support, iOS, background monitoring, emergency dialling, India DLT SMS registration, medical-device regulation).

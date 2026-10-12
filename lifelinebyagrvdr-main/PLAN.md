# Lifeline roadmap

Lifeline is an early-access health-monitoring and emergency-support PWA. Current device pairing is foreground-only; emergency calls and SMS drafts require the user's action.

## 1. Product surface ✅ (done)
- Landing page, Monitor (`/monitor`), Contacts & alerts (`/contacts`).
- Voice first-aid assistant on every page: 18 offline guides, hands-free step-by-step read-aloud ("next / repeat / back / stop"), CPR metronome, emergency mode.
- Live GPS location tracking with map, accuracy and shareable link.
- SOS: intentional press-and-hold, full-screen alarm and hold-to-cancel, phone call links, and SMS drafts that open in the user's messaging app.
- Pure detection engine (sustained-critical + hysteresis) and fall/jolt detector.
- Demo mode simulator with scenario chips. Stub data lives in `src/lib/fixtures.ts`.

## 2. Core BLE parsers + tests (partial)
Implemented in `src/core/ble/`: Heart Rate 0x2A37, Pulse Oximeter continuous 0x2A5F, Blood Pressure 0x2A35, and Glucose 0x2A18 measurement decoding; IEEE-11073 SFLOAT/FLOAT decoding; malformed and unavailable-value rejection; parser tests.

Not implemented here: RMSSD, PLX spot-check 0x2A5E, BP intermediate 0x2A36, Glucose context/RACP, thermometer, battery, device information, and the broader detection/fall/staleness test suite.

## 3. Device adapters + Devices page (`/devices`) (partial)
Implemented: user-initiated standard Web Bluetooth adapter for the four measurement profiles listed above, service discovery, notification subscription, malformed-value handling, and disconnect status on the Monitor page.

Not implemented: reconnect/backoff, multi-device management, a separate Devices page, battery/device info, vendor SDKs, and automated mock-device integration. Hardware compatibility remains unverified.

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

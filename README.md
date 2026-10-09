# Lifeline

Lifeline is a health-monitoring and emergency-response web app. It watches vitals (blood pressure, blood sugar, heart rate and oxygen), detects falls and jolts with the phone's motion sensors, tracks live GPS location, and helps the wearer reach police, ambulance and family in one tap. A voice first-aid assistant on every page talks people through what to do, step by step.

> Lifeline supports, but does not replace, medical care or emergency services. It is not a certified medical device.

## What works today
- **Landing page** (`/`).
- **Monitor** (`/monitor`): four vital cards with source, age and trend; status headline; the SOS button; a live location card with a map; the fall & jolt sensor; the medical profile; the activity log. Demo mode is clearly labelled and simulates scenarios such as BP spike, sugar crash and fall.
- **Contacts & alerts** (`/contacts`): emergency numbers by country (India's defaults are 112, 100, 108 and 101), personal contacts with Call/SMS toggles and priority order, a test alert, the countdown slider and the critical-limits table.
- **First-aid assistant** (floating button): voice input (Web Speech API) and spoken replies, with 18 offline guides including CPR, choking, chest pain, stroke, low or high sugar, bleeding, burns and falls. It has a hands-free step player and a CPR beat at 110/min. During an alarm it switches to emergency mode.
- **SOS flow**: hold SOS for one second, or let an automatic alarm count down. The app then shows one-tap calls to emergency services and contacts, and prepares SMS messages with the reason, a live map link, blood type, conditions, allergies and medications.

Messages open in the phone's own SMS app for the person to send. Server-side Twilio dispatch is on the roadmap.

## Tech
TanStack Start (React 19, file-based routing), Tailwind CSS 4, TanStack Store, lucide-react, deployed on Netlify. Browser APIs used: Geolocation, DeviceMotion, Web Speech, Web Audio, Vibration, Wake Lock and Web Share.

## Run locally
```bash
pnpm install
netlify dev   # or: pnpm dev
```
Location, motion sensors and (later) Web Bluetooth need a secure context: use `localhost` or HTTPS. Test the motion and SOS features on a phone.

## Roadmap
See [PLAN.md](./PLAN.md): BLE parsers and device pairing, the vitals pipeline, accounts and a database, Twilio dispatch, the secure live-view page, history and settings, a Claude-powered assistant, and PWA/Capacitor builds.

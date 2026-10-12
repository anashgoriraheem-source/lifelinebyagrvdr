# Lifeline

Lifeline is an early-access emergency-support web app. It can read measurements from supported Bluetooth health profiles, provide offline first-aid guidance, and present phone call or message options after an intentional SOS.

> Lifeline supports, but does not replace, medical care or emergency services. It is not a certified medical device.

## Current implementation
- **Landing page** (`/`).
- **Monitor** (`/monitor`): four vital cards with source, age and trend; manual SOS; permission-based location; phone motion sensors; and an activity log. Demo mode is opt-in and clearly labelled.
- **Standard Bluetooth GATT**: user-initiated Web Bluetooth pairing subscribes to Heart Rate, Blood Pressure, Pulse Oximeter continuous-measurement, and Glucose measurement characteristics when a device exposes them. Measurements are parsed from actual payloads; malformed or unsupported data is not fabricated.
- **Contacts & alerts** (`/contacts`): emergency numbers by country (India's defaults are 112, 100, 108 and 101), personal contacts with Call/SMS toggles and priority order, a test alert, the countdown slider and the critical-limits table.
- **First-aid assistant** (floating button): voice input (Web Speech API) and spoken replies, with 18 offline guides including CPR, choking, chest pain, stroke, low or high sugar, bleeding, burns and falls. It has a hands-free step player and a CPR beat at 110/min. During an alarm it switches to emergency mode.
- **SOS flow**: manual SOS displays phone call links and message drafts. Calls require a tap, and drafts require the user to press Send in the messaging app. No SMS provider or automatic emergency-service dispatch is configured.

Contacts, thresholds and preferences are stored only in browser local storage. There are no accounts, shared database, server-side notifications, configured AI provider, background monitoring, or cloud device integrations. See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for the tested scope and deployment limitations. No physical device has been verified.

## Tech
TanStack Start (React 19, file-based routing), Tailwind CSS 4, TanStack Store, lucide-react, deployed on Netlify. Browser APIs used: Geolocation, DeviceMotion, Web Speech, Web Audio, Vibration, Wake Lock and Web Share.

## Run locally
```bash
pnpm install --frozen-lockfile
pnpm dev
```
Location, motion sensors and (later) Web Bluetooth need a secure context: use `localhost` or HTTPS. Test the motion and SOS features on a phone.

## Roadmap
See [PLAN.md](./PLAN.md) and [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for outstanding work.

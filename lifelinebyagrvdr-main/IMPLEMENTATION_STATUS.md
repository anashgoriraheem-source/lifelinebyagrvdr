# Implementation status

## Architecture found

- TanStack Start, React 19, TypeScript, Tailwind CSS 4, TanStack Store, and Netlify's Start adapter.
- Browser pages: landing, monitor, contacts/alerts; a global assistant, alarm overlay, motion sensor, and vitals engine.
- Netlify builds the app with vite build; the server entry is emitted to .netlify/v1/functions.
- Contacts, thresholds, location, sensor readings, and alarms have no server database. Contacts and preferences are stored in browser local storage; readings and incident logs are in memory.
- No identity provider, notification provider, AI service credentials, or manufacturer wearable credentials were present in the project.
- The supplied archive included dist/, which is generated build output and not evidence of a production deployment.

## Implemented in this pass

- [x] Make real mode the fresh-install default; require an explicit action to enable the simulator.
- [x] Prevent older saved settings from silently restoring the simulator and remove the archive's three seeded example contacts during settings migration.
- [x] Replace invented parser fallbacks with errors for truncated, absent, reserved, or out-of-range measurements.
- [x] Decode signed IEEE-11073 SFLOAT/FLOAT values, standard heart-rate fields and RR intervals, blood pressure, pulse oximeter, and glucose measurement payloads.
- [x] Normalize blood pressure kPa payloads to mmHg and glucose concentration payloads to mg/dL before they enter the app.
- [x] Add user-initiated Web Bluetooth pairing for standard Heart Rate, Blood Pressure, Pulse Oximeter continuous measurement, and Glucose services. Show unsupported, connection, disconnect, and malformed-measurement states.
- [x] Keep adapter-owned readings in real mode. Apply the sustained alert rule only to continuous heart-rate and oxygen data; show intermittent cuff and glucose data for review.
- [x] Remove seeded patient details, contacts, and history. Only configured values can appear in SOS message previews.
- [x] Correct SOS and landing-page copy so it does not imply messages are delivered or emergency services are contacted automatically.
- [x] Add parser regression tests and document supported scope and deployment limits.

## Prioritized remaining work

1. Identity and persistence: choose/configure an identity provider and database; create migrations and per-user authorization for profiles, contacts, devices, readings, incidents, and audit records. None is configured. Current browser-local contacts are not an account system.
2. Notification dispatch: configure a server-side provider, verified sender numbers, secrets, delivery webhooks, idempotency, retries, rate limits, and delivery states. Current SMS links are drafts that require the user to press Send.
3. Wearable validation: test implemented standard profiles with actual supported devices, including permission, service discovery, disconnection, and reconnect behavior. Add separately documented adapters for manufacturer APIs/native bridges where required.
4. Safety validation: validate alert thresholds and timing with suitable clinical and usability review; exercise sensor failure, stale data, duplicate alarm, and emergency-call flows.
5. AI, voice, and localization: configure a server-side AI provider, minimize context, implement Hindi/English strings, and test speech permissions/fallbacks. The present assistant is an offline rule/keyword guide, not a configured AI service.
6. Production hardening: add end-to-end tests, privacy and retention controls, CSP/rate limits, observability, production environment separation, and deployment verification.

## Supported device interface

The adapter requests these Bluetooth SIG GATT services and characteristics:

| Profile | Service | Measurement | App field |
| --- | --- | --- | --- |
| Heart Rate | 0x180D | 0x2A37 | Heart rate, bpm |
| Blood Pressure | 0x1810 | 0x2A35 | Systolic/diastolic, mmHg |
| Pulse Oximeter | 0x1822 | 0x2A5F | SpO2, percent |
| Glucose | 0x1808 | 0x2A18 | Glucose, mg/dL |

Pairing uses the browser's Web Bluetooth chooser and requires a secure context (HTTPS or localhost) plus an explicit user gesture. A model name alone does not establish compatibility: a device must expose the relevant standard service and measurement characteristic. Only continuous PLX 0x2A5F is subscribed; spot-check PLX 0x2A5E and proprietary services are not implemented. No actual model has been verified in this session.

## Verification and deployment

Latest checks in this workspace: parser suite 6/6 passing, TypeScript check passing, and production build passing. These cover parser cases and compilation only; they do not verify authentication, notifications, live device compatibility, clinical thresholds, or a Netlify deployment.

Run from this directory:

    pnpm install --frozen-lockfile
    pnpm test
    pnpm exec tsc --noEmit
    pnpm build

Netlify configuration currently builds with vite build and publishes dist/client. Deployment, account callbacks, database provisioning, SMS delivery, AI access, and hardware operation have not been configured or verified. Do not put private credentials in browser code. Do not represent the app as continuously monitoring or as contacting responders until those services and real-device behavior are independently validated.

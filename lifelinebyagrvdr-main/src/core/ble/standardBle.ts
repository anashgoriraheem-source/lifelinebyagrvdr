import { addLog, set } from '@/lib/store'
import type { Reading, VitalKey } from '@/lib/types'
import { parseBloodPressureMeasurement, parseGlucoseMeasurement, parseHeartRateMeasurement, parsePulseOxMeasurement } from './parsers'

// Bluetooth SIG assigned GATT service/characteristic identifiers.
const PROFILES = [
  { service: 'heart_rate', characteristic: 'heart_rate_measurement', vital: 'hr' as const },
  { service: 'blood_pressure', characteristic: 'blood_pressure_measurement', vital: 'bp' as const },
  { service: 'pulse_oximeter', characteristic: 'plx_continuous_measurement', vital: 'spo2' as const },
  { service: 'glucose', characteristic: 'glucose_measurement', vital: 'glucose' as const },
]

type GattCharacteristic = {
  startNotifications(): Promise<GattCharacteristic>
  addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void
}
type GattService = { getCharacteristic(name: string): Promise<GattCharacteristic> }
type GattServer = { connect(): Promise<GattServer>; getPrimaryService(name: string): Promise<GattService>; disconnect(): void }
type BleDevice = {
  name?: string | null
  gatt?: GattServer | null
  addEventListener(type: 'gattserverdisconnected', listener: () => void): void
}
type BluetoothApi = { requestDevice(options: { acceptAllDevices: boolean; optionalServices: string[] }): Promise<BleDevice> }

let activeDevice: BleDevice | null = null
let generation = 0

function supportedBluetooth(): BluetoothApi | null {
  if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) return null
  return (navigator as Navigator & { bluetooth: BluetoothApi }).bluetooth
}

function commitReading(key: VitalKey, source: string, value: number, unit: string, value2?: number) {
  if (!Number.isFinite(value) || (value2 != null && !Number.isFinite(value2))) return
  const now = Date.now()
  const reading: Reading = { value, value2, unit, source, measuredAt: now, receivedAt: now, quality: 'good' }
  set((s) => ({
    vitals: { ...s.vitals, [key]: reading },
    history: { ...s.history, [key]: [...s.history[key], value].slice(-60) },
  }))
}

/** Connect standard BLE health characteristics. Vendor-specific watches that
 * do not expose these standard services need their own documented adapter. */
export async function connectStandardBle(): Promise<void> {
  const bluetooth = supportedBluetooth()
  if (!bluetooth) throw new Error('Bluetooth pairing is unavailable in this browser. Use a supported browser on HTTPS or localhost.')
  if (activeDevice) return
  const attempt = ++generation
  set({ deviceStatus: 'Requesting Bluetooth device permission…' })
  const device = await bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: PROFILES.map((profile) => profile.service) })
  if (!device.gatt) throw new Error('The selected device does not provide a Bluetooth GATT connection.')
  set({ deviceStatus: 'Connecting…' })
  const server = await device.gatt.connect()
  if (attempt !== generation) { server.disconnect(); return }
  activeDevice = device
  const name = device.name?.trim() || 'Bluetooth health device'
  let subscribed = 0
  device.addEventListener('gattserverdisconnected', () => {
    if (activeDevice !== device) return
    activeDevice = null
    set({ deviceStatus: 'Connection lost. Reconnect the device to resume measurements.' })
    addLog('device', name + ' disconnected; new measurements are unavailable')
  })

  for (const profile of PROFILES) {
    try {
      const service = await server.getPrimaryService(profile.service)
      const characteristic = await service.getCharacteristic(profile.characteristic)
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as EventTarget & { value?: DataView }
        if (!target.value) return
        const bytes = new Uint8Array(target.value.buffer, target.value.byteOffset, target.value.byteLength)
        try {
          if (profile.vital === 'hr') {
            const m = parseHeartRateMeasurement(bytes)
            commitReading('hr', name, m.value, 'bpm')
          } else if (profile.vital === 'bp') {
            const m = parseBloodPressureMeasurement(bytes)
            commitReading('bp', name, m.systolic, m.unit, m.diastolic)
          } else if (profile.vital === 'spo2') {
            const m = parsePulseOxMeasurement(bytes)
            commitReading('spo2', name, m.value, '%')
          } else {
            const m = parseGlucoseMeasurement(bytes)
            commitReading('glucose', name, m.value, m.unit)
          }
        } catch {
          addLog('device', name + ' sent an invalid ' + profile.vital + ' measurement; it was ignored')
        }
      })
      await characteristic.startNotifications()
      subscribed++
    } catch {
      // Devices expose only supported services; unavailable readings remain absent.
    }
  }
  if (attempt !== generation) return
  if (subscribed === 0) {
    activeDevice = null
    server.disconnect()
    throw new Error('This device does not expose a supported standard health measurement service.')
  }
  set({ deviceStatus: 'Connected to ' + name + '. Waiting for device measurements…' })
  addLog('device', name + ' connected; subscribed to ' + subscribed + ' standard measurement service(s)')
}

export function disconnectStandardBle() {
  generation++
  const device = activeDevice
  activeDevice = null
  device?.gatt?.disconnect()
  set({ deviceStatus: 'Disconnected. Existing readings remain visible with their timestamps.' })
}

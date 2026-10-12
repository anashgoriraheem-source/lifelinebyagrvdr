/** Parsers for Bluetooth SIG GATT health profiles. Invalid or unavailable
 * values are rejected; they are never replaced with plausible-looking data. */

export type HeartRateMeasurement = {
  value: number
  unit: 'bpm'
  contactDetected: boolean | null
  energyExpended?: number
  rrIntervalMs: number[]
}

export type BloodPressureMeasurement = {
  systolic: number
  diastolic: number
  meanArterialPressure: number
  unit: 'mmHg'
}

export type PulseOxMeasurement = { value: number; unit: '%'; pulseRate?: number }
export type GlucoseMeasurement = { value: number; unit: 'mg/dL'; sequenceNumber: number }

function requireBytes(data: Uint8Array, min: number, profile: string) {
  if (data.length < min) throw new RangeError(`${profile} measurement is truncated`)
}

function u16(data: Uint8Array, offset: number) {
  requireBytes(data.slice(offset), 2, 'Bluetooth')
  return data[offset]! | (data[offset + 1]! << 8)
}

/** IEEE-11073 SFLOAT: signed 12-bit mantissa and signed 4-bit base-10 exponent. */
export function decodeIEEE11073SFloat(bytes: number[] | Uint8Array): number {
  if (bytes.length < 2) throw new RangeError('IEEE-11073 SFLOAT requires two bytes')
  const raw = bytes[0]! | (bytes[1]! << 8)
  const mantissaRaw = raw & 0x0fff
  const mantissa = mantissaRaw >= 0x0800 ? mantissaRaw - 0x1000 : mantissaRaw
  const exponentRaw = (raw >> 12) & 0x0f
  const exponent = exponentRaw >= 8 ? exponentRaw - 16 : exponentRaw
  // Reserved encodings: NaN, +Inf, -Inf, and NRes.
  if ([0x07fe, 0x07ff, 0x0800, 0x0801, 0x0802].includes(raw)) {
    throw new RangeError('IEEE-11073 SFLOAT contains a reserved value')
  }
  return mantissa * 10 ** exponent
}

/** IEEE-11073 FLOAT: signed 24-bit mantissa and signed 8-bit exponent. */
export function decodeIEEE11073Float(bytes: number[] | Uint8Array): number {
  if (bytes.length < 4) throw new RangeError('IEEE-11073 FLOAT requires four bytes')
  const raw = (bytes[0]! | (bytes[1]! << 8) | (bytes[2]! << 16) | (bytes[3]! << 24)) >>> 0
  const mantissaRaw = raw & 0x00ff_ffff
  const mantissa = mantissaRaw >= 0x0080_0000 ? mantissaRaw - 0x0100_0000 : mantissaRaw
  const exponentRaw = raw >>> 24
  const exponent = exponentRaw >= 128 ? exponentRaw - 256 : exponentRaw
  if ([0x007f_fffe, 0x007f_ffff, 0x0080_0000, 0x0080_0001, 0x0080_0002].includes(raw)) {
    throw new RangeError('IEEE-11073 FLOAT contains a reserved value')
  }
  return mantissa * 10 ** exponent
}

export function parseHeartRateMeasurement(data: Uint8Array): HeartRateMeasurement {
  requireBytes(data, 2, 'Heart Rate')
  const flags = data[0]!
  const is16Bit = (flags & 0x01) !== 0
  let offset = 1
  requireBytes(data, is16Bit ? 3 : 2, 'Heart Rate')
  const value = is16Bit ? u16(data, offset) : data[offset]!
  offset += is16Bit ? 2 : 1
  let energyExpended: number | undefined
  if ((flags & 0x08) !== 0) {
    energyExpended = u16(data, offset)
    offset += 2
  }
  const rrIntervalMs: number[] = []
  if ((flags & 0x10) !== 0) {
    if ((data.length - offset) % 2 !== 0) throw new RangeError('Heart Rate RR interval data is truncated')
    for (; offset < data.length; offset += 2) rrIntervalMs.push(u16(data, offset) * 1000 / 1024)
  }
  const contactSupported = (flags & 0x04) !== 0
  return {
    value,
    unit: 'bpm',
    contactDetected: contactSupported ? (flags & 0x02) !== 0 : null,
    energyExpended,
    rrIntervalMs,
  }
}

/** Blood Pressure Measurement (0x2A35), including SFLOAT values and unit flag. */
export function parseBloodPressureMeasurement(data: Uint8Array): BloodPressureMeasurement {
  requireBytes(data, 7, 'Blood Pressure')
  const flags = data[0]!
  const scale = (flags & 0x01) !== 0 ? 7.50062 : 1
  const systolic = decodeIEEE11073SFloat(data.slice(1, 3)) * scale
  const diastolic = decodeIEEE11073SFloat(data.slice(3, 5)) * scale
  const meanArterialPressure = decodeIEEE11073SFloat(data.slice(5, 7)) * scale
  let expectedLength = 7
  if ((flags & 0x02) !== 0) expectedLength += 7
  if ((flags & 0x04) !== 0) expectedLength += 2
  if ((flags & 0x08) !== 0) expectedLength += 1
  if ((flags & 0x10) !== 0) expectedLength += 2
  requireBytes(data, expectedLength, 'Blood Pressure optional fields')
  return { systolic, diastolic, meanArterialPressure, unit: 'mmHg' }
}

/** Pulse Oximeter Continuous Measurement (0x2A5F); flags mark optional fields. */
export function parsePulseOxMeasurement(data: Uint8Array): PulseOxMeasurement {
  requireBytes(data, 5, 'Pulse Oximeter')
  const flags = data[0]!
  const value = decodeIEEE11073SFloat(data.slice(1, 3))
  const pulseRate = decodeIEEE11073SFloat(data.slice(3, 5))
  if (value < 0 || value > 100) throw new RangeError('Pulse oximeter saturation is outside 0–100%')
  let optionalLength = 0
  if ((flags & 0x01) !== 0) optionalLength += 7
  if ((flags & 0x02) !== 0) optionalLength += 2
  if ((flags & 0x04) !== 0) optionalLength += 3
  if ((flags & 0x08) !== 0) optionalLength += 2
  requireBytes(data, 5 + optionalLength, 'Pulse Oximeter optional fields')
  return { value, unit: '%', pulseRate }
}

/** Glucose Measurement (0x2A18). Concentration is present only when its flag is set. */
export function parseGlucoseMeasurement(data: Uint8Array): GlucoseMeasurement {
  requireBytes(data, 10, 'Glucose')
  const flags = data[0]!
  const sequenceNumber = u16(data, 1)
  let offset = 10 // flags + sequence + base-time (year/month/day/hour/min/sec)
  if ((flags & 0x01) !== 0) offset += 2
  if ((flags & 0x02) === 0) throw new RangeError('Glucose concentration is not present in this measurement')
  requireBytes(data.slice(offset), 3, 'Glucose concentration')
  const raw = decodeIEEE11073SFloat(data.slice(offset, offset + 2))
  if ((flags & 0x08) !== 0) requireBytes(data.slice(offset + 3), 2, 'Glucose sensor status')
  const molPerLitre = (flags & 0x04) !== 0
  const value = molPerLitre ? raw * 18_015.6 : raw * 100_000
  return { value, unit: 'mg/dL', sequenceNumber }
}

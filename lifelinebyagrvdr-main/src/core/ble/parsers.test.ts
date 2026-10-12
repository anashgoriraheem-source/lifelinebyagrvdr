import { describe, expect, it } from 'vitest'
import {
  decodeIEEE11073Float,
  decodeIEEE11073SFloat,
  parseBloodPressureMeasurement,
  parseGlucoseMeasurement,
  parseHeartRateMeasurement,
  parsePulseOxMeasurement,
} from './parsers'

describe('Bluetooth SIG health measurement parsers', () => {
  it('parses 8-bit and 16-bit heart rate including contact and RR intervals', () => {
    expect(parseHeartRateMeasurement(new Uint8Array([0x06, 72]))).toMatchObject({ value: 72, contactDetected: true })
    const rr = parseHeartRateMeasurement(new Uint8Array([0x11, 0x2c, 0x01, 0x00, 0x04, 0x04, 0x00]))
    expect(rr.value).toBe(300)
    expect(rr.contactDetected).toBe(null)
    expect(rr.rrIntervalMs[0]).toBeCloseTo(1000)
    expect(rr.rrIntervalMs[1]).toBeCloseTo(3.90625)
  })

  it('decodes SFLOAT blood pressure values and normalizes kPa to mmHg', () => {
    const mmHg = parseBloodPressureMeasurement(new Uint8Array([0, 0x7c, 0x00, 0x50, 0x00, 0x61, 0x00]))
    expect(mmHg).toMatchObject({ systolic: 124, diastolic: 80, meanArterialPressure: 97, unit: 'mmHg' })
    const kPa = parseBloodPressureMeasurement(new Uint8Array([1, 0x7c, 0x00, 0x50, 0x00, 0x61, 0x00]))
    expect(kPa.unit).toBe('mmHg')
    expect(kPa.systolic).toBeCloseTo(930.0769)
  })

  it('parses pulse oximeter SFLOATs and rejects out-of-range saturation', () => {
    expect(parsePulseOxMeasurement(new Uint8Array([0, 0x61, 0x00, 0x4a, 0x00]))).toEqual({ value: 97, unit: '%', pulseRate: 74 })
    expect(() => parsePulseOxMeasurement(new Uint8Array([0, 0x65, 0x00, 0x4a, 0x00]))).toThrow(RangeError)
  })

  it('parses complete glucose data and never invents a reading when concentration is absent', () => {
    const data = new Uint8Array([0x02, 0x2a, 0x00, 0xe8, 0x07, 0x06, 0x0c, 0x0a, 0x1e, 0x00, 0x70, 0xb0, 0x00])
    expect(parseGlucoseMeasurement(data).value).toBeCloseTo(112)
    expect(parseGlucoseMeasurement(data)).toMatchObject({ unit: 'mg/dL', sequenceNumber: 42 })
    const molar = new Uint8Array([0x06, 0x2b, 0x00, 0xe8, 0x07, 0x06, 0x0c, 0x0a, 0x1e, 0x00, 0x2b, 0xb2, 0x00])
    expect(parseGlucoseMeasurement(molar).value).toBeCloseTo(100, 1)
    expect(() => parseGlucoseMeasurement(new Uint8Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 0]))).toThrow(/not present/)
  })

  it('decodes signed IEEE-11073 mantissas and exponents', () => {
    expect(decodeIEEE11073SFloat([0xf5, 0xf0])).toBeCloseTo(24.5)
    expect(decodeIEEE11073SFloat([0xfb, 0xff])).toBeCloseTo(-0.5)
    expect(decodeIEEE11073Float([0x64, 0x00, 0x00, 0x00])).toBe(100)
    expect(decodeIEEE11073Float([0x9c, 0xff, 0xff, 0x00])).toBe(-100)
    expect(() => decodeIEEE11073SFloat([0xfe, 0x07])).toThrow(/reserved/)
    expect(() => decodeIEEE11073Float([0, 0, 0])).toThrow(RangeError)
  })

  it('rejects truncated measurements instead of returning zero or plausible defaults', () => {
    expect(() => parseHeartRateMeasurement(new Uint8Array([0]))).toThrow(RangeError)
    expect(() => parseBloodPressureMeasurement(new Uint8Array([0, 1]))).toThrow(RangeError)
    expect(() => parseGlucoseMeasurement(new Uint8Array([]))).toThrow(RangeError)
  })
})

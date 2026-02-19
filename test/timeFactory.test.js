import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'
import {DAYS_MS, MINUTES_MS} from "../dist/Time.js";

describe('Time - Factory Methods', () => {
  describe('now', () => {
    it('should return a Time instance', () => {
      const time = Time.now()
      assert.ok(time instanceof Time)
    })

    it('should return clock mode', () => {
      assert.equal(Time.now().mode, 'clock')
    })

    it('should return a time close to current time', () => {
      const getLocalMs = () => {
        const now = new Date()
        const offset = now.getTimezoneOffset() * MINUTES_MS
        return Date.now() % DAYS_MS - offset
      }

      const before = getLocalMs()
      const time = Time.now().toMilliseconds()
      const after = getLocalMs()

      assert.ok(time >= before && time <= after)
    })
  })

  describe('fromDate', () => {
    it('should extract time from a Date object', () => {
      const date = new Date(2024, 0, 1, 12, 30, 45, 123)
      const time = Time.fromDate(date)
      assert.equal(time.hours, 12)
      assert.equal(time.minutes, 30)
      assert.equal(time.seconds, 45)
      assert.equal(time.milliseconds, 123)
    })

    it('should return clock mode', () => {
      const time = Time.fromDate(new Date())
      assert.equal(time.mode, 'clock')
    })

    it('should handle midnight', () => {
      const date = new Date(2024, 0, 1, 0, 0, 0, 0)
      const time = Time.fromDate(date)
      assert.equal(time.toMilliseconds(), 0)
    })
  })

  describe('fromJSON', () => {
    it('should restore clock time from JSON', () => {
      const original = new Time('12:30:45.123')
      const json = original.toJSON()
      const restored = Time.fromJSON(json)
      assert.equal(restored.hours, 12)
      assert.equal(restored.minutes, 30)
      assert.equal(restored.seconds, 45)
      assert.equal(restored.milliseconds, 123)
      assert.equal(restored.mode, 'clock')
    })

    it('should restore duration from JSON', () => {
      const original = new Time('25:00:00', {mode: 'duration'})
      const restored = Time.fromJSON(original.toJSON())
      assert.equal(restored.hours, 25)
      assert.equal(restored.mode, 'duration')
    })

    it('should be roundtrippable', () => {
      const original = new Time('12:30:45.123')
      const restored = Time.fromJSON(original.toJSON())
      assert.equal(restored.toMilliseconds(), original.toMilliseconds())
    })
  })

  describe('midnight', () => {
    it('should return 00:00:00', () => {
      const time = Time.midnight()
      assert.equal(time.hours, 0)
      assert.equal(time.minutes, 0)
      assert.equal(time.seconds, 0)
      assert.equal(time.milliseconds, 0)
    })

    it('should return clock mode', () => {
      assert.equal(Time.midnight().mode, 'clock')
    })

    it('should be detected as midnight', () => {
      assert.equal(Time.midnight().isMidnight(), true)
    })
  })

  describe('noon', () => {
    it('should return 12:00:00', () => {
      const time = Time.noon()
      assert.equal(time.hours, 12)
      assert.equal(time.minutes, 0)
      assert.equal(time.seconds, 0)
      assert.equal(time.milliseconds, 0)
    })

    it('should return clock mode', () => {
      assert.equal(Time.noon().mode, 'clock')
    })

    it('should not be midnight', () => {
      assert.equal(Time.noon().isMidnight(), false)
    })
  })
})

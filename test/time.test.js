import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'

describe('Time - Immutability', () => {
  it('should not mutate on add', () => {
    const time = new Time('12:00:00')
    const original = time.toMilliseconds()
    time.add(1, 'hour')
    assert.equal(time.toMilliseconds(), original)
  })

  it('should not mutate on sub', () => {
    const time = new Time('12:00:00')
    const original = time.toMilliseconds()
    time.sub(1, 'hour')
    assert.equal(time.toMilliseconds(), original)
  })

  it('should not mutate on asClock', () => {
    const dur = new Time('12:00:00', {mode: 'duration'})
    dur.asClock()
    assert.equal(dur.mode, 'duration')
  })

  it('should not mutate on asDuration', () => {
    const clock = new Time('12:00:00')
    clock.asDuration()
    assert.equal(clock.mode, 'clock')
  })
})

describe('Time - Edge Cases', () => {
  it('should handle very large durations', () => {
    const dur = new Time(1000 * 60 * 60 * 1000, {mode: 'duration'}) // 1000 hours
    assert.equal(dur.hours, 1000)
  })

  it('should handle zero time', () => {
    const time = new Time('00:00:00')
    assert.equal(time.hours, 0)
    assert.equal(time.minutes, 0)
    assert.equal(time.seconds, 0)
  })


  it('should handle max valid clock time', () => {
    const time = new Time('23:59:59.999')
    assert.equal(time.hours, 23)
    assert.equal(time.minutes, 59)
    assert.equal(time.seconds, 59)
    assert.equal(time.milliseconds, 999)
  })


  it('should cache calculations', () => {
    const time = new Time('12:30:45')
    const h1 = time.hours
    const h2 = time.hours
    // Should use cache on second access
    assert.equal(h1, h2)
  })

  it('should invalidate cache on arithmetic', () => {
    const time = new Time('12:00:00')
    assert.equal(time.hours, 12)
    const newTime = time.add(1, 'hour')
    assert.equal(newTime.hours, 13)
  })

  it('should handle fractional seconds in string', () => {
    const time = new Time('12:30:45.5')
    assert.equal(time.seconds, 45)
    assert.equal(time.milliseconds, 500)
  })

  it('should throw on invalid unit in add', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.add(1, 'invalid'), /Invalid time unit/)
  })

  it('should throw on invalid unit in sub', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.sub(1, 'invalid'), /Invalid time unit/)
  })

  it('should throw on invalid unit in diff', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.diff('11:00:00', 'invalid'), /Invalid time unit/)
  })
})

describe('Time - Normalization', () => {
  describe('Clock Mode', () => {
    it('should normalize positive overflow', () => {
      const time = new Time(86400000 + 3600000) // 1 day + 1 hour
      assert.equal(time.hours, 1)
      assert.equal(time.minutes, 0)
    })

    it('should normalize negative values', () => {
      const time = new Time(-3600000) // -1 hour
      assert.equal(time.hours, 23)
      assert.equal(time.minutes, 0)
    })

    it('should normalize multiple day overflow', () => {
      const time = new Time(3 * 86400000 + 7200000) // 3 days + 2 hours
      assert.equal(time.hours, 2)
    })
  })

  describe('Duration Mode', () => {
    it('should not normalize positive values', () => {
      const dur = new Time(86400000 + 3600000, {mode: 'duration'}) // 25 hours
      assert.equal(dur.hours, 25)
    })

    it('should not normalize negative values', () => {
      const dur = new Time(-3600000, {mode: 'duration'}) // -1 hour
      assert.ok(dur.toMilliseconds() < 0)
    })
  })
})

describe('Time - Constructor', () => {

  describe('Clock Mode', () => {
    it('should create time from string', () => {
      const time = new Time('12:30:45')
      assert.equal(time.hours, 12)
      assert.equal(time.minutes, 30)
      assert.equal(time.seconds, 45)
      assert.equal(time.mode, 'clock')
    })

    it('should create time from string with milliseconds', () => {
      const time = new Time('12:30:45.500')
      assert.equal(time.hours, 12)
      assert.equal(time.minutes, 30)
      assert.equal(time.seconds, 45)
      assert.equal(time.milliseconds, 500)
    })

    it('should create time from number (milliseconds)', () => {
      const time = new Time(45296000) // 12:34:56
      assert.equal(time.hours, 12)
      assert.equal(time.minutes, 34)
      assert.equal(time.seconds, 56)
    })

    it('should create time from another Time instance', () => {
      const time1 = new Time('12:30:00')
      const time2 = new Time(time1)
      assert.equal(time2.hours, 12)
      assert.equal(time2.minutes, 30)
      assert.equal(time2.mode, 'clock')
    })

    it('should handle partial time strings', () => {
      assert.equal(new Time('12').hours, 12)
      assert.equal(new Time('12:30').minutes, 30)
    })

    it('should normalize time to 24h format', () => {
      const time = new Time(25 * 60 * 60 * 1000) // 25 hours
      assert.equal(time.hours, 1) // Should wrap to 01:00
    })

    it('should handle negative milliseconds in clock mode', () => {
      const time = new Time(-3600000) // -1 hour
      assert.equal(time.hours, 23) // Should wrap to 23:00
    })
  })

  describe('Validation', () => {
    it('should throw on invalid hours in clock mode', () => {
      assert.throws(() => new Time('25:00'), /Invalid hours/)
      assert.throws(() => new Time('-1:00'), /Clock time cannot be negative/)
    })

    it('should throw on invalid minutes', () => {
      assert.throws(() => new Time('12:60'), /Invalid minutes/)
      assert.throws(() => new Time('12:-1'), /Invalid minutes/)
    })

    it('should throw on invalid seconds', () => {
      assert.throws(() => new Time('12:30:60'), /Invalid seconds/)
      assert.throws(() => new Time('12:30:-1'), /Invalid seconds/)
    })

    it('should throw on non-numeric values', () => {
      assert.throws(() => new Time('abc:def'), /non-numeric/)
    })

    it('should throw on too many parts', () => {
      assert.throws(() => new Time('1:2:3:4'), /too many parts/)
    })

    it('should throw on invalid type', () => {
      assert.throws(() => new Time({}), /TypeError/)
    })
  })

  describe('Duration Mode', () => {
    it('should create duration from string', () => {
      const dur = new Time('2:30:15', {mode: 'duration'})
      assert.equal(dur.hours, 2)
      assert.equal(dur.minutes, 30)
      assert.equal(dur.seconds, 15)
      assert.equal(dur.mode, 'duration')
    })

    it('should create duration from number', () => {
      const dur = new Time(5000, {mode: 'duration'})
      assert.equal(dur.seconds, 5)
      assert.equal(dur.mode, 'duration')
    })

    it('should not normalize duration times', () => {
      const dur = new Time(25 * 60 * 60 * 1000, {mode: 'duration'})
      assert.equal(dur.hours, 25) // Should NOT wrap
    })

    it('should handle negative durations', () => {
      const dur = new Time(-5000, {mode: 'duration'})
      assert.equal(dur.toMilliseconds(), -5000)
    })
  })
})

describe('Time - Getters and Conversions', () => {
  it('should return correct hours', () => {
    const time = new Time('12:30:45')
    assert.equal(time.hours, 12)
  })

  it('should return correct minutes', () => {
    const time = new Time('12:30:45')
    assert.equal(time.minutes, 30)
  })

  it('should return correct seconds', () => {
    const time = new Time('12:30:45')
    assert.equal(time.seconds, 45)
  })

  it('should return correct milliseconds', () => {
    const time = new Time('12:30:45.123')
    assert.equal(time.milliseconds, 123)
  })

  it('should convert to milliseconds', () => {
    const time = new Time('01:00:00')
    assert.equal(time.toMilliseconds(), 3600000)
  })

  it('should convert to seconds', () => {
    const time = new Time('01:00:00')
    assert.equal(time.toSeconds(), 3600)
  })

  it('should convert to minutes', () => {
    const time = new Time('01:30:00')
    assert.equal(time.toMinutes(), 90)
  })

  it('should convert to hours', () => {
    const time = new Time('02:30:00')
    assert.equal(time.toHours(), 2.5)
  })

  it('should convert to full hours', () => {
    const time = new Time('02:30:00')
    assert.equal(time.toFullHours(), 2)
  })

  it('should convert to full minutes', () => {
    const time = new Time('02:30:30')
    assert.equal(time.toFullMinutes(), 150)
  })

  it('should convert to full seconds', () => {
    const time = new Time('02:30:30.500')
    assert.equal(time.toFullSeconds(), 9030)
  })

  it('should return correct JSON', () => {
    const time = new Time('12:30:45.123')
    const json = time.toJSON()
    assert.equal(json.hours, 12)
    assert.equal(json.minutes, 30)
    assert.equal(json.seconds, 45)
    assert.equal(json.milliseconds, 123)
    assert.equal(json.mode, 'clock')
  })
})

describe('Time - Formatting', () => {
  it('should format with default pattern', () => {
    const time = new Time('12:30:45')
    assert.equal(time.format(), '12:30:45')
  })

  it('should format hours (H)', () => {
    const time = new Time('09:30:00')
    assert.equal(time.format('H'), '9')
  })

  it('should format hours padded (HH)', () => {
    const time = new Time('09:30:00')
    assert.equal(time.format('HH'), '09')
  })

  it('should format minutes (m)', () => {
    const time = new Time('12:05:00')
    assert.equal(time.format('m'), '5')
  })

  it('should format minutes padded (mm)', () => {
    const time = new Time('12:05:00')
    assert.equal(time.format('mm'), '05')
  })

  it('should format seconds (s)', () => {
    const time = new Time('12:30:05')
    assert.equal(time.format('s'), '5')
  })

  it('should format seconds padded (ss)', () => {
    const time = new Time('12:30:05')
    assert.equal(time.format('ss'), '05')
  })

  it('should format milliseconds single digit (f)', () => {
    const time = new Time('12:30:45.123')
    assert.equal(time.format('f'), '1')
  })

  it('should format milliseconds two digits (ff)', () => {
    const time = new Time('12:30:45.123')
    assert.equal(time.format('ff'), '12')
  })

  it('should format milliseconds three digits (fff)', () => {
    const time = new Time('12:30:45.123')
    assert.equal(time.format('fff'), '123')
  })

  it('should format custom pattern', () => {
    const time = new Time('12:30:45.123')
    assert.equal(time.format('HH:mm:ss.fff'), '12:30:45.123')
  })

  it('should format with mixed tokens', () => {
    const time = new Time('09:05:03.001')
    assert.equal(time.format('H:m:s.f'), '9:5:3.0')
  })

  it('should use toString with default format', () => {
    const time = new Time('12:30:45')
    assert.equal(time.toString(), '12:30:45')
  })
})

describe('Time - Utility', () => {
  it('should detect midnight', () => {
    const midnight = new Time('00:00:00')
    assert.equal(midnight.isMidnight(), true)
  })

  it('should detect non-midnight', () => {
    const time = new Time('12:00:00')
    assert.equal(time.isMidnight(), false)
  })

  it('should return primitive as number', () => {
    const time = new Time('12:00:00')
    assert.equal(+time, time.toMilliseconds())
  })

  it('should return primitive as string', () => {
    const time = new Time('12:00:00')
    assert.equal(`${time}`, '12:00:00')
  })

  it('should return valueOf as number', () => {
    const time = new Time('12:00:00')
    assert.equal(time.valueOf(), time.toMilliseconds())
  })
})

describe('Time - Mode Conversion', () => {
  it('should convert clock to duration', () => {
    const clock = new Time('12:30:00')
    const dur = clock.asDuration()
    assert.equal(dur.mode, 'duration')
    assert.equal(dur.hours, 12)
    assert.equal(dur.minutes, 30)
  })

  it('should convert duration to clock', () => {
    const dur = new Time('25:30:00', {mode: 'duration'})
    const clock = dur.asClock()
    assert.equal(clock.mode, 'clock')
    assert.equal(clock.hours, 1) // Should normalize to 01:30
    assert.equal(clock.minutes, 30)
  })

  it('should have isDuration getter', () => {
    const dur = new Time(1000, {mode: 'duration'})
    assert.equal(dur.isDuration, true)
    assert.equal(dur.isClock, false)
  })

  it('should have isClock getter', () => {
    const clock = new Time('12:00')
    assert.equal(clock.isClock, true)
    assert.equal(clock.isDuration, false)
  })
})

describe('Time - Arithmetic', () => {
  describe('Addition', () => {
    it('should add milliseconds', () => {
      const time = new Time('12:00:00')
      const result = time.add(5000, 'milliseconds')
      assert.equal(result.format(), '12:00:05')
    })

    it('should add seconds', () => {
      const time = new Time('12:00:00')
      const result = time.add(30, 'seconds')
      assert.equal(result.format(), '12:00:30')
    })

    it('should add minutes', () => {
      const time = new Time('12:00:00')
      const result = time.add(30, 'minutes')
      assert.equal(result.format(), '12:30:00')
    })

    it('should add hours', () => {
      const time = new Time('12:00:00')
      const result = time.add(2, 'hours')
      assert.equal(result.format(), '14:00:00')
    })

    it('should add Time instances', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('01:30:00')
      const result = time1.add(time2)
      assert.equal(result.format(), '13:30:00')
    })

    it('should wrap around midnight in clock mode', () => {
      const time = new Time('23:00:00')
      const result = time.add(2, 'hours')
      assert.equal(result.format(), '01:00:00')
    })

    it('should not wrap in duration mode', () => {
      const dur = new Time('23:00:00', {mode: 'duration'})
      const result = dur.add(2, 'hours')
      assert.equal(result.hours, 25)
    })

    it('should accept singular unit names', () => {
      const time = new Time('12:00:00')
      const result = time.add(1, 'hour')
      assert.equal(result.format(), '13:00:00')
    })
  })

  describe('Subtraction', () => {
    it('should subtract milliseconds', () => {
      const time = new Time('12:00:05')
      const result = time.sub(5000, 'milliseconds')
      assert.equal(result.format(), '12:00:00')
    })

    it('should subtract seconds', () => {
      const time = new Time('12:00:30')
      const result = time.sub(30, 'seconds')
      assert.equal(result.format(), '12:00:00')
    })

    it('should subtract minutes', () => {
      const time = new Time('12:30:00')
      const result = time.sub(30, 'minutes')
      assert.equal(result.format(), '12:00:00')
    })

    it('should subtract hours', () => {
      const time = new Time('14:00:00')
      const result = time.sub(2, 'hours')
      assert.equal(result.format(), '12:00:00')
    })

    it('should subtract Time instances', () => {
      const time1 = new Time('13:30:00')
      const time2 = new Time('01:30:00')
      const result = time1.sub(time2)
      assert.equal(result.format(), '12:00:00')
    })

    it('should wrap backwards in clock mode', () => {
      const time = new Time('01:00:00')
      const result = time.sub(2, 'hours')
      assert.equal(result.format(), '23:00:00')
    })

    it('should allow negative in duration mode', () => {
      const dur = new Time('01:00:00', {mode: 'duration'})
      const result = dur.sub(2, 'hours')
      assert.ok(result.toMilliseconds() < 0)
    })
  })

  describe('Mode Checks', () => {
    it('should throw when adding clock and duration', () => {
      const clock = new Time('12:00:00')
      const dur = new Time('01:00:00', {mode: 'duration'})
      assert.throws(() => clock.add(dur), /Cannot compare/)
    })

    it('should throw when subtracting different modes', () => {
      const clock = new Time('12:00:00')
      const dur = new Time('01:00:00', {mode: 'duration'})
      assert.throws(() => clock.sub(dur), /Cannot compare/)
    })
  })
})

describe('Time - Comparison', () => {
  describe('diff', () => {
    it('should calculate difference in milliseconds', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('11:00:00')
      assert.equal(time1.diff(time2), 3600000)
    })

    it('should calculate difference in seconds', () => {
      const time1 = new Time('12:01:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.diff(time2, 'seconds'), 60)
    })

    it('should calculate difference in minutes', () => {
      const time1 = new Time('12:30:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.diff(time2, 'minutes'), 30)
    })

    it('should calculate difference in hours', () => {
      const time1 = new Time('14:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.diff(time2, 'hours'), 2)
    })

    it('should handle negative differences', () => {
      const time1 = new Time('11:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.diff(time2, 'hours'), -1)
    })

    it('should accept string input', () => {
      const time = new Time('12:00:00')
      assert.equal(time.diff('11:00:00', 'hours'), 1)
    })

    it('should throw on mode mismatch', () => {
      const clock = new Time('12:00:00')
      const dur = new Time('01:00:00', {mode: 'duration'})
      assert.throws(() => clock.diff(dur), /Cannot compare/)
    })
  })

  describe('isBefore', () => {
    it('should return true when before', () => {
      const time1 = new Time('11:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isBefore(time2), true)
    })

    it('should return false when after', () => {
      const time1 = new Time('13:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isBefore(time2), false)
    })

    it('should return false when same', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isBefore(time2), false)
    })
  })

  describe('isAfter', () => {
    it('should return true when after', () => {
      const time1 = new Time('13:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isAfter(time2), true)
    })

    it('should return false when before', () => {
      const time1 = new Time('11:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isAfter(time2), false)
    })

    it('should return false when same', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isAfter(time2), false)
    })
  })

  describe('isSame', () => {
    it('should return true when same', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSame(time2), true)
    })

    it('should return false when different', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('13:00:00')
      assert.equal(time1.isSame(time2), false)
    })
  })

  describe('isSameOrBefore', () => {
    it('should return true when before', () => {
      const time1 = new Time('11:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSameOrBefore(time2), true)
    })

    it('should return true when same', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSameOrBefore(time2), true)
    })

    it('should return false when after', () => {
      const time1 = new Time('13:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSameOrBefore(time2), false)
    })
  })

  describe('isSameOrAfter', () => {
    it('should return true when after', () => {
      const time1 = new Time('13:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSameOrAfter(time2), true)
    })

    it('should return true when same', () => {
      const time1 = new Time('12:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSameOrAfter(time2), true)
    })

    it('should return false when before', () => {
      const time1 = new Time('11:00:00')
      const time2 = new Time('12:00:00')
      assert.equal(time1.isSameOrAfter(time2), false)
    })
  })

  describe('isBetween', () => {
    it('should return true when between (inclusive)', () => {
      const time = new Time('12:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00'), true)
    })

    it('should return true when at start (inclusive)', () => {
      const time = new Time('11:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00'), true)
    })

    it('should return true when at end (inclusive)', () => {
      const time = new Time('13:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00'), true)
    })

    it('should return false when at start (exclusive)', () => {
      const time = new Time('11:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00', false), false)
    })

    it('should return false when at end (exclusive)', () => {
      const time = new Time('13:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00', false), false)
    })

    it('should return false when before range', () => {
      const time = new Time('10:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00'), false)
    })

    it('should return false when after range', () => {
      const time = new Time('14:00:00')
      assert.equal(time.isBetween('11:00:00', '13:00:00'), false)
    })
  })
})

describe('#normalizeTimeInput validation', () => {
  it('should throw on null', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.isBefore(null), /null or undefined/)
  })

  it('should throw on undefined', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.isBefore(undefined), /null or undefined/)
  })

  it('should throw on invalid type', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.isBefore({}), /must be a string, number or Time instance/)
  })

  it('should include the actual type in the error message', () => {
    const time = new Time('12:00:00')
    assert.throws(() => time.isBefore([]), /\[object Array\]/)
  })
})

import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'

describe('Time - constructor duration', () => {

  it('name', () => {

    assert.equal(new Time('-2:30', {mode: 'duration'}).toMilliseconds(), -9000000)
    assert.equal(new Time('-0:30', {mode: 'duration'}).toMilliseconds(), -1800000)

    assert.equal(new Time('-2:30', {mode: 'duration'}).toFullHours(), -2)
    assert.equal(new Time('-2:30', {mode: 'duration'}).toHours(), -2.5)

    assert.equal(new Time('-00:01:30', {mode: 'duration'}).toFullMinutes(), -1)
    assert.equal(new Time('-00:01:30', {mode: 'duration'}).toMinutes(), -1.5)

    assert.equal(new Time('-00:01:30', {mode: 'duration'}).toSeconds(), -90)

    assert.equal(new Time('-00:0:10.5', {mode: 'duration'}).toSeconds(), -10.5)
    assert.equal(new Time('-00:0:10.5', {mode: 'duration'}).toFullSeconds(), -10)

    assert.equal(new Time('2:30', {mode: 'duration'}).toMilliseconds(), 9000000)
    assert.equal(new Time('0:30', {mode: 'duration'}).toMilliseconds(), 1800000)

    assert.equal(new Time('2:30', {mode: 'duration'}).toFullHours(), 2)
    assert.equal(new Time('2:30', {mode: 'duration'}).toHours(), 2.5)

    assert.equal(new Time('00:01:30', {mode: 'duration'}).toFullMinutes(), 1)
    assert.equal(new Time('00:01:30', {mode: 'duration'}).toMinutes(), 1.5)

    assert.equal(new Time('00:01:30', {mode: 'duration'}).toSeconds(), 90)

    assert.equal(new Time('00:0:10.5', {mode: 'duration'}).toSeconds(), 10.5)
    assert.equal(new Time('00:0:10.5', {mode: 'duration'}).toFullSeconds(), 10)

  })

  it('NAME ME', () => {
    const dur = new Time('-00:30:00', {mode: 'duration'}) // -1.1 seconds
    assert.equal(dur.hours, 0)
    assert.equal(dur.milliseconds, 0)
    assert.equal(dur.seconds, 0)
    assert.equal(dur.minutes, 30)
    assert.equal(dur.format(), "-00:30:00")
    assert.equal(dur.toSeconds(), -30 * 60)
  })

  it('NAME ME', () => {
    const dur = new Time('-00:00:05', {mode: 'duration'}) // -1.1 seconds
    assert.equal(dur.hours, 0)
    assert.equal(dur.milliseconds, 0)
    assert.equal(dur.seconds, 5)
    assert.equal(dur.minutes, 0)
    assert.equal(dur.format(), "-00:00:05")
    assert.equal(dur.toSeconds(), -5)
  })

  it('should handle negative numbers in duration', () => {
    const dur = new Time(-1100, {mode: 'duration'}) // -1.1 seconds
    assert.equal(dur.hours, 0)
    assert.equal(dur.milliseconds, 100)
    assert.equal(dur.seconds, 1)
    assert.equal(dur.format(), "-00:00:01")
    assert.equal(dur.toMilliseconds(), -1100)
  })

  it('DEFINE ME', () => {
    const dur = new Time('-10:00:00', {mode: 'duration'})
    assert.equal(dur.hours, 10)
    assert.equal(dur.milliseconds, 0)
    assert.equal(dur.seconds, 0)
    assert.equal(dur.minutes, 0)
    assert.equal(dur.toMilliseconds(), 10 * 60 * 60 * 1000 * -1)
    assert.equal(dur.format(), "-10:00:00")
  })

  it('DEFINE ME', () => {
    let dur = new Time('-10:00:00', {mode: 'duration'})
      .add(1, 'hour')
    assert.equal(dur.hours, 9)
    assert.equal(dur.milliseconds, 0)
    assert.equal(dur.seconds, 0)
    assert.equal(dur.minutes, 0)
    assert.equal(dur.toMilliseconds(), 9 * 60 * 60 * 1000 * -1)
    assert.equal(dur.format(), "-09:00:00")

    dur = dur.sub(24, 'hour')
    assert.equal(dur.hours, 33)
    assert.equal(dur.milliseconds, 0)
    assert.equal(dur.seconds, 0)
    assert.equal(dur.minutes, 0)
    assert.equal(dur.toMilliseconds(), 33 * 60 * 60 * 1000 * -1)
    assert.equal(dur.format(), "-33:00:00")

    dur = dur
      .add(32, 'hour')
      .add(30, 'minutes')
      .add(16, 'seconds')
    assert.equal(dur.hours, 0)
    assert.equal(dur.milliseconds, 0)
    assert.equal(dur.seconds, 44)
    assert.equal(dur.minutes, 29)
    assert.equal(dur.toMilliseconds(), (29 * 60 + 44) * -1000)
    assert.equal(dur.format(), "-00:29:44")
  })

  it('catch', ()=>{
    assert.throws(() => new Time('-10:00:00', {mode: 'duration'}).isMidnight(), /not applicable to durations/)
  })
})

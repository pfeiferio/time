import test from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'


test('toMilliseconds returns ms since midnight', () => {
  const t = new Time('00:00:01.500')
  assert.equal(t.toMilliseconds(), 1500)
})

test('toSeconds returns exact seconds (float)', () => {
  const t = new Time('00:00:01.500')
  assert.equal(t.toSeconds(), 1.5)
})

test('toFullSeconds floors seconds', () => {
  const t = new Time('00:00:01.999')
  assert.equal(t.toFullSeconds(), 1)
})

test('toFullMinutes floors minutes', () => {
  const t = new Time('00:00:00.999')
  assert.equal(t.toFullMinutes(), 0)
  const t2 = new Time('00:01:59.999')
  assert.equal(t2.toFullMinutes(), 1)
})

test('clock wraps before helper projection', () => {
  const t = new Time('23:59:59.500')
    .add(1, 'second')

  assert.equal(t.format('HH:mm:ss,fff'), '00:00:00,500')
  assert.equal(t.toSeconds(), 0.5)
  assert.equal(t.toFullSeconds(), 0)
})

test('duration does not overflow', () => {
  const t = new Time('23:00')
    .asDuration()
    .add(2, 'hours')

  assert.equal(t.toSeconds(), 25 * 3600)
  assert.equal(t.toFullSeconds(), 25 * 3600)
})


test('same input, different semantics', () => {
  const clock = new Time('22:00')
  const duration = new Time('22:00').asDuration()

  assert.equal(clock.toFullSeconds(), 22 * 3600)
  assert.equal(duration.toFullSeconds(), 22 * 3600)
})

test('add behaves differently for clock vs duration', () => {
  const clock = new Time('22:00').add(4, 'hours')
  const duration = new Time('22:00').asDuration().add(4, 'hours')

  assert.equal(clock.format('HH:mm'), '02:00')
  assert.equal(duration.toFullSeconds(), 26 * 3600)
})


test('midnight projections', () => {
  const t = new Time('00:00:00.000')

  assert.equal(t.toMilliseconds(), 0)
  assert.equal(t.toSeconds(), 0)
  assert.equal(t.toFullSeconds(), 0)
})

test('fractional milliseconds propagate correctly', () => {
  const t = new Time('00:00:00.001')

  assert.equal(t.toSeconds(), 0.001)
  assert.equal(t.toFullSeconds(), 0)
})

test('clock comparison stays stable after overflow', () => {
  const t0 = new Time('23:00')
  const t1 = new Time('22:00').add(10, 'hours') // 08:00

  assert.ok(t0 > t1)
})

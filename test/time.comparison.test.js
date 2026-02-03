import test from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'

test('isBefore with Time', () => {
  const t0 = new Time('10:00')
  const t1 = new Time('11:00')

  assert.equal(t0.isBefore(t1), true)
  assert.equal(t1.isBefore(t0), false)
})

test('isAfter with string', () => {
  const t = new Time('12:00')

  assert.equal(t.isAfter('11:59'), true)
  assert.equal(t.isAfter('12:00'), false)
})

test('isBefore with number (ms)', () => {
  const t = new Time('01:00') // 3600000
  assert.equal(t.isBefore(2 * 3600 * 1000), true)
})

test('isSame', () => {
  assert.equal(new Time('01:00').isSame((new Time('01:00'))), true);
})

test('isBetween', () => {
  assert.equal(
    new Time('01:00').isBetween(
      new Time('01:00'),
      new Time('02:00')
    ), true);

  assert.equal(
    new Time('01:00').isBetween(
      new Time('01:00'),
      new Time('02:00'),
      false
    ), false);

  assert.equal(
    new Time('00:30').isBetween(
      new Time('01:00'),
      new Time('02:00'),
    ), false);
})

test('add with time', () => {
  assert.equal(
    new Time('00:00:10').add(new Time('00:00:20')).toSeconds(),
    30)
})

test('sub with time', () => {
  assert.equal(
    new Time('00:00:30').sub(new Time('00:00:20')).toSeconds(),
    10)
})

test('isSameOrBefore includes equality', () => {
  const t = new Time('10:00')

  assert.equal(t.isSameOrBefore('10:00'), true)
  assert.equal(t.isSameOrBefore('09:59'), false)
})

test('isSameOrAfter includes equality', () => {
  const t = new Time('10:00')

  assert.equal(t.isSameOrAfter('10:00'), true)
  assert.equal(t.isSameOrAfter('10:01'), false)
})

test('clock comparison remains stable after overflow', () => {
  const t0 = new Time('23:00')
  const t1 = new Time('22:00').add(10, 'hours') // 08:00

  assert.equal(t1.isAfter(t0), false)
  assert.equal(t0.isAfter(t1), true)
})

test('diff in seconds (clock)', () => {
  const t0 = new Time('10:00')
  const t1 = new Time('10:01')

  assert.equal(t1.diff(t0, 'seconds'), 60)
  assert.equal(t0.diff(t1, 'seconds'), -60)
})

test('diff in hours', () => {
  const t0 = new Time('08:00')
  const t1 = new Time('14:00')

  assert.equal(t1.diff(t0, 'hours'), 6)
})

test('diff with string input', () => {
  const t = new Time('01:00')

  assert.equal(t.diff('00:30', 'minutes'), 30)
})

test('diff respects duration semantics', () => {
  const t0 = new Time('22:00').asDuration()
  const t1 = t0.add(4, 'hours')

  assert.equal(t1.diff(t0, 'hours'), 4)
})

test('isMidnight true only at 00:00:00.000', () => {
  assert.equal(new Time('00:00').isMidnight(), true)
  assert.equal(new Time('00:00:00.000').isMidnight(), true)

  assert.equal(new Time('00:00:00.001').isMidnight(), false)
  assert.equal(new Time('23:59:59').isMidnight(), false)
})

test('asClock returns new object', () => {
  const t = new Time('22:00').asDuration()
  const clock = t.asClock()

  assert.notEqual(clock, t)
  assert.equal(clock.format('HH:mm'), '22:00')
})

test('asClock wraps duration values', () => {
  const t = new Time('22:00')
    .asDuration()
    .add(10, 'hours')
    .asClock()

  assert.equal(t.format('HH:mm'), '08:00')
})

test('toFullHours floors hours', () => {
  const t = new Time('01:59:59.999')
  assert.equal(t.toFullHours(), 1)
})

test('toFullMinutes floors minutes', () => {
  const t = new Time('00:10:59.999')
  assert.equal(t.toFullMinutes(), 10)
})

test('toFullSeconds floors seconds', () => {
  const t = new Time('00:00:01.999')
  assert.equal(t.toFullSeconds(), 1)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'

test('check getters', () => {
  assert.equal(new Time('09:22:44.567').hours, 9)
  assert.equal(new Time('13:22:44.567').hours, 13)

  assert.equal(new Time('09:22:44.567').minutes, 22)
  assert.equal(new Time('13:2:44.567').minutes, 2)

  assert.equal(new Time('09:22:44.567').seconds, 44)
  assert.equal(new Time('13:22:04.567').seconds, 4)

  assert.equal(new Time('09:22:44.567').milliseconds, 567)
  assert.equal(new Time('13:22:44.001').milliseconds, 1)
  assert.equal(new Time('13:22:44.1').milliseconds, 100)

  assert.equal(new Time('13:22:44.1').mode, 'clock')
  assert.equal(new Time('13:22:44.1', {mode: 'duration'}).mode, 'duration')
  assert.equal(new Time('13:22:44.1', {mode: 'clock'}).mode, 'clock')
  assert.equal(new Time('13:22:44.1', {mode: 'duration'}).asDuration().mode, 'duration')
  assert.equal(new Time('13:22:44.1', {mode: 'duration'}).asClock().mode, 'clock')


  assert.equal(new Time('00:00:30').toMinutes(), 0.5)
  assert.equal(new Time('00:00:30').toFullMinutes(), 0)

  assert.equal(new Time('00:01:30').toMinutes(), 1.5)
  assert.equal(new Time('00:01:30').toFullMinutes(), 1)

  assert.equal(new Time('00:30:00').toHours(), 0.5)
  assert.equal(new Time('00:01:30').toFullHours(), 0)

  assert.equal(new Time('00:00:00.5').toSeconds(), 0.5)
  assert.equal(new Time('00:00:00.5').toFullSeconds(), 0)

  assert.deepEqual(new Time('10:20:30.5').toJSON(), {
    hours: 10,
    milliseconds: 500,
    minutes: 20,
    mode: 'clock',
    seconds: 30
  })

  assert.equal(new Time('10:00:10').sub(10, 'hours').toMilliseconds(), 10000)
  assert.equal(new Time('10:00:10').sub(10, 'seconds').sub(10, 'hours').toMilliseconds(), 0)

  assert.equal(new Time('10:00:10').sub(10, 'seconds').sub(10, 'hours').valueOf(), 0)

  assert.equal(`time:${new Time('10:00:10')}`, 'time:10:00:10')

  assert.throws(() => new Time('1:1:1').sub(1, 'unknown'))
  assert.throws(() => new Time('1:1:1').diff(new Time('1:1:1'), 'unknown'))
  assert.equal(new Time('1:1:1.5').diff(new Time('1:1:1'), 'milliseconds'), 500)
  assert.equal(new Time('1:1:1.5').diff(new Time('1:1:1.5'), 'seconds'), 0)
  assert.equal(new Time('1:1:1.5').diff(new Time('1:1:1'), 'seconds'), 0.5)
  assert.equal(new Time('1:2:1').diff(new Time('1:1:1'), 'minutes'), 1)
  assert.equal(new Time('00:00:10').add(1, 'milliseconds').milliseconds, 1)

  assert.equal(new Time('1:1:1').diff(new Time('1:1:1'), 'seconds'), 0)
  assert.throws(() => new Time('1:1:1').asDuration().diff(new Time('1:1:1'), 'seconds'))
  assert.throws(() => new Time('1:1:1').asDuration().add(new Time('1:1:1')))
  assert.throws(() => new Time('1:1:1').asDuration().sub(new Time('1:1:1')))
})

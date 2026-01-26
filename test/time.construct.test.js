import test from 'node:test'
import assert from 'node:assert/strict'
import {Time} from '../dist/Time.js'

test('create with string', () => {
  const t0 = new Time('10:00')
  assert.equal(t0.toString(), '10:00:00')

  const t1 = t0
    .add(10, 'minutes')
    .add(3, 'seconds')
  assert.equal(new Time(t1).toString(), '10:10:03')

})

test('create with invalid parameter', () => {
  assert.throws(() => new Time([]))
  assert.throws(() => new Time('1:1:1:1'))
  assert.throws(() => new Time('a:1:1'))
  assert.throws(() => new Time('1:a:1'))
  assert.throws(() => new Time('1:1:a'))
  assert.throws(() => new Time('60:1:1'))
  assert.throws(() => new Time('1:60:1'))
  assert.throws(() => new Time('1:1:60'))
})

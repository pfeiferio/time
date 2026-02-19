# @pfeiferio/time

> A small, strict, and predictable time utility for **clock times** and **durations**.

[![npm version](https://badge.fury.io/js/%40pfeiferio%2Ftime.svg)](https://www.npmjs.com/package/@pfeiferio/time)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![codecov](https://codecov.io/gh/pfeiferio/time/branch/main/graph/badge.svg)](https://codecov.io/gh/pfeiferio/time)

This package provides a single `Time` class with a clear separation between
**wall-clock time** (`HH:mm:ss`) and **durations** (`milliseconds`, `seconds`, etc.).
It is immutable by default and designed for business logic, scheduling, and calculations —
not as a date-time replacement.

---

## Features

- ✅ Clock time **and** duration support
- ✅ Immutable operations (`add`, `sub`, `diff` return new instances)
- ✅ Strict mode separation (`clock` vs `duration`)
- ✅ Formatting with tokens (`HH:mm:ss.fff`)
- ✅ Numeric, string, and `Time` inputs
- ✅ JSON & primitive coercion support
- ✅ No dependencies
- ✅ Factory methods (`now`, `fromDate`, `fromJSON`, `midnight`, `noon`)

---

## Installation

```bash
npm install @pfeiferio/time
````

---

## Basic Usage

### Clock Time

```ts
import {Time} from '@pfeiferio/time'

const t = new Time('13:45:30')

t.hours        // 13
t.minutes      // 45
t.seconds      // 30

t.toString()   // "13:45:30"
```

---

### Duration

```ts
const d = new Time(90_000, {mode: 'duration'})

d.toSeconds()  // 90
d.toMinutes()  // 1.5
```

Durations can be **negative** and are represented as signed milliseconds:

```ts
const d = new Time(-1100, {mode: 'duration'})

d.toMilliseconds() // -1100
d.seconds          // 1
d.milliseconds     // 100
d.format()         // "-00:00:01"
```

---

## Modes

Each `Time` instance operates in **exactly one mode**:

| Mode       | Meaning                          |
|------------|----------------------------------|
| `clock`    | Wall-clock time within a 24h day |
| `duration` | Time span without normalization  |

```ts
const clock = new Time('23:30')
const duration = new Time(3600000, {mode: 'duration'})
```

Clock times are normalized to a 24h range:

```ts
new Time(25 * 60 * 60 * 1000).format()
// "01:00:00"
```

---

## Conversion Methods

```ts
time.toMilliseconds()
time.toSeconds()
time.toMinutes()
time.toHours()

time.toFullSeconds()
time.toFullMinutes()
time.toFullHours()
```

---

## Arithmetic (Immutable)

All operations return **new instances**.

```ts
const t = new Time('10:00')

const t2 = t.add(30, 'minutes')
// "10:30"

const t3 = t.sub(1, 'hour')
// "09:00"
```

You can also add or subtract another `Time`:

```ts
const a = new Time('12:00')
const b = new Time('01:30', {mode: 'duration'})

a.add(b) // ❌ throws (mode mismatch)
```

---

## Comparisons

```ts
t.isBefore('12:00')
t.isAfter('08:00')
t.isSame('10:00')

t.isSameOrBefore('10:00')
t.isSameOrAfter('10:00')

t.isBetween('09:00', '11:00')
t.isBetween('09:00', '11:00', false) // exclusive
```

Clock and duration comparisons **must match modes**.

---

## Differences

```ts
const a = new Time('10:00')
const b = new Time('09:30')

a.diff(b, 'minutes') // 30
a.diff(b, 'seconds') // 1800
```

---

## Formatting

```ts
time.format('HH:mm:ss')
time.format('H:m:s')
time.format('HH:mm:ss.fff')
```

### Format Tokens

| Token | Meaning                        |
|-------|--------------------------------|
| `H`   | Hours                          |
| `HH`  | Zero-padded hours              |
| `m`   | Minutes                        |
| `mm`  | Zero-padded minutes            |
| `s`   | Seconds                        |
| `ss`  | Zero-padded seconds            |
| `f`   | Tenths of a second (0–9)       |
| `ff`  | Hundredths of a second (00–99) |
| `fff` | Milliseconds (000–999)         |

Fractional tokens are truncated, not rounded.

For durations, the sign is applied once to the formatted output.
Individual time units are always absolute values.

---

## Mode Conversion

```ts
time.asClock()
time.asDuration()
```

Creates a **new instance** with the same value but a different mode.

---

## Factory Methods
```ts
Time.now()                    // current local time as clock
Time.fromDate(new Date())     // extract time component from a Date
Time.fromJSON(json)           // restore from toJSON() output
Time.midnight()               // 00:00:00
Time.noon()                   // 12:00:00
```

### fromDate
```ts
const date = new Date(2024, 0, 1, 12, 30, 45, 123)
const time = Time.fromDate(date)

time.hours        // 12
time.minutes      // 30
time.seconds      // 45
time.milliseconds // 123
```

### fromJSON
```ts
const original = new Time('12:30:45.123')
const restored = Time.fromJSON(original.toJSON())

restored.hours // 12
```

---

## JSON & Primitive Behavior

```ts
JSON.stringify(new Time('10:30'))
// {"hours":10,"minutes":30,"seconds":0,"milliseconds":0,"mode":"clock"}

Number(new Time(5000, {mode: 'duration'}))
// 5000

  `${new Time('08:00')}`
// "08:00:00"
```

---

## Design Goals

* Predictable behavior
* No hidden date logic
* No mutation
* Explicit time semantics
* Safe for business logic

This package is **not** a date library and intentionally does **not** handle:

* time zones
* calendars
* daylight saving
* timestamps

---

## License

MIT

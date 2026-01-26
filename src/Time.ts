const branding = Symbol('Time')

const DAYS_MS = 24 * 60 * 60 * 1000
const HOURS_MS = 60 * 60 * 1000
const MINUTES_MS = 60 * 1000
const SECONDS_MS = 1000

type TimeMode = 'clock' | 'duration'

type TimeUnit = 'hour' | 'hours' | 'minute' | 'minutes' | 'second' | 'seconds' | 'millisecond' | 'milliseconds'

type NormalizedUnit = 'hours' | 'minutes' | 'seconds' | 'milliseconds'

type FormatToken = 'H' | 'HH' | 'm' | 'mm' | 's' | 'ss' | 'f' | 'fff'

type TimeInput = string | Time | number

interface TimeCache {
  h: number
  m: number
  s: number
  f: number
  t: number
}

interface BrandedTime {
  [branding]: true
  time: number
  mode: TimeMode
}

interface TimeConstructorOptions {
  mode?: TimeMode
}

interface CopyOptions {
  time?: number
  mode?: TimeMode
}

interface FormatTokens {
  H: string
  HH: string
  m: string
  mm: string
  s: string
  ss: string
  f: string
  fff: string
}

interface TimeJSON {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  mode: TimeMode
}

const UNIT_MAP: Record<TimeUnit, NormalizedUnit> = {
  hour: 'hours',
  hours: 'hours',
  minute: 'minutes',
  minutes: 'minutes',
  second: 'seconds',
  seconds: 'seconds',
  millisecond: 'milliseconds',
  milliseconds: 'milliseconds',
}

export class Time {
  #cache: TimeCache = {
    h: 0,
    m: 0,
    s: 0,
    f: 0,
    t: 0
  }

  #time: number = 0
  #mode: TimeMode = 'clock'

  constructor(time: TimeInput | BrandedTime, options: TimeConstructorOptions = {}) {

    if (this.#isBrandedTime(time)) {
      this.#mode = time.mode
      this.#time = this.normalize(time.time)
    } else if (time instanceof Time) {
      this.#time = time.#time
      this.#mode = options.mode ?? time.#mode
    } else if (typeof time === 'number') {
      this.#time = time
      this.#mode = options.mode ?? 'clock'
    } else {
      this.#mode = options.mode ?? 'clock'

      if (typeof time !== 'string') {
        throw new TypeError('Time must be a string or branded Time object')
      }

      this.#parseTimeString(time)
    }
  }

  get hours(): number {
    return this.#calc().h
  }

  get minutes(): number {
    return this.#calc().m
  }

  get seconds(): number {
    return this.#calc().s
  }

  get milliseconds(): number {
    return this.#calc().f
  }

  get mode(): TimeMode {
    return this.#mode
  }

  /* =========================
   * Conversion Methods
   * ========================= */

  toMilliseconds(): number {
    return this.#time
  }

  toSeconds(): number {
    return this.#time / SECONDS_MS
  }

  toMinutes(): number {
    return this.#time / MINUTES_MS
  }

  toHours(): number {
    return this.#time / HOURS_MS
  }

  toFullHours(): number {
    return Math.floor(this.#time / HOURS_MS)
  }

  toFullMinutes(): number {
    return Math.floor(this.#time / MINUTES_MS)
  }

  toFullSeconds(): number {
    return Math.floor(this.#time / SECONDS_MS)
  }

  toJSON(): TimeJSON {
    return {
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      milliseconds: this.milliseconds,
      mode: this.#mode
    }
  }

  asClock(): Time {
    return this.#copy({mode: 'clock'})
  }

  asDuration(): Time {
    return this.#copy({mode: 'duration'})
  }

  add(value: Time): Time
  add(value: number | Time, unit?: TimeUnit): Time {
    if (value instanceof Time) {
      this.#modeCheck(value)
      value = value.toMilliseconds()
    }
    unit ??= 'milliseconds'
    return this.#copy({
      time: this.#time + this.#unitToMs(value, unit),
    })
  }

  sub(value: Time): Time
  sub(value: number | Time, unit?: TimeUnit): Time {
    if (value instanceof Time) {
      this.#modeCheck(value)
      value = value.toMilliseconds()
    }
    unit ??= 'milliseconds'
    return this.#copy({
      time: this.#time - this.#unitToMs(value, unit),
    })
  }

  #modeCheck(other: Time) {
    if (other.mode !== this.#mode) {
      throw new Error('Cannot compare clock time with duration')
    }
  }

  diff(time: TimeInput, unit: TimeUnit = 'milliseconds'): number {
    const other = this.#normalizeTimeInput(time)
    const diffMs = this.#time - other.toMilliseconds()
    this.#modeCheck(other)

    return this.#msToUnit(diffMs, unit)
  }

  isBefore(time: TimeInput): boolean {
    const other = this.#normalizeTimeInput(time)
    return this.#time < other.toMilliseconds()
  }

  isSameOrBefore(time: TimeInput): boolean {
    const other = this.#normalizeTimeInput(time)
    return this.#time <= other.toMilliseconds()
  }

  isAfter(time: TimeInput): boolean {
    const other = this.#normalizeTimeInput(time)
    return this.#time > other.toMilliseconds()
  }

  isSameOrAfter(time: TimeInput): boolean {
    const other = this.#normalizeTimeInput(time)
    return this.#time >= other.toMilliseconds()
  }

  isSame(time: TimeInput): boolean {
    const other = this.#normalizeTimeInput(time)
    return this.#time === other.toMilliseconds()
  }

  isBetween(start: TimeInput, end: TimeInput, inclusive: boolean = true): boolean {
    const startTime = this.#normalizeTimeInput(start)
    const endTime = this.#normalizeTimeInput(end)

    this.#modeCheck(startTime)
    this.#modeCheck(endTime)

    if (inclusive) {
      return this.#time >= startTime.#time && this.#time <= endTime.#time
    }
    return this.#time > startTime.#time && this.#time < endTime.#time
  }

  /* =========================
   * Utility Methods
   * ========================= */

  normalize(ms: number): number {
    if (this.#mode === 'clock') {
      return ((ms % DAYS_MS) + DAYS_MS) % DAYS_MS
    }
    return ms
  }

  isMidnight(): boolean {
    return this.#time % DAYS_MS === 0
  }

  format(formatString: string = 'HH:mm:ss'): string {
    const {h, m, s, f} = this.#calc()

    const tokens: FormatTokens = {
      H: h.toString(),
      HH: h.toString().padStart(2, '0'),
      m: m.toString(),
      mm: m.toString().padStart(2, '0'),
      s: s.toString(),
      ss: s.toString().padStart(2, '0'),
      f: f.toString(),
      fff: f.toString().padStart(3, '0')
    }

    return formatString.replace(/HH|H|mm|m|ss|s|fff|f/g, (match) => {
      return tokens[match as FormatToken] ?? match
    })
  }

  toString(): string {
    return this.format()
  }

  valueOf(): number {
    return this.#time
  }

  [Symbol.toPrimitive](hint: string): number | string {
    if (hint === 'number') return this.#time
    return this.toString()
  }

  /* =========================
   * Private Methods
   * ========================= */

  #isBrandedTime(value: unknown): value is BrandedTime {
    return !!(
      value &&
      typeof value === 'object' &&
      branding in value &&
      (value as BrandedTime)[branding]
    )
  }

  #normalizeTimeInput(time: TimeInput): Time {
    if (typeof time === 'string' || typeof time === 'number') {
      return new Time(time, {mode: this.#mode})
    }
    return time
  }

  #parseTimeString(time: string): void {
    const parts = time.split(':').map(Number)

    if (parts.length > 3) {
      throw new Error('Invalid time format: too many parts')
    }

    const [hours = 0, minutes = 0, seconds = 0] = parts

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      throw new RangeError('Invalid time format: non-numeric values')
    }

    if (hours < 0 || hours > 23) {
      throw new RangeError(`Invalid hours: ${hours}. Must be between 0 and 23`)
    }

    if (minutes < 0 || minutes > 59) {
      throw new RangeError(`Invalid minutes: ${minutes}. Must be between 0 and 59`)
    }

    if (seconds < 0 || seconds >= 60) {
      throw new RangeError(`Invalid seconds: ${seconds}. Must be between 0 and 59`)
    }

    let timestamp = 0
    timestamp += hours * HOURS_MS
    timestamp += minutes * MINUTES_MS
    timestamp += seconds * SECONDS_MS

    this.#time = this.normalize(timestamp)
  }

  #calc(): TimeCache {
    if (this.#cache.t === this.#time) {
      return this.#cache
    }

    let tmp = this.#time
    tmp -= Math.floor(tmp / DAYS_MS) * DAYS_MS

    this.#cache.h = Math.floor(tmp / HOURS_MS)
    tmp -= this.#cache.h * HOURS_MS

    this.#cache.m = Math.floor(tmp / MINUTES_MS)
    tmp -= this.#cache.m * MINUTES_MS

    this.#cache.s = Math.floor(tmp / SECONDS_MS)
    tmp -= this.#cache.s * SECONDS_MS

    this.#cache.f = tmp
    this.#cache.t = this.#time

    return this.#cache
  }

  #unitToMs(value: number, unit: TimeUnit): number {
    const normalizedUnit = UNIT_MAP[unit]

    if (!normalizedUnit) {
      throw new RangeError(`Invalid time unit: ${unit}`)
    }

    switch (normalizedUnit) {
      case 'hours':
        return value * HOURS_MS
      case 'minutes':
        return value * MINUTES_MS
      case 'seconds':
        return value * SECONDS_MS
      case 'milliseconds':
        return value
    }
  }

  #msToUnit(ms: number, unit: TimeUnit): number {
    const normalizedUnit = UNIT_MAP[unit]

    if (!normalizedUnit) {
      throw new RangeError(`Invalid time unit: ${unit}`)
    }

    switch (normalizedUnit) {
      case 'hours':
        return ms / HOURS_MS
      case 'minutes':
        return ms / MINUTES_MS
      case 'seconds':
        return ms / SECONDS_MS
      case 'milliseconds':
        return ms
    }
  }

  #copy(options: CopyOptions = {}): Time {
    return new Time({
      [branding]: true,
      time: options.time ?? this.#time,
      mode: options.mode ?? this.#mode,
    })
  }
}

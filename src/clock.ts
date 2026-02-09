import type { Body } from './bodies.js';

const TICKS_PER_DAY = 1000;
const SUBTICKS_PER_TICK = 1000;

export interface Timestamp {
  /** SI seconds since Unix epoch */
  epoch: number;
  /** Continuous day count from epoch (fractional) */
  day: number;
  /** Integer day */
  dayInt: number;
  /** Tick within current day (0-999) */
  tick: number;
  /** Sub-tick (0-999, thousandths of a tick) */
  subtick: number;
  /** Year (epoch-relative), null if daysPerYear < 2 */
  year: number | null;
  /** Day within year (0-indexed), null if daysPerYear < 2 */
  dayOfYear: number | null;
  /** Days per year for this body */
  daysPerYear: number;
}

export interface FormatOptions {
  /** Meridian offset in degrees (-180 to +180) */
  longitude?: number;
  /** Include sub-tick (default true) */
  subtick?: boolean;
  /** Include tick division @seconds (default true) */
  division?: boolean;
}

export type Format = 'canonical' | 'display' | 'full';

export class Clock {
  readonly body: Body;
  readonly tickSeconds: number;
  readonly daysPerYear: number;

  constructor(body: Body) {
    this.body = body;
    this.tickSeconds = body.daySeconds / TICKS_PER_DAY;
    this.daysPerYear = body.yearSeconds / body.daySeconds;
  }

  /**
   * Time at a given Unix timestamp in milliseconds.
   */
  at(ms: number): Timestamp {
    const epochSeconds = ms / 1000;
    const day = epochSeconds / this.body.daySeconds;
    const dayInt = Math.floor(day);
    const dayFrac = day - dayInt;
    const tickFrac = dayFrac * TICKS_PER_DAY;
    const tick = Math.floor(tickFrac);
    const subtick = Math.floor((tickFrac - tick) * SUBTICKS_PER_TICK);

    let year: number | null = null;
    let dayOfYear: number | null = null;

    if (this.daysPerYear >= 2) {
      year = Math.floor(dayInt / this.daysPerYear);
      dayOfYear = dayInt - Math.floor(year * this.daysPerYear);
    }

    return { epoch: epochSeconds, day, dayInt, tick, subtick, year, dayOfYear, daysPerYear: this.daysPerYear };
  }

  now(): Timestamp {
    return this.at(Date.now());
  }

  fromDate(date: Date): Timestamp {
    return this.at(date.getTime());
  }

  /**
   * Format: T{Y}:{DDD}:{tick}.{subtick}@{tickSeconds}{±longitude}
   */
  format(ts: Timestamp, fmt: Format = 'display', opts: FormatOptions = {}): string {
    const showSubtick = opts.subtick !== false;
    const showDivision = opts.division !== false;
    const tickStr = String(ts.tick).padStart(3, '0');
    const subtickStr = showSubtick ? `.${String(ts.subtick).padStart(3, '0')}` : '';
    const divStr = showDivision ? `@${parseFloat(this.tickSeconds.toFixed(1))}` : '';

    let lonStr = '';
    if (opts.longitude !== undefined) {
      const sign = opts.longitude >= 0 ? '+' : '';
      lonStr = `${sign}${opts.longitude}`;
    }

    const suffix = `${subtickStr}${divStr}${lonStr}`;
    const canonical = `T${ts.dayInt}:${tickStr}${suffix}`;

    if (fmt === 'canonical') return canonical;

    if (ts.year !== null && ts.dayOfYear !== null) {
      const dayWidth = Math.max(3, String(Math.ceil(this.daysPerYear)).length);
      const display = `T${ts.year}:${String(ts.dayOfYear).padStart(dayWidth, '0')}:${tickStr}${suffix}`;

      if (fmt === 'display') return display;
      return `${display} (${canonical})`;
    }

    return canonical;
  }

  /**
   * Convert a Timestamp back to Unix milliseconds.
   */
  toMs(ts: Timestamp): number {
    return ts.epoch * 1000;
  }

  /**
   * Convert a Timestamp back to a Date.
   */
  toDate(ts: Timestamp): Date {
    return new Date(ts.epoch * 1000);
  }

  /**
   * Parse an orrery format string back to a Timestamp.
   *
   * Accepts: T{Y}:{D}:{tick}.{subtick}@{div}{±lon}
   *      or: T{D}:{tick}.{subtick}@{div}{±lon}  (canonical)
   *
   * The @division and ±longitude are ignored for parsing —
   * the clock already knows its own tick duration.
   */
  parse(str: string): Timestamp {
    // Strip T prefix
    let s = str.startsWith('T') ? str.slice(1) : str;

    // Strip @division and ±longitude suffix
    s = s.replace(/@[\d.]+/, '').replace(/[+-][\d.]+$/, '');

    // Split on colons
    const parts = s.split(':');

    let dayInt: number;
    let tick: number;
    let subtick = 0;

    if (parts.length === 2) {
      // Canonical: D:tick.subtick
      dayInt = parseInt(parts[0], 10);
      [tick, subtick] = parseTickSubtick(parts[1]);
    } else if (parts.length === 3) {
      // Display: Y:D:tick.subtick
      const year = parseInt(parts[0], 10);
      const dayOfYear = parseInt(parts[1], 10);
      dayInt = Math.floor(year * this.daysPerYear) + dayOfYear;
      [tick, subtick] = parseTickSubtick(parts[2]);
    } else {
      throw new Error(`Invalid orrery timestamp: ${str}`);
    }

    const epochSeconds = (dayInt + (tick + subtick / 1000) / 1000) * this.body.daySeconds;
    return this.at(epochSeconds * 1000);
  }

  toString(): string {
    return `${this.body.name} ${this.format(this.now())}`;
  }
}

function parseTickSubtick(s: string): [number, number] {
  const dot = s.indexOf('.');
  if (dot === -1) return [parseInt(s, 10), 0];
  return [parseInt(s.slice(0, dot), 10), parseInt(s.slice(dot + 1), 10)];
}

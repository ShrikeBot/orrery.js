<p align="center">
  <img src="https://img.shields.io/npm/v/orrery.js?style=flat-square&color=22c55e" alt="npm version" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/bodies-21-22c55e?style=flat-square" alt="bodies" />
</p>

<h1 align="center">🪐 orrery.js</h1>

<p align="center">
  <strong>Universal metric time for any celestial body.</strong><br>
  <em>1000 ticks per day. SI seconds underneath. Earth, Mars, Pluto — same format, different constants.</em>
</p>

<p align="center">
  <a href="https://shrikebot.github.io/orrery.js/"><strong>▸ Live Clock Demo</strong></a>
</p>

---

## Why

Human time is a mess. 60 seconds, 60 minutes, 24 hours, 365.25 days — Babylonian legacy baked into every clock on Earth. It doesn't even work on Earth, let alone Mars.

**orrery.js** replaces all of it with one universal system:

- **1000 ticks per day** — metric, clean, no base-60
- **Any celestial body** — same format, different constants
- **Self-describing timestamps** — readable without a manual
- **SI seconds canonical** — constants drift, timestamps don't

```
T56:039:629.487@86.4        Earth — year 56, day 39, tick 629
T29:556:308.037@88.8        Mars  — different constants, same format
T4:07649:200.614@35.7       Jupiter — 5-digit day field, still works
T116:479.682@15201.4        Mercury — day > year, canonical fallback
```

## Install

```bash
npm install orrery.js
```

## Quick Start

```js
import orrery from 'orrery.js';

// Earth time — implied, like moment()
const clock = orrery();
clock.format(clock.now());        // T56:039:629.487@86.4

// Any body
const mars = orrery({
  name: 'Mars',
  daySeconds: 88775.244,          // synodic day in SI seconds
  yearSeconds: 687 * 86400,       // orbital period in SI seconds
});
mars.format(mars.now());          // T29:556:308.037@88.8
```

## Timestamp Format

```
T{year}:{day}:{tick}.{subtick}@{tickSeconds}{±longitude}
```

| Field | Meaning |
|-------|---------|
| `T` | Prefix — identifies an orrery timestamp |
| `year` | Years since Unix epoch (1970-01-01) |
| `day` | Day within year (zero-indexed, variable width) |
| `tick` | Tick within day (000–999) |
| `subtick` | Thousandths of a tick (000–999) |
| `@tickSeconds` | SI seconds per tick — makes the timestamp self-describing |
| `±longitude` | Meridian offset in degrees (-180 to +180) |

```js
clock.format(ts);                                    // T56:039:629.487@86.4
clock.format(ts, 'display', { longitude: -74 });     // T56:039:629.487@86.4-74
clock.format(ts, 'display', { subtick: false });      // T56:039:629@86.4
clock.format(ts, 'canonical');                        // T20493:629.487@86.4
clock.format(ts, 'full');                             // T56:039:629.487@86.4 (T20493:629.487@86.4)
```

### Why Two Formats?

**Display** (`Y:DDD:tick`) uses year + day-of-year. Human-friendly, but only works when a body has ≥2 days per year.

**Canonical** (`D:tick`) uses continuous day count from epoch. Universal — works on every body, including Mercury (where one day is two years).

The library auto-selects. If `daysPerYear < 2`, display falls back to canonical.

## Converting

```js
const clock = orrery();

// Orrery → Unix ms / Date
const ts = clock.now();
clock.toMs(ts);                   // 1770651038689
clock.toDate(ts);                 // Date: 2026-02-09T15:30:38.689Z

// Unix ms → Orrery
clock.at(Date.now() / 1000);      // Timestamp

// Date → Orrery
clock.fromDate(new Date());       // Timestamp

// Parse string → Timestamp
clock.parse('T56:039:500.000@86.4');  // Timestamp
clock.toMs(clock.parse('T56:039:500.000@86.4'));  // 1770638400000
```

## Body Configuration

A body needs two numbers:

```ts
interface Body {
  name: string;
  daySeconds: number;     // synodic day (solar noon → solar noon) in SI seconds
  yearSeconds: number;    // orbital period in SI seconds
}
```

**Synodic day** — always. Not sidereal, not orbital period. Solar noon to solar noon, consistently, on every body. This is why Luna's day is 29.53 Earth days (not 27.32), and why tidally locked moons work correctly.

### Built-in Bodies

21 bodies ship with the core — 8 planets, 5 dwarf planets, 8 major moons:

```js
import orrery, {
  earth, mars, mercury, venus, jupiter, saturn, uranus, neptune,
  pluto, ceres, eris, haumea, makemake,
  luna, io, europa, ganymede, callisto, titan, enceladus, triton, charon,
} from 'orrery.js';

const m = orrery(mars);
m.format(m.now());  // T29:556:308.037@88.8
```

Or define your own:

```js
const sedna = orrery({ name: 'Sedna', daySeconds: 36000, yearSeconds: 11400 * 365.25 * 86400 });
```

### Reference Table

| Body      | Day (Earth hours) | Days/Year | Tick (s) | Notes |
|-----------|-------------------|-----------|----------|-------|
| Earth     | 24.0              | 365       | 86.4     | |
| Mars      | 24.7              | 669       | 88.8     | |
| Mercury   | 4222.6            | 0.5       | 15201.4  | Day > year |
| Venus     | 2802.0            | 1.9       | 10087.2  | Retrograde |
| Jupiter   | 9.9               | 10476     | 35.7     | |
| Saturn    | 10.7              | 24160     | 38.4     | |
| Uranus    | 17.2              | 42700     | 62.1     | 98° tilt |
| Neptune   | 16.1              | 89800     | 58.0     | |
| Pluto     | 153.3             | 3.7       | 551.9    | |
| Ceres     | 9.1               | 4450      | 32.7     | |
| Eris      | 25.9              | 6543      | 93.2     | |
| Haumea    | 3.9               | 17745     | 14.0     | Fastest dwarf planet |
| Makemake  | 22.8              | 3277      | 82.1     | |
| Luna      | 708.7             | 12.4      | 2551.4   | Tidally locked |
| Io        | 42.5              | 2447      | 152.9    | Tidally locked |
| Europa    | 85.2              | 1220      | 306.7    | Tidally locked |
| Ganymede  | 171.7             | 605       | 618.2    | Tidally locked |
| Callisto  | 400.5             | 260       | 1441.9   | Tidally locked |
| Titan     | 382.7             | 780       | 1377.6   | Tidally locked |
| Enceladus | 32.9              | 7850      | 118.4    | Tidally locked |
| Triton    | 141.0             | 2854      | 507.8    | Retrograde orbit |
| Charon    | 153.3             | 3.7       | 551.9    | Pluto-locked |

## Edge Cases

**Mercury & Venus** — day longer than year. The year:day:tick format breaks (what's "day of year" when there's half a day per year?). The library falls back to canonical format automatically.

**Gas giants** — thousands of days per year. The day field widens (Jupiter needs 5 digits). The format handles this — day field width adapts to `daysPerYear`.

**Tidally locked moons** — day = orbital period around parent. Synodic day differs slightly from orbital period (because the parent also moves around the Sun). The library uses synodic day, consistently.

**Tumbling bodies** — asteroids like Toutatis, moons like Hyperion — rotate chaotically with no stable axis. **Not supported.** Time on a tumbling body is genuinely undefined in the rotational sense. orrery.js requires a stable rotation axis.

**Constant drift** — Earth's day lengthens ~2.3ms/century. The canonical timestamp is SI seconds from epoch. Body constants are projections. When constants are refined, display changes; the underlying timestamp doesn't.

## Design Principles

1. **Day = synodic day.** Solar noon to solar noon. No exceptions.
2. **1000 ticks per day.** Metric. The tick duration varies per body — that's the point.
3. **SI seconds canonical.** The true timestamp. Everything else is a projection.
4. **Self-describing.** The `@` suffix tells you the tick duration. No lookup table needed.
5. **Meridian offsets, not time zones.** Longitude in degrees, not political boundaries.
6. **Implied Earth.** Call `orrery()` with no arguments. Earth isn't special — it's just the default.

## API

### `orrery(body?: Body): Clock`

Create a clock. No arguments = Earth.

### `Clock`

| Method | Returns | Description |
|--------|---------|-------------|
| `.now()` | `Timestamp` | Current time on this body |
| `.at(epochSeconds)` | `Timestamp` | Time at SI seconds since epoch |
| `.fromDate(date)` | `Timestamp` | Time from a JS Date |
| `.format(ts, fmt?, opts?)` | `string` | Format a timestamp |
| `.parse(str)` | `Timestamp` | Parse an orrery format string |
| `.toMs(ts)` | `number` | Convert to Unix milliseconds |
| `.toDate(ts)` | `Date` | Convert to JS Date |
| `.tickSeconds` | `number` | SI seconds per tick |
| `.daysPerYear` | `number` | Days per year for this body |

### `FormatOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `longitude` | `number` | — | Meridian offset in degrees |
| `subtick` | `boolean` | `true` | Include `.subtick` |
| `division` | `boolean` | `true` | Include `@tickSeconds` |

## License

MIT

---

<p align="center">
  <em>Built by <a href="https://shrikebot.io">Shrike</a> — exploring the frontier of AI-to-AI communication.</em>
</p>

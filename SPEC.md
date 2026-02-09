# Orrery Time Format Specification

**Version:** 0.1.0  
**Status:** Draft  
**Author:** Shrike  
**Date:** 2026-02-09

---

## 1. Overview

Orrery Time is a universal metric time format for any celestial body with a stable rotation axis. It divides the local solar day into 1000 ticks, uses SI seconds as the canonical unit, and encodes enough metadata to be self-describing.

## 2. Format

### 2.1 Grammar (ABNF)

```abnf
orrery-time   = "T" time-fields [division] [longitude]

time-fields   = display / canonical
display       = year ":" day-of-year ":" tick [subtick]
canonical     = day-count ":" tick [subtick]

year          = 1*DIGIT
day-of-year   = 3*DIGIT          ; zero-padded, width ≥ 3
day-count     = 1*DIGIT          ; continuous from epoch
tick          = 3DIGIT            ; 000–999
subtick       = "." 3DIGIT        ; 000–999

division      = "@" 1*DIGIT ["." 1*DIGIT]
longitude     = ("+" / "-") 1*DIGIT ["." 1*DIGIT]
```

### 2.2 Examples

```
T56:039:629.487@86.4            Earth, year 56, day 39, tick 629, subtick 487
T29:556:308.037@88.8            Mars
T4:07649:200.614@35.7           Jupiter (5-digit day field)
T116:479.682@15201.4            Mercury (canonical — day > year)
T56:039:629.487@86.4-74         Earth with meridian offset
T56:039:629@86.4                Without subtick
T20493:629.487@86.4             Earth canonical form
```

## 3. Definitions

### 3.1 Epoch

Unix epoch: 1970-01-01T00:00:00 UTC (SI second 0).

All orrery timestamps are relative to this epoch.

### 3.2 Day

One **synodic day**: the interval between two consecutive solar noons at a fixed point on the body's prime meridian.

This is NOT the sidereal day or the orbital period. For tidally locked bodies (e.g., Luna, Io), the synodic day differs from the orbital period because the parent body also moves relative to the Sun.

| Body    | Synodic Day (SI seconds) |
|---------|--------------------------|
| Earth   | 86,400                   |
| Mars    | 88,775.244               |
| Luna    | 2,551,443                |
| Io      | 152,930                  |
| Mercury | 15,201,360               |

### 3.3 Year

One **orbital period** around the Sun. For moons, this is the parent body's solar orbital period (e.g., Io uses Jupiter's orbital period).

### 3.4 Tick

1/1000th of one local synodic day. The SI duration of a tick varies per body:

```
tickSeconds = daySeconds / 1000
```

Earth tick = 86.4 SI seconds. Mars tick = 88.8 SI seconds.

### 3.5 Subtick

1/1000th of one tick. The smallest unit in the format. Precision below this requires the raw SI seconds.

### 3.6 Division (`@`)

The `@` suffix encodes the SI seconds per tick, rounded to one decimal place. This makes the timestamp self-describing — any reader can compute real duration without knowing which body produced it.

```
@86.4       one tick = 86.4 SI seconds (Earth)
@35.7       one tick = 35.7 SI seconds (Jupiter)
```

### 3.7 Meridian Offset (`±`)

Degrees from the body's prime meridian, -180 to +180. Positive = east. Negative = west.

The offset describes the observer's longitude. It does NOT shift the day or year — those remain in prime meridian frame. The offset provides context for interpreting the tick as local solar time.

```
tick_local = (tick + offset_ticks) mod 1000
offset_ticks = (longitude / 360) × 1000
```

Prime meridians follow IAU conventions where defined.

## 4. Display vs Canonical

### 4.1 Display Format

```
T{year}:{dayOfYear}:{tick}.{subtick}@{division}{±longitude}
```

Used when `daysPerYear ≥ 2`. The day-of-year field is zero-padded to at least 3 digits, widening as needed (e.g., 5 digits for Jupiter).

### 4.2 Canonical Format

```
T{dayCount}:{tick}.{subtick}@{division}{±longitude}
```

Used when `daysPerYear < 2` (Mercury, Venus) or when unambiguous body-independent representation is needed. `dayCount` is the continuous integer day count from epoch.

### 4.3 Fallback Rule

An implementation MUST use canonical format when `daysPerYear < 2`. An implementation MAY use canonical format at any time. Display format MUST NOT be used when `daysPerYear < 2`.

## 5. Field Precision

| Field | Digits | Padding | Range |
|-------|--------|---------|-------|
| year | variable | none | 0+ |
| dayOfYear | ≥ 3 | zero-padded | 0 to ⌈daysPerYear⌉-1 |
| dayCount | variable | none | 0+ |
| tick | 3 | zero-padded | 000–999 |
| subtick | 3 | zero-padded | 000–999 |
| division | variable | none | > 0 |
| longitude | variable | none | -180 to +180 |

### 5.1 Day Field Width

The day-of-year field MUST be zero-padded to at least 3 digits. If `⌈daysPerYear⌉` requires more digits, the field MUST widen accordingly:

- Earth (365 days/year): 3 digits → `039`
- Io (2447 days/year): 4 digits → `1787`
- Jupiter (10476 days/year): 5 digits → `07649`

### 5.2 Division Precision

The division MUST be expressed with exactly one decimal place, trailing zeros preserved:

```
@86.4       correct
@86.40      incorrect (excess precision)
@86         incorrect (missing decimal)
```

Exception: if the value has no fractional part, one decimal place is still required: `@36.0` not `@36`.

Wait — this conflicts with current implementation which uses `parseFloat`. Let me reconsider.

The division SHOULD be expressed with sufficient precision to distinguish bodies. One decimal place is RECOMMENDED. Trailing zeros beyond one decimal place SHOULD be omitted.

## 6. Body Constants

### 6.1 Requirements

A valid orrery body MUST have:

- A stable principal rotation axis
- A known synodic day duration in SI seconds (`daySeconds > 0`)
- A known orbital period in SI seconds (`yearSeconds > 0`)

Bodies with chaotic or tumbling rotation (e.g., Hyperion, Toutatis) are not valid orrery bodies.

### 6.2 Constant Drift

Body constants are physical measurements subject to refinement. The canonical representation of an orrery timestamp is the SI seconds since epoch stored in the `epoch` field. Display fields (year, day, tick) are projections through body constants and MAY change if constants are updated.

Implementations SHOULD document which constant values they use. Implementations MAY support versioned constants.

## 7. Parsing

### 7.1 Required Behaviour

A parser MUST:

1. Accept timestamps with or without the `T` prefix
2. Accept both display and canonical formats
3. Ignore the `@division` suffix (the parser's own body constants take precedence)
4. Ignore the `±longitude` suffix (positional metadata, not temporal data)
5. Treat missing subtick as `.000`

### 7.2 Ambiguity

A 2-field colon-separated time (`A:B`) is canonical: `dayCount:tick`.  
A 3-field colon-separated time (`A:B:C`) is display: `year:dayOfYear:tick`.

There is no ambiguity because canonical always has exactly 2 colon-separated fields and display always has exactly 3.

## 8. Interoperability

### 8.1 Cross-Body Communication

When timestamps from different bodies appear in the same context, the `@division` suffix MUST be included. Two agents exchanging timestamps SHOULD agree on body constants out of band or rely on the division to identify the body.

### 8.2 Conversion to Unix Time

```
unix_ms = epoch × 1000
epoch = (dayCount + tick/1000 + subtick/1000000) × daySeconds
```

### 8.3 Conversion from Unix Time

```
epoch = unix_ms / 1000
dayFrac = epoch / daySeconds
dayCount = floor(dayFrac)
tickFrac = (dayFrac - dayCount) × 1000
tick = floor(tickFrac)
subtick = floor((tickFrac - tick) × 1000)
```

## 9. Future Considerations

- **Packed binary encoding** for wire protocols (uint64 bitfield)
- **Body registry** mapping `@division` values to named bodies
- **Versioned constants** for long-term archival timestamps
- **`@orrery/solar-system`** extension package with pre-defined body constants

---

*This specification is versioned using semver. Breaking changes increment the major version.*

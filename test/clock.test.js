import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import orrery, { Clock, earth } from '../dist/index.js';

describe('orrery()', () => {
  it('returns Earth clock with no arguments', () => {
    const clock = orrery();
    assert.equal(clock.body.name, 'Earth');
    assert.equal(clock.tickSeconds, 86.4);
  });

  it('returns custom clock with body argument', () => {
    const mars = { name: 'Mars', daySeconds: 88775.244, yearSeconds: 687 * 86400 };
    const clock = orrery(mars);
    assert.equal(clock.body.name, 'Mars');
  });
});

describe('Earth (default)', () => {
  const clock = orrery();

  it('formats epoch correctly', () => {
    const ts = clock.at(0);
    assert.equal(clock.format(ts), 'T0:000:000.000@86.4');
    assert.equal(ts.year, 0);
    assert.equal(ts.dayOfYear, 0);
    assert.equal(ts.tick, 0);
    assert.equal(ts.subtick, 0);
  });

  it('computes year 56 for 2026', () => {
    const ts = clock.at(1770681600000);
    assert.equal(ts.year, 56);
    assert.ok(ts.dayOfYear >= 38 && ts.dayOfYear <= 41);
  });

  it('tick and subtick are 0-999', () => {
    const ts = clock.now();
    assert.ok(ts.tick >= 0 && ts.tick <= 999);
    assert.ok(ts.subtick >= 0 && ts.subtick <= 999);
  });

  it('format order: subtick, division, longitude', () => {
    const ts = clock.at(1770681600000);
    const fmt = clock.format(ts, 'display', { longitude: -74 });
    assert.match(fmt, /@86\.4-74$/);
  });

  it('positive longitude uses +', () => {
    const ts = clock.at(1770681600000);
    const fmt = clock.format(ts, 'display', { longitude: 137.4 });
    assert.match(fmt, /@86\.4\+137\.4$/);
  });

  it('can hide subtick', () => {
    const ts = clock.at(0);
    assert.equal(clock.format(ts, 'display', { subtick: false }), 'T0:000:000@86.4');
  });

  it('can hide division', () => {
    const ts = clock.at(0);
    assert.equal(clock.format(ts, 'display', { division: false }), 'T0:000:000.000');
  });

  it('bare format', () => {
    const ts = clock.at(0);
    assert.equal(clock.format(ts, 'display', { subtick: false, division: false }), 'T0:000:000');
  });

  it('full format shows both', () => {
    const ts = clock.at(1770681600000);
    const fmt = clock.format(ts, 'full');
    assert.ok(fmt.includes('('));
    assert.ok(fmt.includes(')'));
  });
});

describe('Mercury-like (day > year)', () => {
  const mercury = orrery({ name: 'Mercury', daySeconds: 15201360, yearSeconds: 87.969 * 86400 });

  it('falls back to canonical', () => {
    const ts = mercury.at(1770681600000);
    assert.equal(ts.year, null);
    assert.equal(ts.dayOfYear, null);
    assert.match(mercury.format(ts), /^T\d+:\d{3}\.\d{3}@/);
  });
});

describe('Jupiter-like (wide day field)', () => {
  const jupiter = orrery({ name: 'Jupiter', daySeconds: 35733, yearSeconds: 11.862 * 365.25 * 86400 });

  it('has 5-digit day field', () => {
    assert.match(jupiter.format(jupiter.at(1770681600000)), /^T\d+:\d{5}:\d{3}/);
  });

  it('tick division ~35.7', () => {
    assert.match(jupiter.format(jupiter.at(1770681600000)), /@35\.7/);
  });
});

describe('toMs / toDate', () => {
  const clock = orrery();

  it('toMs returns Unix milliseconds', () => {
    const ts = clock.at(1770681600000);
    assert.equal(clock.toMs(ts), 1770681600000);
  });

  it('toDate returns a Date', () => {
    const ts = clock.at(1770681600000);
    const d = clock.toDate(ts);
    assert.ok(d instanceof Date);
    assert.equal(d.getTime(), 1770681600000);
  });
});

describe('parse', () => {
  const clock = orrery();

  it('roundtrips display format', () => {
    const ts = clock.at(1770681600000);
    const str = clock.format(ts);
    const parsed = clock.parse(str);
    assert.equal(parsed.year, ts.year);
    assert.equal(parsed.dayOfYear, ts.dayOfYear);
    assert.equal(parsed.tick, ts.tick);
    assert.equal(parsed.subtick, ts.subtick);
  });

  it('roundtrips canonical format', () => {
    const ts = clock.at(1770681600000);
    const str = clock.format(ts, 'canonical');
    const parsed = clock.parse(str);
    assert.equal(parsed.dayInt, ts.dayInt);
    assert.equal(parsed.tick, ts.tick);
  });

  it('handles format with longitude', () => {
    const ts = clock.at(1770681600000);
    const str = clock.format(ts, 'display', { longitude: -74 });
    const parsed = clock.parse(str);
    assert.equal(parsed.tick, ts.tick);
  });

  it('handles bare format (no subtick, no division)', () => {
    const ts = clock.at(1770681600000);
    const str = clock.format(ts, 'display', { subtick: false, division: false });
    const parsed = clock.parse(str);
    assert.equal(parsed.dayInt, ts.dayInt);
    assert.equal(parsed.tick, ts.tick);
  });
});

describe('Custom body', () => {
  it('works with arbitrary constants', () => {
    const ceres = orrery({ name: 'Ceres', daySeconds: 32668, yearSeconds: 4.6 * 365.25 * 86400 });
    const ts = ceres.now();
    assert.ok(ts.dayInt > 0);
    assert.match(ceres.format(ts), /@32\.7/);
  });
});

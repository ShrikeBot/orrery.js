export type { Body } from './bodies.js';
export type { Timestamp, Format, FormatOptions } from './clock.js';
export { Clock } from './clock.js';
export { earth } from './bodies.js';

import { Clock } from './clock.js';
import { earth } from './bodies.js';
import type { Body } from './bodies.js';

/**
 * Create a Clock for a celestial body.
 *
 * Call with no arguments for Earth (default).
 * Pass a Body config for any other body.
 *
 *   orrery()                  // Earth clock
 *   orrery(mars)              // Mars clock (from @orrery/solar-system)
 *   orrery({ name: 'Ceres', daySeconds: 32668, yearSeconds: ... })
 *
 *   orrery().now()            // current Earth time
 *   orrery().format(orrery().now())  // T56:039:629.487@86.4
 */
function orrery(body?: Body): Clock {
  return new Clock(body ?? earth);
}

// Attach types and earth to the function for convenience
orrery.Clock = Clock;
orrery.earth = earth;

export default orrery;

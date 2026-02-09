export type { Body } from './bodies.js';
export type { Timestamp, Format, FormatOptions } from './clock.js';
export { Clock } from './clock.js';
export {
  bodies,
  earth, mars, mercury, venus, jupiter, saturn, uranus, neptune,
  pluto, ceres, eris, haumea, makemake,
  luna, io, europa, ganymede, callisto, titan, enceladus, triton, charon,
} from './bodies.js';

import { Clock } from './clock.js';
import { earth } from './bodies.js';
import type { Body } from './bodies.js';

/**
 * Create a Clock for a celestial body.
 *
 *   orrery()              // Earth (implied)
 *   orrery(mars)          // Mars
 *   orrery({ name: 'X', daySeconds: ..., yearSeconds: ... })  // custom
 */
function orrery(body?: Body): Clock {
  return new Clock(body ?? earth);
}

export default orrery;

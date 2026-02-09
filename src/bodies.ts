/**
 * Celestial body configuration.
 *
 * daySeconds:   synodic day (solar noon to solar noon) in SI seconds
 * yearSeconds:  orbital period in SI seconds
 * name:         display name
 */
export interface Body {
  name: string;
  daySeconds: number;
  yearSeconds: number;
}

/** Earth — the default body. */
export const earth: Body = {
  name: 'Earth',
  daySeconds: 86400,
  yearSeconds: 365.25 * 86400,
};

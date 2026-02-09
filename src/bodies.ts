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

// Planets
export const earth: Body   = { name: 'Earth',   daySeconds: 86400,      yearSeconds: 365.25 * 86400 };
export const mars: Body    = { name: 'Mars',     daySeconds: 88775.244,  yearSeconds: 687.0 * 86400 };
export const mercury: Body = { name: 'Mercury',  daySeconds: 15201360,   yearSeconds: 87.969 * 86400 };
export const venus: Body   = { name: 'Venus',    daySeconds: 10087200,   yearSeconds: 224.701 * 86400 };
export const jupiter: Body = { name: 'Jupiter',  daySeconds: 35733,      yearSeconds: 11.862 * 365.25 * 86400 };
export const saturn: Body  = { name: 'Saturn',   daySeconds: 38362,      yearSeconds: 29.457 * 365.25 * 86400 };
export const uranus: Body  = { name: 'Uranus',   daySeconds: 62064,      yearSeconds: 84.011 * 365.25 * 86400 };
export const neptune: Body = { name: 'Neptune',  daySeconds: 57996,      yearSeconds: 164.8 * 365.25 * 86400 };

// Dwarf planets
export const pluto: Body   = { name: 'Pluto',    daySeconds: 551856.7,   yearSeconds: 248.09 * 365.25 * 86400 };
export const ceres: Body   = { name: 'Ceres',    daySeconds: 32668,      yearSeconds: 4.6 * 365.25 * 86400 };
export const eris: Body    = { name: 'Eris',     daySeconds: 93240,      yearSeconds: 559.07 * 365.25 * 86400 };
export const haumea: Body  = { name: 'Haumea',   daySeconds: 14040,      yearSeconds: 283.28 * 365.25 * 86400 };
export const makemake: Body = { name: 'Makemake', daySeconds: 82080,     yearSeconds: 306.21 * 365.25 * 86400 };

// Major moons
export const luna: Body     = { name: 'Luna',     daySeconds: 2551443,   yearSeconds: 365.25 * 86400 };
export const io: Body       = { name: 'Io',       daySeconds: 152930,    yearSeconds: 11.862 * 365.25 * 86400 };
export const europa: Body   = { name: 'Europa',   daySeconds: 306720,    yearSeconds: 11.862 * 365.25 * 86400 };
export const ganymede: Body = { name: 'Ganymede', daySeconds: 618153.6,  yearSeconds: 11.862 * 365.25 * 86400 };
export const callisto: Body = { name: 'Callisto', daySeconds: 1441929.6, yearSeconds: 11.862 * 365.25 * 86400 };
export const titan: Body    = { name: 'Titan',    daySeconds: 1377648,   yearSeconds: 29.457 * 365.25 * 86400 };
export const enceladus: Body = { name: 'Enceladus', daySeconds: 118386.4, yearSeconds: 29.457 * 365.25 * 86400 };
export const triton: Body   = { name: 'Triton',   daySeconds: 507772.8,  yearSeconds: 164.8 * 365.25 * 86400 };
export const charon: Body   = { name: 'Charon',   daySeconds: 551856.7,  yearSeconds: 248.09 * 365.25 * 86400 };

/** All built-in bodies indexed by lowercase name */
export const bodies: Record<string, Body> = {
  earth, mars, mercury, venus, jupiter, saturn, uranus, neptune,
  pluto, ceres, eris, haumea, makemake,
  luna, io, europa, ganymede, callisto, titan, enceladus, triton, charon,
};

import rateLimit from 'express-rate-limit';

// Login/register: the endpoints most worth protecting from brute-force
// guessing. Keyed by IP; 10 attempts per 15 minutes is generous for a real
// user who mistypes a password a few times, tight for a script guessing them.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});

// A looser ceiling across the rest of the API, mainly to blunt scripted
// abuse/scraping rather than to constrain normal usage.
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});
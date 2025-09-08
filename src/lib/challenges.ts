// src/lib/challenges.ts
const store = new Map<string, number>(); // challenge -> expiresAt

export function createChallenge(ttlMs = 2 * 60 * 1000) {
  const challenge = cryptoRandomHex(16);
  store.set(challenge, Date.now() + ttlMs);
  return { challenge, ttlMs };
}

export function consumeChallenge(challenge: string): boolean {
  const exp = store.get(challenge);
  if (!exp) return false;
  const ok = Date.now() <= exp;
  store.delete(challenge);
  return ok;
}

// Node-safe random hex (no browser APIs here)
function cryptoRandomHex(nBytes: number) {
  const { randomBytes } = require('crypto');
  return randomBytes(nBytes).toString('hex');
}

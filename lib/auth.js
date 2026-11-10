import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 jam

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET (min. 32 karakter) belum diset.');
  return value;
}

const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('hex');

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Bandingkan password dengan ADMIN_PASSWORD (constant-time lewat hash). */
export function passwordMatches(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof input !== 'string') return false;
  const digest = (value) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(input), digest(expected));
}

export async function createSession() {
  const payload = String(Date.now() + MAX_AGE_SECONDS * 1000);
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  return Number(payload) > Date.now();
}

/** Panggil di SETIAP page dan Server Action yang butuh admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/login');
}
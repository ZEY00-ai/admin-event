import { timingSafeEqual } from 'node:crypto';
import { runArchiveJob } from '@/lib/archive';

export const maxDuration = 60;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const results = await runArchiveJob();
    return Response.json({ ok: true, results });
  } catch (error) {
    console.error('[cron] archive gagal:', error);
    return Response.json({ ok: false, error: 'internal error' }, { status: 500 });
  }
}
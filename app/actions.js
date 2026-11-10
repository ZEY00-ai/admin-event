'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { archiveEvent } from '@/lib/archive';
import {
  createSession,
  destroySession,
  passwordMatches,
  requireAdmin,
} from '@/lib/auth';
import {
  clearLoginFailures,
  countRegistrants,
  createEvent,
  deleteEvent,
  getEvent,
  isLoginBlocked,
  recordLoginFailure,
  saveEvent,
} from '@/lib/storage';
import { validateEvent } from '@/lib/validation';

const FIELDS = ['id', 'name', 'date', 'quota', 'open'];
const readFields = (formData) => Object.fromEntries(FIELDS.map((f) => [f, formData.get(f)]));
const fail = (message, values, errors = {}) => ({ success: false, message, values, errors });

// ---------- auth ----------
export async function loginAction(_prev, formData) {
  const forwarded = (await headers()).get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim() || 'unknown';

  if (await isLoginBlocked(ip)) {
    return { message: 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.' };
  }
  if (!passwordMatches(formData.get('password'))) {
    await recordLoginFailure(ip);
    return { message: 'Password salah.' };
  }
  await clearLoginFailures(ip);
  await createSession();
  redirect('/');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

// ---------- event ----------
export async function createEventAction(_prev, formData) {
  await requireAdmin();

  const result = validateEvent(readFields(formData), { requireId: true });
  if (!result.ok) return fail('Periksa isian yang ditandai.', result.values, result.errors);

  const created = await createEvent(result.data);
  if (!created) {
    return fail('ID event sudah dipakai.', result.values, { id: 'ID ini sudah dipakai event lain.' });
  }
  revalidatePath('/');
  redirect(`/events/${result.data.id}`);
}

// Di-bind di page: updateEventAction.bind(null, id)
export async function updateEventAction(id, _prev, formData) {
  await requireAdmin();

  const existing = await getEvent(id);
  if (!existing) return fail('Event tidak ditemukan.', {});

  const result = validateEvent({ ...readFields(formData), id }, { requireId: false });
  if (!result.ok) return fail('Periksa isian yang ditandai.', result.values, result.errors);

  const registrants = await countRegistrants(id);
  if (result.data.quota < registrants) {
    return fail(`Kuota tidak boleh di bawah jumlah pendaftar (${registrants}).`, result.values, {
      quota: `Sudah ada ${registrants} pendaftar.`,
    });
  }

  await saveEvent({ ...result.data, id }); // id tidak pernah berubah
  revalidatePath('/');
  revalidatePath(`/events/${id}`);
  return { success: true, message: 'Event berhasil disimpan.', values: result.values, errors: {} };
}

export async function toggleOpenAction(id) {
  await requireAdmin();
  const event = await getEvent(id);
  if (!event) return;
  await saveEvent({ ...event, open: !event.open });
  revalidatePath('/');
  revalidatePath(`/events/${id}`);
}

export async function deleteEventAction(id) {
  await requireAdmin();
  if ((await countRegistrants(id)) > 0) return; // event berpendaftar: tutup saja, jangan hapus
  await deleteEvent(id);
  revalidatePath('/');
  redirect('/');
}
// Di-bind di page: archiveEventAction.bind(null, id)
export async function archiveEventAction(id) {
  await requireAdmin();
  const event = await getEvent(id);
  if (!event) return { message: 'Event tidak ditemukan.' };

  const result = await archiveEvent(event);
  if (result.status === 'failed') {
    return { message: `Gagal menulis ke spreadsheet: ${result.error} Event TIDAK dihapus.` };
  }
  if (result.status === 'changed') {
    return { message: 'Ada pendaftar baru saat pengarsipan. Event tidak dihapus, coba lagi.' };
  }
  revalidatePath('/');
  redirect('/');
}
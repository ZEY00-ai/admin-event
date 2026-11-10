import { appendToSheet } from './sheets';
import { deleteEventIfUnchanged, getEvents, listRegistrants, saveEvent } from './storage';

export const ARCHIVE_AFTER_DAYS = 7; // dihitung dari tanggal & jam mulai event
const DAY_MS = 24 * 60 * 60 * 1000;

export const hasEnded = (event, now = Date.now()) => now > new Date(event.date).getTime();

export const isArchivable = (event, now = Date.now()) =>
  now > new Date(event.date).getTime() + ARCHIVE_AFTER_DAYS * DAY_MS;

// Urutan kolom HARUS sama dengan HEADERS di Apps Script.
export function buildRows(event, registrants, archivedAt) {
  return registrants.map((r) => [
    event.id,
    event.date,
    r.number,
    event.name,
    r.name,
    r.discord,
    r.whatsapp ?? '',
    r.note ?? '',
    r.createdAt ?? '',
    archivedAt,
  ]);
}

/** Arsipkan satu event ke Sheets lalu hapus. Event tidak dihapus jika penulisan gagal. */
export async function archiveEvent(event) {
  // 1. Tutup dulu agar tidak ada pendaftar baru saat proses berjalan
  if (event.open) await saveEvent({ ...event, open: false });

  // 2. Tulis ke spreadsheet (dilewati jika memang tidak ada pendaftar)
  const registrants = await listRegistrants(event.id);
  if (registrants.length > 0) {
    const sheet = await appendToSheet(buildRows(event, registrants, new Date().toISOString()));
    if (!sheet.ok) return { id: event.id, status: 'failed', error: sheet.error };
  }

  // 3. Hapus hanya jika tidak ada pendaftar baru sejak dibaca
  const deleted = await deleteEventIfUnchanged(event.id, registrants.length);
  return deleted
    ? { id: event.id, status: 'archived', count: registrants.length }
    : { id: event.id, status: 'changed' };
}

/** Dipanggil cron: tutup event yang sudah lewat, arsipkan yang lewat > ARCHIVE_AFTER_DAYS. */
export async function runArchiveJob(now = Date.now()) {
  const events = await getEvents();
  const results = [];

  for (const event of events) {
    try {
      if (isArchivable(event, now)) {
        results.push(await archiveEvent(event));
      } else if (hasEnded(event, now) && event.open) {
        await saveEvent({ ...event, open: false });
        results.push({ id: event.id, status: 'closed' });
      }
    } catch (error) {
      console.error('[archive] error pada event', event.id, error);
      results.push({ id: event.id, status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  }
  return results;
}
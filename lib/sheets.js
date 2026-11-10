// Hanya bertugas mengirim baris ke Google Apps Script. Tidak pernah melempar error.
const TIMEOUT_MS = 20000;

export async function appendToSheet(rows) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  const token = process.env.SHEETS_WEBHOOK_TOKEN;
  if (!url || !token) {
    return { ok: false, error: 'SHEETS_WEBHOOK_URL / SHEETS_WEBHOOK_TOKEN belum diset.' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, rows }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!response.ok) return { ok: false, error: `Sheets membalas status ${response.status}.` };

    const result = await response.json();
    if (!result.ok) return { ok: false, error: result.error ?? 'Sheets menolak permintaan.' };
    if (result.received !== rows.length) {
      return { ok: false, error: 'Jumlah baris yang diterima Sheets tidak cocok.' };
    }
    return { ok: true, appended: result.appended };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Gagal menghubungi Sheets.' };
  }
}
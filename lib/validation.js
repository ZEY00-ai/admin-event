// Validasi MURNI untuk input event dari dashboard.
const asString = (value) => (typeof value === 'string' ? value : '');
const clean = (value) => asString(value).normalize('NFKC').replace(/\s+/g, ' ').trim();

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const LIMITS = Object.freeze({
  id: { min: 3, max: 40 },
  name: { min: 3, max: 80 },
  quota: { min: 1, max: 10000 },
});

/**
 * @param raw nilai mentah FormData: id, name, date, quota, open
 * @param {{ requireId: boolean }} options  false saat edit (id diambil dari URL, bukan form)
 */
export function validateEvent(raw, { requireId }) {
  const values = {
    id: clean(raw.id).toLowerCase(),
    name: clean(raw.name),
    date: clean(raw.date),
    quota: clean(raw.quota),
    open: raw.open === 'on',
  };
  const errors = {};

  if (requireId) {
    if (!values.id) errors.id = 'ID event wajib diisi.';
    else if (values.id.length < LIMITS.id.min || values.id.length > LIMITS.id.max)
      errors.id = `ID harus ${LIMITS.id.min}-${LIMITS.id.max} karakter.`;
    else if (!SLUG.test(values.id))
      errors.id = 'ID hanya boleh huruf kecil, angka, dan tanda hubung (contoh: workshop-nextjs).';
  }

  if (!values.name) errors.name = 'Nama event wajib diisi.';
  else if (values.name.length < LIMITS.name.min || values.name.length > LIMITS.name.max)
    errors.name = `Nama harus ${LIMITS.name.min}-${LIMITS.name.max} karakter.`;

  if (!values.date) errors.date = 'Tanggal dan jam wajib diisi.';
  else if (!DATETIME_LOCAL.test(values.date) || Number.isNaN(Date.parse(`${values.date}:00+07:00`)))
    errors.date = 'Format tanggal tidak valid.';

  const quota = Number(values.quota);
  if (!values.quota) errors.quota = 'Kuota wajib diisi.';
  else if (!/^\d+$/.test(values.quota) || quota < LIMITS.quota.min || quota > LIMITS.quota.max)
    errors.quota = `Kuota harus bilangan bulat ${LIMITS.quota.min}-${LIMITS.quota.max}.`;

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    values,
    // Waktu input dianggap WIB.
    data: ok ? { id: values.id, name: values.name, date: `${values.date}:00+07:00`, quota, open: values.open } : null,
  };
}
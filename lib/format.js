export function formatRegistrationNumber(number) {
  return `#${String(number).padStart(3, '0')}`;
}

export function formatEventDate(iso) {
  const text = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso));
  return `${text} WIB`;
}

// Tanggal disimpan sebagai "YYYY-MM-DDTHH:mm:00+07:00", jadi 16 karakter pertama
// cocok langsung dengan <input type="datetime-local">.
export const toInputValue = (iso) => (iso ? iso.slice(0, 16) : '');
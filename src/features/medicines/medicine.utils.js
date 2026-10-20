const collator = new Intl.Collator('es-MX', { sensitivity: 'base' });

export function normalizeSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es-MX')
    .trim();
}

export function searchMedicines(medicines, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [...medicines];

  return medicines.filter((medicine) => (
    normalizeSearchText(medicine.nombre).includes(normalizedQuery)
    || normalizeSearchText(medicine.nombreGenerico).includes(normalizedQuery)
  ));
}

export function sortMedicinesByName(medicines) {
  return [...medicines].sort((a, b) => collator.compare(a.nombre, b.nombre));
}

function civilDateToLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysUntilExpiry(expiryDate, today = new Date()) {
  const expiry = civilDateToLocalDate(expiryDate);
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((expiry.getTime() - localToday.getTime()) / 86_400_000);
}

export function getExpiryStatus(expiryDate, today = new Date()) {
  const days = getDaysUntilExpiry(expiryDate, today);
  if (days < 0) return 'red';
  if (days <= 30) return 'yellow';
  return 'green';
}

export function formatCivilDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

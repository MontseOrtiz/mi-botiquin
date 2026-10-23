import { isValidCivilDate } from '../medicines/medicine.schema.js';
import { MEDICINE_FORMS } from '../medicines/medicine.types.js';

function parseRows(csv) {
  const text = String(csv).replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field.length === 0) quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (quoted) throw new Error('El CSV tiene un campo entre comillas sin cerrar.');
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((values) => values.some((value) => value.trim() !== ''));
}

function normalizeHeader(value) {
  return value.trim().replace(/([a-z0-9])([A-Z])/g, '$1 $2').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es-MX')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function toRecords(csv, requiredHeaderGroups) {
  const [headerRow, ...dataRows] = parseRows(csv);
  if (!headerRow?.length) throw new Error('El CSV está vacío o no tiene encabezados.');
  const headers = headerRow.map(normalizeHeader);
  for (const group of requiredHeaderGroups) {
    if (!group.some((name) => headers.includes(normalizeHeader(name)))) {
      throw new Error(`Falta el encabezado requerido: ${group[0]}.`);
    }
  }
  return dataRows.map((row, rowIndex) => Object.fromEntries(headers.map((header, index) => [header, (row[index] || '').trim()])))
    .filter((record) => Object.values(record).some(Boolean))
    .map((record, index) => ({ ...record, __row: index + 2 }));
}

function value(record, ...names) {
  for (const name of names) {
    const found = record[normalizeHeader(name)];
    if (found !== undefined) return found;
  }
  return '';
}

function required(record, label, ...names) {
  const found = value(record, ...names);
  if (!found) throw new Error(`Falta “${label}” en la fila ${record.__row}.`);
  return found;
}

export function parseMedicinesCsv(csv) {
  return toRecords(csv, [
    ['nombre', 'nombre comercial', 'medicamento'],
    ['dosis'],
    ['cantidad', 'unidades'],
    ['vencimiento', 'fecha de vencimiento'],
  ]).map((record) => {
    const nombre = required(record, 'Nombre comercial', 'nombre', 'nombre comercial', 'medicamento');
    const dosis = required(record, 'Dosis', 'dosis');
    const forma = (value(record, 'forma') || 'otro').toLocaleLowerCase('es-MX');
    const cantidad = Number(required(record, 'Cantidad', 'cantidad', 'unidades'));
    const unidad = value(record, 'unidad', 'tipo de unidad') || 'unidades';
    const vencimiento = required(record, 'Vencimiento', 'vencimiento', 'fecha de vencimiento');
    if (!Number.isSafeInteger(cantidad) || cantidad < 0) throw new Error(`La cantidad debe ser un entero no negativo (fila ${record.__row}).`);
    if (!MEDICINE_FORMS.includes(forma)) throw new Error(`La forma del medicamento no es válida (fila ${record.__row}).`);
    if (!isValidCivilDate(vencimiento)) throw new Error(`El vencimiento debe usar AAAA-MM-DD (fila ${record.__row}).`);
    const now = new Date().toISOString();
    return {
      id: value(record, 'id') || `medicine-${record.__row}-${nombre.toLocaleLowerCase('es-MX').replace(/\s+/g, '-')}`,
      nombre,
      nombreGenerico: value(record, 'nombre genérico', 'nombre generico', 'generico') || undefined,
      dosis,
      forma,
      cantidad,
      unidad,
      vencimiento,
      notas: value(record, 'notas') || undefined,
      createdAt: value(record, 'createdAt', 'creado') || now,
      updatedAt: value(record, 'updatedAt', 'actualizado') || now,
    };
  });
}

export function parseSuppliesCsv(csv) {
  return toRecords(csv, [
    ['nombre', 'insumo', 'articulo', 'artículo'],
    ['unidad'],
    ['cantidad', 'unidades'],
  ]).map((record) => {
    const nombre = required(record, 'Nombre', 'nombre', 'insumo', 'articulo', 'artículo');
    const unidad = required(record, 'Unidad', 'unidad', 'tipo de unidad');
    const cantidad = Number(required(record, 'Cantidad', 'cantidad', 'unidades'));
    if (!Number.isSafeInteger(cantidad) || cantidad < 0) throw new Error(`La cantidad debe ser un entero no negativo (fila ${record.__row}).`);
    return {
      id: value(record, 'id') || `supply-${record.__row}-${nombre.toLocaleLowerCase('es-MX').replace(/\s+/g, '-')}`,
      nombre,
      cantidad,
      unidad,
      notas: value(record, 'notas') || undefined,
    };
  });
}

import { useEffect, useRef, useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { MEDICINE_FORMS } from '../medicine.types.js';
import { validateMedicine } from '../medicine.schema.js';

const emptyForm = {
  nombre: '', nombreGenerico: '', dosis: '', forma: '', cantidad: 0, vencimiento: '', notas: '',
};

export default function MedicineFormDialog({ open, medicine, onClose, onSave, busy = false }) {
  const dialogRef = useRef(null);
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(medicine ? { ...emptyForm, ...medicine } : emptyForm);
      setErrors({});
      setSaveError('');
    }
  }, [open, medicine]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function changeField(event) {
    const { name, value, type } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSaveError('');
  }

  async function submit(event) {
    event.preventDefault();
    const validation = validateMedicine(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    try {
      await onSave(validation.value);
      onClose();
    } catch (error) {
      if (error.validationErrors) setErrors(error.validationErrors);
      else setSaveError('No pudimos guardar los cambios. Intentá de nuevo.');
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="max-h-[90vh] w-[calc(100%-32px)] max-w-xl rounded-xl border border-fog-gray bg-paper-white p-5 text-ink-black backdrop:bg-ink-black/40"
      aria-labelledby="medicine-form-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialogRef.current) onClose(); }}
    >
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <div className="flex items-start justify-between gap-4">
          <h2 id="medicine-form-title" className="text-2xl font-normal">
            {medicine ? 'Editar medicamento' : 'Agregar medicamento'}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar formulario">Cerrar</Button>
        </div>

        <Input id="medicine-name" label="Nombre" name="nombre" value={values.nombre} onChange={changeField} error={errors.nombre} required />
        <Input id="medicine-generic" label="Nombre genérico (opcional)" name="nombreGenerico" value={values.nombreGenerico} onChange={changeField} />
        <Input id="medicine-dose" label="Dosis" name="dosis" value={values.dosis} onChange={changeField} error={errors.dosis} required />

        <div className="grid gap-2">
          <label className="text-base" htmlFor="medicine-form">Forma</label>
          <select
            className="min-h-12 rounded-lg border border-fog-gray bg-paper-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt-violet aria-[invalid=true]:border-expiry-red"
            id="medicine-form"
            name="forma"
            value={values.forma}
            onChange={changeField}
            aria-invalid={Boolean(errors.forma)}
            aria-describedby={errors.forma ? 'medicine-form-error' : undefined}
            required
          >
            <option value="">Elegí una forma</option>
            {MEDICINE_FORMS.map((form) => <option key={form} value={form}>{form}</option>)}
          </select>
          {errors.forma && <p id="medicine-form-error" className="text-base text-expiry-red" role="alert">{errors.forma}</p>}
        </div>

        <Input id="medicine-quantity" label="Cantidad" name="cantidad" type="number" min="0" step="1" value={values.cantidad} onChange={changeField} error={errors.cantidad} required />
        <Input id="medicine-expiry" label="Vencimiento" name="vencimiento" type="date" value={values.vencimiento} onChange={changeField} error={errors.vencimiento} required />
        <div className="grid gap-2">
          <label className="text-base" htmlFor="medicine-notes">Notas (opcional)</label>
          <textarea
            className="min-h-24 rounded-lg border border-fog-gray bg-paper-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt-violet"
            id="medicine-notes"
            name="notas"
            value={values.notas}
            onChange={changeField}
          />
        </div>

        {saveError && <p className="text-base text-expiry-red" role="alert">{saveError}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar medicamento'}</Button>
        </div>
      </form>
    </dialog>
  );
}

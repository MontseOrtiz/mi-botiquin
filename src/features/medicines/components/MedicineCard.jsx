import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import Card from '../../../components/ui/Card.jsx';
import { formatCivilDate, getExpiryStatus } from '../medicine.utils.js';

const statusLabel = {
  green: 'Vence',
  yellow: 'Vence pronto',
  red: 'Vencido',
};

export default function MedicineCard({ medicine, onEdit, onDelete, onDecrement, busy = false }) {
  const status = getExpiryStatus(medicine.vencimiento);

  return (
    <Card className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-normal leading-tight">{medicine.nombre}</h2>
          {medicine.nombreGenerico && <p className="mt-1 text-base text-steel-gray">{medicine.nombreGenerico}</p>}
        </div>
        <Badge tone={status} aria-label={`${statusLabel[status]}: ${formatCivilDate(medicine.vencimiento)}`}>
          {statusLabel[status]} · {formatCivilDate(medicine.vencimiento)}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-base">
        <div>
          <dt className="text-steel-gray">Dosis</dt>
          <dd>{medicine.dosis}</dd>
        </div>
        <div>
          <dt className="text-steel-gray">Forma</dt>
          <dd className="capitalize">{medicine.forma}</dd>
        </div>
        <div>
          <dt className="text-steel-gray">Cantidad</dt>
          <dd>{medicine.cantidad}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => onDecrement(medicine)} disabled={busy || medicine.cantidad === 0}>
          Tomé una unidad
        </Button>
        <Button variant="ghost" onClick={() => onEdit(medicine)} disabled={busy}>
          Editar
        </Button>
        <Button variant="ghost" onClick={() => onDelete(medicine)} disabled={busy}>
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

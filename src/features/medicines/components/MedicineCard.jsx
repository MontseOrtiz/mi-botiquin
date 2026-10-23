import Badge from '../../../components/ui/Badge.jsx';
import Card from '../../../components/ui/Card.jsx';
import { formatCivilDate, getExpiryStatus } from '../medicine.utils.js';

const statusLabel = {
  green: 'Vence',
  yellow: 'Vence pronto',
  red: 'Vencido',
};

export default function MedicineCard({ medicine }) {
  const status = getExpiryStatus(medicine.vencimiento);

  return (
    <Card className="medicine-card">
      <details className="medicine-disclosure">
        <summary className="medicine-summary">
          <div className="medicine-summary-copy">
            <h3 className="medicine-name break-words font-display">{medicine.nombre}</h3>
            {medicine.nombreGenerico && <p className="mt-1 break-words text-sm text-brand-text-muted">{medicine.nombreGenerico}</p>}
          </div>
          <span className="medicine-expand-mark" aria-hidden="true">+</span>
          <div className="medicine-summary-meta">
            <span><span className="eyebrow mr-2">Dosis</span><strong>{medicine.dosis}</strong></span>
            <span><span className="eyebrow mr-2">Disponible</span><strong>{medicine.cantidad} {medicine.unidad || 'unidades'}</strong></span>
          </div>
        </summary>
        <div className="medicine-disclosure-content">
          <dl className="medicine-extra-details">
            <div>
              <dt className="eyebrow">Forma</dt>
              <dd className="capitalize">{medicine.forma}</dd>
            </div>
            <div>
              <dt className="eyebrow">Vencimiento</dt>
              <dd><Badge tone={status} aria-label={`${statusLabel[status]}: ${formatCivilDate(medicine.vencimiento)}`}>{statusLabel[status]} · {formatCivilDate(medicine.vencimiento)}</Badge></dd>
            </div>
            {medicine.notas && <div><dt className="eyebrow">Notas</dt><dd>{medicine.notas}</dd></div>}
          </dl>
        </div>
      </details>
    </Card>
  );
}

import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';

export default function SearchInput({ value, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <Input
        id="medicine-search"
        label="Buscar medicamento"
        type="search"
        placeholder="Nombre o nombre genérico"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <Button variant="ghost" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          Limpiar
        </Button>
      )}
    </div>
  );
}

export default function SupplyList({ supplies, query }) {
  if (!supplies.length) {
    return <p className="inventory-source-empty">{query ? 'No encontramos insumos con esa búsqueda.' : 'No hay insumos disponibles para mostrar.'}</p>;
  }

  return (
    <ul className="supplies-list" aria-label="Insumos del botiquín">
      {supplies.map((item) => (
        <li className="supply-row" key={item.id}>
          <div><h3>{item.nombre}</h3>{item.notas && <p>{item.notas}</p>}</div>
          <strong>{item.cantidad} {item.unidad}</strong>
        </li>
      ))}
    </ul>
  );
}

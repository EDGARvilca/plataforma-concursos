/**
 * Barras horizontales hechas con HTML y CSS.
 * Cada barra mide su valor respecto al más grande de la lista.
 */
export default function GraficoBarras({ datos, vacio = 'Aún no hay datos para mostrar.' }) {
  const maximo = Math.max(...datos.map((d) => d.valor), 0)
  if (maximo === 0) return <p className="text-secondary small mb-0">{vacio}</p>

  return (
    <div className="grafico-barras">
      {datos.map((dato) => (
        <div className="barra-fila" key={dato.etiqueta}>
          <span className="barra-etiqueta">{dato.etiqueta}</span>
          <div className="barra-pista">
            <div className="barra-relleno" style={{ width: `${(dato.valor / maximo) * 100}%`, background: dato.color }} />
          </div>
          <strong className="barra-valor">{dato.valor}</strong>
        </div>
      ))}
    </div>
  )
}
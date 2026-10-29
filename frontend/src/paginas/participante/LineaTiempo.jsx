/** Línea de tiempo del proyecto: Inscrito → Validado → Evaluación → Resultado (WF19). */
export default function LineaTiempo({ etapas, actual }) {
  return (
    <div className="linea-tiempo">
      {etapas.map((nombre, posicion) => (
        <div key={nombre} className={`etapa ${posicion <= actual ? 'hecha' : ''} ${posicion === actual ? 'actual' : ''}`}>
          <b>{posicion < actual ? '✓' : posicion + 1}</b>
          {nombre}
        </div>
      ))}
    </div>
  )
}
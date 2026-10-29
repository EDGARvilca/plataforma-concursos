/** Lista de integrantes con botón para agregar o quitar (WF09: "+ Agregar integrante"). */
export default function CampoIntegrantes({ valores, alCambiar }) {
  function cambiar(posicion, texto) {
    alCambiar(valores.map((valor, i) => (i === posicion ? texto : valor)))
  }

  return (
    <div>
      <label className="form-label">Integrantes</label>
      {valores.map((valor, posicion) => (
        <div className="input-group mb-2" key={posicion}>
          <input className="form-control" placeholder={`Integrante ${posicion + 1}`} value={valor}
                 required={posicion === 0} onChange={(e) => cambiar(posicion, e.target.value)} />
          {valores.length > 1 && (
            <button type="button" className="btn btn-outline-secondary" aria-label="Quitar integrante"
                    onClick={() => alCambiar(valores.filter((_, i) => i !== posicion))}>✕</button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-suave btn-sm" onClick={() => alCambiar([...valores, ''])}>
        + Agregar integrante
      </button>
    </div>
  )
}
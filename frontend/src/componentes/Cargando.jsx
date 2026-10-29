/** Indicador mientras llegan los datos de la API. */
export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="vacio" role="status">
      <div className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
      {texto}
    </div>
  )
}
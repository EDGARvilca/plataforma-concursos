import { formatearNumero } from '../utilidades/formato.js'

// Orden en pantalla: el 2.º a la izquierda, el 1.º al centro (más alto) y el 3.º a la derecha
const ORDEN = [2, 1, 3]
const MEDALLA = { 1: 'oro', 2: 'plata', 3: 'bronce' }

function Corona() {
  return (
    <svg className="podio-corona" viewBox="0 0 64 40" aria-hidden="true">
      <path d="M4 34 L10 8 L24 22 L32 4 L40 22 L54 8 L60 34 Z" fill="currentColor" />
      <rect x="4" y="34" width="56" height="5" rx="2" fill="currentColor" />
    </svg>
  )
}

/**
 * Podio del Top 3 (WF16). Siempre dibuja los tres puestos:
 * si todavía no hay proyecto para alguno, aparece como "Por definir".
 */
export default function Podio({ filas }) {
  return (
    <div className="podio-escenario">
      <div className="podio">
        {ORDEN.map((lugar) => {
          const fila = filas[lugar - 1]
          return (
            <div key={lugar} className={`podio-columna ${lugar === 1 ? 'primero' : ''} ${fila ? '' : 'sin-proyecto'}`}>
              {lugar === 1 && fila && <Corona />}
              <div className={`podio-medalla ${MEDALLA[lugar]}`}>{lugar}</div>
              <strong className="podio-nombre" title={fila?.titulo}>{fila ? fila.titulo : 'Por definir'}</strong>
              <small className="podio-categoria">{fila ? fila.categoria : 'Sin evaluaciones aún'}</small>
              <span className="podio-puntaje">{fila ? formatearNumero(fila.promedio, 2) : '—'}</span>
              <div className={`podio-pilar pilar-${lugar}`}>{lugar}º</div>
            </div>
          )
        })}
      </div>
      <div className="podio-suelo" />
    </div>
  )
}

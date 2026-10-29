import { useState } from 'react'
import { Link } from 'react-router-dom'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import { claseEstadoAsignacion } from '../../utilidades/formato.js'

const FILTROS = [
  { clave: 'todos', texto: 'Todos' },
  { clave: 'pendientes', texto: 'Pendientes' },
  { clave: 'evaluados', texto: 'Evaluados' },
]

function cumple(filtro, estado) {
  if (filtro === 'pendientes') return estado !== 'Enviada'
  if (filtro === 'evaluados') return estado === 'Enviada'
  return true
}

/** Tabla de asignaciones del jurado con los filtros Todos / Pendientes / Evaluados (WF12). */
export default function TablaAsignaciones({ asignaciones, filtroInicial = 'todos' }) {
  const [filtro, setFiltro] = useState(filtroInicial)
  const visibles = asignaciones.filter((a) => cumple(filtro, a.estado))

  return (
    <div className="card"><div className="card-body">
      <div className="btn-group mb-3" role="group" aria-label="Filtrar asignaciones">
        {FILTROS.map((f) => (
          <button key={f.clave} type="button" className={`btn btn-outline-secondary ${filtro === f.clave ? 'active' : ''}`}
                  onClick={() => setFiltro(f.clave)}>{f.texto}</button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EstadoVacio titulo="No hay registros todavía" texto="No tienes proyectos en esta lista." />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Proyecto</th><th>Concurso</th><th>Estado</th><th className="text-end">Acción</th></tr></thead>
            <tbody>
              {visibles.map((a) => (
                <tr key={a.id}>
                  <td><div className="fw-semibold">{a.proyecto}</div><div className="small text-secondary">{a.codigo} · {a.categoria}</div></td>
                  <td className="small">{a.concurso}</td>
                  <td><Insignia texto={a.estado} clase={claseEstadoAsignacion(a.estado)} /></td>
                  <td className="text-end text-nowrap">
                    <Link className="btn btn-outline-secondary btn-sm me-1" to={`/jurado/asignaciones/${a.id}`}>Ver</Link>
                    {a.estado !== 'Enviada' && <Link className="btn btn-primary btn-sm" to={`/jurado/evaluacion/${a.id}`}>{a.estado === 'Borrador' ? 'Continuar' : 'Evaluar'}</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div></div>
  )
}
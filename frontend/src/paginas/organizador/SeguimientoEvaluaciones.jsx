import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoAsignacion, formatearFechaHora, formatearNumero } from '../../utilidades/formato.js'

/** Seguimiento de evaluaciones del concurso: quién ya evaluó, quién tiene borrador y quién no empezó. */
export default function SeguimientoEvaluaciones() {
  const { id } = useParams()
  const { datos, cargando, error } = useCarga(`/concursos/${id}/evaluaciones`)
  const [estado, setEstado] = useState('')

  const filas = useMemo(() => (datos?.filas ?? []).filter((fila) => !estado || fila.estado === estado), [datos, estado])

  if (cargando) return <Pagina titulo="Evaluaciones"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Evaluaciones"><Mensaje texto={error} /></Pagina>

  const { concurso, progreso } = datos
  return (
    <Pagina titulo="Evaluaciones">
      <EncabezadoPagina etiqueta={concurso.nombre} titulo="Seguimiento de evaluaciones"
                        descripcion={`${progreso.evaluacionesEnviadas} de ${progreso.asignaciones} evaluaciones enviadas (${formatearNumero(progreso.avance, 1)}%).`}>
        <Link className="btn btn-outline-secondary" to={`/concursos/${id}`}>← Configuración</Link>
        <Link className="btn btn-primary" to={`/resultados/${id}`}>Ver resultados</Link>
      </EncabezadoPagina>

      <div className="card"><div className="card-body">
        <div className="progress mb-3" role="progressbar" style={{ height: 8 }}>
          <div className="progress-bar" style={{ width: `${progreso.avance}%` }} />
        </div>
        <div className="fila-filtros">
          <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Borrador">Borrador</option>
            <option value="Enviada">Enviada</option>
          </select>
        </div>
        {filas.length === 0 ? (
          <EstadoVacio titulo="No hay registros todavía" texto="Asigna jurados a los proyectos para empezar el seguimiento." />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Código</th><th>Proyecto</th><th>Categoría</th><th>Jurado</th><th>Estado</th><th>Puntaje</th><th>Enviada</th></tr></thead>
              <tbody>
                {filas.map((fila, posicion) => (
                  <tr key={posicion}>
                    <td>{fila.codigo}</td>
                    <td>{fila.proyecto}</td>
                    <td className="small">{fila.categoria}</td>
                    <td>{fila.jurado}</td>
                    <td><Insignia texto={fila.estado} clase={claseEstadoAsignacion(fila.estado)} /></td>
                    <td>{fila.puntaje == null ? '—' : formatearNumero(fila.puntaje, 1)}</td>
                    <td className="small">{formatearFechaHora(fila.fechaEnvio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div></div>
    </Pagina>
  )
}
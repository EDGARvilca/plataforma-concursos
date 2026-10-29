import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { formatearNumero } from '../../utilidades/formato.js'

/** Ranking final (WF16): podio con el Top 3, tabla completa y exportación a Excel y PDF. */
export default function Resultados() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { datos, cargando, error } = useCarga(`/resultados/${id}`)

  if (cargando) return <Pagina titulo="Resultados"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Resultados"><Mensaje texto={error} /></Pagina>

  const { concurso, concursos, ranking, progreso } = datos
  const conPuntaje = ranking.filter((fila) => fila.evaluacionesEnviadas > 0)
  // El podio se muestra con el 2.º a la izquierda, el 1.º al centro y el 3.º a la derecha
  const podio = [conPuntaje[1], conPuntaje[0], conPuntaje[2]]

  return (
    <Pagina titulo="Resultados">
      <EncabezadoPagina etiqueta="Consolidación final" titulo="Resultados y ranking"
                        descripcion={`${progreso.evaluacionesEnviadas} de ${progreso.asignaciones} evaluaciones enviadas.`}>
        <select className="form-select" value={id} onChange={(e) => navegar(`/resultados/${e.target.value}`)}>
          {concursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button className="btn btn-suave" type="button" onClick={() => api.descargar(`/resultados/${id}/excel`, 'ranking.xlsx')}>Exportar Excel</button>
        <button className="btn btn-primary" type="button" onClick={() => api.descargar(`/resultados/${id}/pdf`, 'ranking.pdf')}>Generar PDF</button>
      </EncabezadoPagina>

      {ranking.length === 0 ? (
        <EstadoVacio titulo="No hay registros todavía" texto={`Aún no hay proyectos en «${concurso.nombre}».`}>
          <Link className="btn btn-primary" to={`/concursos/${id}`}>Ir a la configuración</Link>
        </EstadoVacio>
      ) : (
        <>
          {conPuntaje.length > 0 && (
            <section className="card mb-3"><div className="card-body">
              <h2 className="h5 text-center mb-4">Top 3</h2>
              <div className="podio">
                {podio.map((fila, posicion) => {
                  if (!fila) return <div key={posicion} />
                  const lugar = fila.puesto
                  return (
                    <div key={fila.proyectoId} className={`podio-puesto ${lugar === 1 ? 'primero' : ''}`}>
                      <div className={`podio-medalla ${lugar === 1 ? 'oro' : lugar === 3 ? 'bronce' : ''}`}>{lugar}</div>
                      <div className="podio-tarjeta">
                        <strong>{fila.titulo}</strong>
                        <span className="podio-puntaje">{formatearNumero(fila.promedio, 2)}</span>
                      </div>
                      <div className={`podio-base base-${lugar}`} />
                    </div>
                  )
                })}
              </div>
            </div></section>
          )}

          <div className="card"><div className="card-body">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Posición</th><th>Proyecto</th><th>Categoría</th><th>Evaluaciones</th><th>Promedio</th><th>Estado</th></tr></thead>
                <tbody>
                  {ranking.map((fila) => (
                    <tr key={fila.proyectoId}>
                      <td><span className={`puesto puesto-${fila.puesto}`}>{fila.puesto}</span></td>
                      <td><div className="fw-semibold">{fila.titulo}</div><div className="small text-secondary">{fila.integrantes}</div></td>
                      <td className="small">{fila.categoria}</td>
                      <td>{fila.evaluacionesEnviadas} / {fila.juradosAsignados}</td>
                      <td className="fw-semibold">{formatearNumero(fila.promedio, 2)}</td>
                      <td>{fila.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div></div>
        </>
      )}
    </Pagina>
  )
}
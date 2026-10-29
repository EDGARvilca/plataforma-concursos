import { Link } from 'react-router-dom'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import Podio from '../../componentes/Podio.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoConcurso, formatearNumero } from '../../utilidades/formato.js'

/** Resultados de un concurso: mi puesto, el podio y el ranking completo con mi proyecto resaltado. */
function ResultadoDeConcurso({ resultado }) {
  const { concurso, publicado, ranking, misProyectos } = resultado

  if (!publicado) {
    return (
      <div className="card mb-3"><div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <h2 className="h5 mb-0">{concurso.nombre}</h2>
          <Insignia texto={concurso.estadoEtiqueta} clase={claseEstadoConcurso(concurso.estado)} />
        </div>
        <p className="text-secondary mb-0">
          Los resultados se publican cuando el organizador cierra el concurso. Mientras tanto puedes seguir tu proyecto en
          {' '}<Link to="/participante">Mis proyectos</Link>.
        </p>
      </div></div>
    )
  }

  const conPuntaje = ranking.filter((fila) => fila.evaluacionesEnviadas > 0)
  const mias = ranking.filter((fila) => misProyectos.includes(fila.proyectoId))

  return (
    <section className="mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <h2 className="h4 mb-0">{concurso.nombre}</h2>
        <Insignia texto="Resultados publicados" clase="estado-open" />
      </div>

      {mias.map((fila) => (
        <div className="resumen-mi-puesto mb-3" key={fila.proyectoId}>
          <div>
            <small>Tu proyecto</small>
            <strong className="d-block">{fila.titulo}</strong>
          </div>
          <div className="text-end">
            <small>Puesto</small>
            <strong className="d-block fs-3">{fila.puesto}º <span className="fs-6 fw-normal">de {ranking.length}</span></strong>
          </div>
          <div className="text-end">
            <small>Puntaje</small>
            <strong className="d-block fs-3">{formatearNumero(fila.promedio, 2)}</strong>
          </div>
        </div>
      ))}

      {conPuntaje.length > 0 && (
        <div className="card mb-3"><div className="card-body">
          <h3 className="h5 text-center mb-4">Top 3</h3>
          <Podio filas={conPuntaje} />
        </div></div>
      )}

      <div className="card"><div className="card-body">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Posición</th><th>Proyecto</th><th>Categoría</th><th>Promedio</th></tr></thead>
            <tbody>
              {ranking.map((fila) => {
                const esMio = misProyectos.includes(fila.proyectoId)
                return (
                  <tr key={fila.proyectoId} className={esMio ? 'fila-mia' : ''}>
                    <td><span className={`puesto puesto-${fila.puesto}`}>{fila.puesto}</span></td>
                    <td>
                      <span className="fw-semibold">{fila.titulo}</span>
                      {esMio && <span className="badge estado estado-open ms-2">Tu proyecto</span>}
                    </td>
                    <td className="small">{fila.categoria}</td>
                    <td className="fw-semibold">{formatearNumero(fila.promedio, 2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div></div>
    </section>
  )
}

/** Resultados para el participante: un bloque por cada concurso en el que inscribió proyectos. */
export default function Resultados() {
  const { datos, cargando, error } = useCarga('/participante/resultados')

  return (
    <Pagina titulo="Resultados">
      <EncabezadoPagina etiqueta="Resultados" titulo="Resultados de mis concursos"
                        descripcion="Aquí aparecen el ranking y tu puesto cuando el concurso se cierra." />
      <Mensaje texto={error} />
      {!datos ? (cargando ? <Cargando /> : null) : datos.length === 0 ? (
        <EstadoVacio titulo="Todavía no participas en ningún concurso" texto="Cuando inscribas un proyecto, sus resultados aparecerán aquí.">
          <Link className="btn btn-primary" to="/participante/registro">Registrar proyecto</Link>
        </EstadoVacio>
      ) : (
        datos.map((resultado) => <ResultadoDeConcurso key={resultado.concurso.id} resultado={resultado} />)
      )}
    </Pagina>
  )
}

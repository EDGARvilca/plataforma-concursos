import { Link } from 'react-router-dom'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { useSesion } from '../../contexto/ContextoSesion.jsx'
import { claseEstadoProyecto, formatearRango } from '../../utilidades/formato.js'

/** Inicio del participante (WF18): sus proyectos con la etapa en la que van y las convocatorias abiertas. */
export default function MisProyectos() {
  const { usuario } = useSesion()
  const { datos, cargando, error } = useCarga('/participante/inicio')

  return (
    <Pagina titulo="Mis proyectos">
      <EncabezadoPagina etiqueta="Portal del participante" titulo={`Hola, ${usuario.nombre}`}
                        descripcion="Registra proyectos y consulta cómo va tu evaluación.">
        <Link className="btn btn-primary" to="/participante/registro">+ Registrar proyecto</Link>
      </EncabezadoPagina>
      <Mensaje texto={error} />

      {cargando ? <Cargando /> : (
        <>
          <section className="mb-4">
            <h2 className="h5">Mis proyectos</h2>
            {datos.proyectos.length === 0 ? (
              <EstadoVacio titulo="Aún no registras proyectos" texto="Elige una convocatoria abierta para inscribir tu primer proyecto.">
                <Link className="btn btn-primary" to="/participante/registro">Registrar proyecto</Link>
              </EstadoVacio>
            ) : (
              <div className="row g-3">
                {datos.proyectos.map(({ proyecto, etapa }) => (
                  <div className="col-md-6" key={proyecto.id}>
                    <Link to={`/participante/proyectos/${proyecto.id}`} className="atajo">
                      <div className="card"><div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Insignia texto={datos.etapas[etapa]} clase={claseEstadoProyecto(proyecto.estado)} />
                          <small className="text-secondary">{proyecto.concurso}</small>
                        </div>
                        <h3 className="h5">{proyecto.titulo}</h3>
                        <p className="small text-secondary mb-0">{proyecto.categoria} · {proyecto.integrantes}</p>
                      </div></div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="h5">Convocatorias abiertas</h2>
            {datos.convocatoriasAbiertas.length === 0 ? (
              <EstadoVacio texto="No hay convocatorias recibiendo trabajos por ahora." />
            ) : (
              <div className="row g-3">
                {datos.convocatoriasAbiertas.map((c) => (
                  <div className="col-md-6" key={c.id}>
                    <div className="card h-100"><div className="card-body">
                      <h3 className="h6">{c.nombre}</h3>
                      <p className="small text-secondary">{formatearRango(c.fechaInicio, c.fechaCierre)}</p>
                      <Link className="btn btn-suave btn-sm" to={`/participante/registro?concursoId=${c.id}`}>Inscribir proyecto</Link>
                    </div></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </Pagina>
  )
}
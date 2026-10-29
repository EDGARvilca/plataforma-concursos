import { Link } from 'react-router-dom'
import { useSesion } from '../../contexto/ContextoSesion.jsx'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import GraficoCircular from '../../componentes/GraficoCircular.jsx'
import GraficoBarras from '../../componentes/GraficoBarras.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoConcurso, claseEstadoProyecto, formatearFecha, formatearFechaHora, formatearNumero } from '../../utilidades/formato.js'

const COLORES = { verde: '#33493d', dorado: '#ab8a58', arena: '#cdbf9f', rojo: '#9b5c32' }

function Indicador({ etiqueta, valor, detalle }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card h-100">
        <div className="card-body">
          <small className="etiqueta-seccion">{etiqueta}</small>
          <div className="cifra-metrica">{valor}</div>
          <small className="text-secondary">{detalle}</small>
        </div>
      </div>
    </div>
  )
}

/** Dashboard del organizador (WF03): indicadores, gráfico circular, barras y proyectos recientes. */
function PanelOrganizador({ datos, usuario }) {
  const { datos: lista } = useCarga('/proyectos')
  const { estadisticas, concursoActivo, progreso, proyectosRecientes } = datos
  const proyectos = lista?.proyectos ?? []
  const porEstado = ['Inscrito', 'Evaluando', 'Evaluado'].map((estado, i) => ({
    etiqueta: estado,
    valor: proyectos.filter((p) => p.estado === estado).length,
    color: [COLORES.arena, COLORES.dorado, COLORES.verde][i],
  }))

  return (
    <>
      <EncabezadoPagina etiqueta="Vista inicial" titulo={`Hola, ${usuario.nombre}`}
                        descripcion="Controla el avance de tus concursos y evaluaciones.">
        <Link className="btn btn-primary" to="/concursos/nuevo">+ Nuevo concurso</Link>
      </EncabezadoPagina>

      <section className="row g-3 mb-4">
        <Indicador etiqueta="Concursos" valor={estadisticas.concursos} detalle={`${estadisticas.concursosActivos} activos`} />
        <Indicador etiqueta="Proyectos" valor={estadisticas.proyectos} detalle="inscritos" />
        <Indicador etiqueta="Jurados" valor={estadisticas.jurados} detalle="registrados" />
        <Indicador etiqueta="Evaluaciones" valor={`${formatearNumero(estadisticas.avance, 0)}%`}
                   detalle={`${estadisticas.evaluacionesEnviadas} de ${estadisticas.asignaciones} enviadas`} />
      </section>

      <div className="row g-3 mb-3">
        <div className="col-lg-5">
          <div className="card h-100"><div className="card-body">
            <span className="etiqueta-seccion">Concurso activo</span>
            {!concursoActivo ? (
              <EstadoVacio texto="Aún no tienes concursos.">
                <Link className="btn btn-primary btn-sm" to="/concursos/nuevo">Crear el primero</Link>
              </EstadoVacio>
            ) : (
              <>
                <h2 className="h4 mt-1">{concursoActivo.nombre}</h2>
                <p className="mb-2">
                  <span className="text-secondary">Etapa: </span>
                  <Insignia texto={concursoActivo.estadoEtiqueta} clase={claseEstadoConcurso(concursoActivo.estado)} />
                </p>
                <div className="d-flex flex-wrap align-items-center gap-3 my-3">
                  <GraficoCircular porcentaje={progreso.avance} titulo="avance" tamano={132} />
                  <div className="small text-secondary">
                    <strong className="d-block fs-5 text-body">{progreso.evaluacionesEnviadas} / {progreso.asignaciones}</strong>
                    evaluaciones enviadas por los jurados
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Link className="btn btn-suave btn-sm" to={`/concursos/${concursoActivo.id}`}>Configuración</Link>
                  <Link className="btn btn-suave btn-sm" to={`/concursos/${concursoActivo.id}/evaluaciones`}>Evaluaciones</Link>
                  <Link className="btn btn-suave btn-sm" to={`/resultados/${concursoActivo.id}`}>Resultados</Link>
                </div>
              </>
            )}
          </div></div>
        </div>

        <div className="col-lg-7">
          <div className="card h-100"><div className="card-body">
            <span className="etiqueta-seccion">Progreso general</span>
            <h2 className="h5">Proyectos por estado</h2>
            <GraficoBarras datos={porEstado} vacio="Cuando se inscriban proyectos verás aquí su avance." />
            <small className="text-secondary d-block mt-3">
              Inscrito: sin evaluaciones · Evaluando: faltan jurados por enviar · Evaluado: todos enviaron.
            </small>
          </div></div>
        </div>
      </div>

      <div className="card"><div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h5 mb-0">Proyectos recientes</h2>
          <Link className="small" to="/proyectos">Ver todos</Link>
        </div>
        {proyectosRecientes.length === 0 ? (
          <EstadoVacio texto="Todavía no hay proyectos registrados." />
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Proyecto</th><th>Concurso</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {proyectosRecientes.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td><Link to={`/proyectos/${proyecto.id}`}>{proyecto.titulo}</Link></td>
                    <td className="small">{proyecto.concurso}</td>
                    <td className="small text-nowrap">{formatearFecha(proyecto.fechaEnvio)}</td>
                    <td><Insignia texto={proyecto.estado} clase={claseEstadoProyecto(proyecto.estado)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div></div>
    </>
  )
}

/** Dashboard del administrador (WF17): totales globales, usuarios por rol y actividad reciente. */
function PanelAdministrador({ datos }) {
  const { datos: usuarios } = useCarga('/administracion/usuarios')
  const { estadisticas } = datos
  const porRol = [
    { etiqueta: 'Administradores', rol: 'ADMIN', color: COLORES.rojo },
    { etiqueta: 'Organizadores', rol: 'ORGANIZER', color: COLORES.verde },
    { etiqueta: 'Jurados', rol: 'JUDGE', color: COLORES.dorado },
    { etiqueta: 'Participantes', rol: 'PARTICIPANT', color: COLORES.arena },
  ].map((item) => ({ ...item, valor: (usuarios ?? []).filter((u) => u.rol === item.rol).length }))

  return (
    <>
      <EncabezadoPagina etiqueta="Control global" titulo="Administración"
                        descripcion="Usuarios, instituciones y concursos de toda la plataforma.">
        <Link className="btn btn-suave" to="/administracion/instituciones">Instituciones</Link>
        <Link className="btn btn-primary" to="/administracion/usuarios">Gestionar usuarios</Link>
      </EncabezadoPagina>

      <section className="row g-3 mb-4">
        <Indicador etiqueta="Usuarios" valor={datos.cantidadUsuarios} detalle="registrados" />
        <Indicador etiqueta="Instituciones" valor={datos.cantidadInstituciones} detalle="registradas" />
        <Indicador etiqueta="Concursos" valor={estadisticas.concursos} detalle="en total" />
        <Indicador etiqueta="Activos" valor={estadisticas.concursosActivos} detalle="abiertos o en evaluación" />
      </section>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card h-100"><div className="card-body">
            <span className="etiqueta-seccion">Comunidad</span>
            <h2 className="h5">Usuarios por rol</h2>
            <GraficoBarras datos={porRol} />
          </div></div>
        </div>
        <div className="col-lg-7">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Actividad reciente</h2>
            {datos.actividad.length === 0 ? (
              <EstadoVacio texto="Todavía no hay actividad registrada." />
            ) : (
              <ul className="list-group list-group-flush">
                {datos.actividad.map((item, posicion) => (
                  <li className="list-group-item px-0 d-flex justify-content-between gap-3" key={posicion}>
                    <span>{item.texto}</span>
                    <small className="text-secondary text-nowrap">{formatearFechaHora(item.fecha)}</small>
                  </li>
                ))}
              </ul>
            )}
          </div></div>
        </div>
      </div>
    </>
  )
}

export default function Panel() {
  const { usuario } = useSesion()
  const { datos, cargando, error } = useCarga('/panel')
  const esAdmin = usuario.rol === 'ADMIN'

  return (
    <Pagina titulo={esAdmin ? 'Dashboard del administrador' : 'Dashboard'}>
      <Mensaje texto={error} />
      {cargando && <Cargando />}
      {datos && (esAdmin ? <PanelAdministrador datos={datos} /> : <PanelOrganizador datos={datos} usuario={usuario} />)}
    </Pagina>
  )
}
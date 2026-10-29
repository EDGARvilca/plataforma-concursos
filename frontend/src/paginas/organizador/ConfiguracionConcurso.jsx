import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import { useSesion } from '../../contexto/ContextoSesion.jsx'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoConcurso, formatearNumero, formatearRango } from '../../utilidades/formato.js'

const ESTADOS = [
  { valor: 'DRAFT', texto: 'Borrador' },
  { valor: 'OPEN', texto: 'Inscripciones abiertas' },
  { valor: 'EVALUATION', texto: 'En evaluación' },
  { valor: 'CLOSED', texto: 'Cerrado' },
]

function ItemLista({ listo, texto }) {
  return (
    <li>
      <span className={`check-marca ${listo ? 'ok' : 'pendiente'}`}>{listo ? '✓' : '!'}</span>
      <span>{texto}</span>
    </li>
  )
}

function Atajo({ para, etiqueta, valor, detalle }) {
  return (
    <div className="col-6 col-lg-3">
      <Link to={para} className="atajo">
        <div className="card"><div className="card-body">
          <small className="etiqueta-seccion">{etiqueta}</small>
          <div className="cifra-metrica">{valor}</div>
          <small className="text-secondary">{detalle}</small>
        </div></div>
      </Link>
    </div>
  )
}

/** Panel de configuración del concurso (WF06): atajos, lista de verificación, estado y bases. */
export default function ConfiguracionConcurso() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const { datos, cargando, error, recargar } = useCarga(`/concursos/${id}`)
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })
  const [estadoNuevo, setEstadoNuevo] = useState('')
  const [organizadorId, setOrganizadorId] = useState('')

  async function ejecutar(accion, textoExito) {
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: textoExito })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  if (cargando && !datos) return <Pagina titulo="Configuración del concurso"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Configuración del concurso"><Mensaje texto={error} /></Pagina>

  const { concurso, lista, progreso, organizadores } = datos
  const estadoActual = estadoNuevo || concurso.estado

  return (
    <Pagina titulo="Configuración del concurso">
      <EncabezadoPagina etiqueta="Panel de preparación" titulo={concurso.nombre} descripcion={concurso.descripcion}>
        <Link className="btn btn-outline-secondary" to={`/concursos/${id}/editar`}>Editar información</Link>
        <Link className="btn btn-primary" to={`/resultados/${id}`}>Ver resultados</Link>
      </EncabezadoPagina>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3 small text-secondary">
        <Insignia texto={concurso.estadoEtiqueta} clase={claseEstadoConcurso(concurso.estado)} />
        <span>{formatearRango(concurso.fechaInicio, concurso.fechaCierre)}</span>
        <span>{concurso.organizador ? `Organiza: ${concurso.organizador}` : 'Sin organizador'}</span>
      </div>

      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      <section className="row g-3 mb-3">
        <Atajo para={`/concursos/${id}/categorias`} etiqueta="Categorías" valor={lista.categorias} detalle="Configurar áreas o líneas" />
        <Atajo para={`/concursos/${id}/rubrica`} etiqueta="Rúbrica" valor={`${formatearNumero(lista.pesoRubrica, 0)}%`} detalle="Criterios y pesos" />
        <Atajo para={`/proyectos?concursoId=${id}`} etiqueta="Proyectos" valor={lista.proyectos} detalle="Proyectos inscritos" />
        <Atajo para={`/concursos/${id}/asignaciones`} etiqueta="Jurados" valor={lista.asignaciones} detalle="Asignaciones activas" />
      </section>

      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Checklist de configuración</h2>
            <ul className="checklist">
              <ItemLista listo={lista.categoriasListas} texto="Categorías creadas" />
              <ItemLista listo={lista.rubricaLista} texto="Rúbrica con peso total 100%" />
              <ItemLista listo={lista.proyectosListos} texto="Proyectos registrados" />
              <ItemLista listo={lista.juradosListos} texto={`Cada proyecto con al menos ${lista.minimoJurados} jurado(s)`} />
            </ul>
            <div className="d-flex justify-content-between align-items-baseline mt-3">
              <small className="etiqueta-seccion mb-0">Avance de evaluación</small>
              <strong>{formatearNumero(progreso.avance, 1)}%</strong>
            </div>
            <div className="progress mt-2" role="progressbar" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${progreso.avance}%` }} />
            </div>
          </div></div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Fase de la convocatoria</h2>
            <p className="text-secondary small">Para pasar a «En evaluación» la rúbrica debe sumar 100%.</p>
            <div className="d-flex gap-2 mb-4">
              <select className="form-select" value={estadoActual} onChange={(e) => setEstadoNuevo(e.target.value)}>
                {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.texto}</option>)}
              </select>
              <button className="btn btn-suave" type="button"
                      onClick={() => ejecutar(() => api.actualizar(`/concursos/${id}/estado`, { estado: estadoActual }), 'Estado actualizado')}>
                Actualizar
              </button>
            </div>

            <h2 className="h5">Bases de la convocatoria</h2>
            {concurso.tieneBases ? (
              <div className="archivo my-2">
                <span className="archivo-icono">PDF</span>
                <div className="flex-grow-1 overflow-hidden"><strong className="small">{concurso.nombreBases}</strong></div>
                <button className="btn btn-sm btn-outline-secondary" type="button"
                        onClick={() => api.descargar(`/concursos/${id}/bases`, 'bases.pdf')}>Descargar</button>
              </div>
            ) : <p className="text-secondary small">Aún no se publican las bases.</p>}
            <form className="d-flex gap-2" onSubmit={(evento) => {
              evento.preventDefault()
              const formulario = new FormData()
              formulario.append('archivo', evento.target.archivo.files[0])
              ejecutar(() => api.subir(`/concursos/${id}/bases`, formulario), 'Bases publicadas')
              evento.target.reset()
            }}>
              <input type="file" name="archivo" className="form-control" accept=".pdf,.doc,.docx" required />
              <button className="btn btn-primary" type="submit">{concurso.tieneBases ? 'Actualizar' : 'Publicar'}</button>
            </form>
          </div></div>
        </div>
      </div>

      {usuario.rol === 'ADMIN' && (
        <section className="card">
          <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="h5 mb-0">Responsable de la convocatoria</h2>
              <p className="text-secondary small mb-0">Asigna la gestión diaria a un organizador.</p>
            </div>
            <div className="d-flex gap-2">
              <select className="form-select" value={organizadorId || concurso.organizadorId || ''}
                      onChange={(e) => setOrganizadorId(e.target.value)}>
                <option value="">Seleccionar organizador</option>
                {organizadores.map((o) => <option key={o.id} value={o.id}>{o.nombre} · {o.correo}</option>)}
              </select>
              <button className="btn btn-suave text-nowrap" type="button" disabled={!organizadorId}
                      onClick={() => ejecutar(() => api.actualizar(`/concursos/${id}/organizador`, { organizadorId: Number(organizadorId) }), 'Responsable actualizado')}>
                Guardar
              </button>
            </div>
          </div>
        </section>
      )}
    </Pagina>
  )
}
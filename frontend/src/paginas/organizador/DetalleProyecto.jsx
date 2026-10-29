import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import CampoIntegrantes from '../../componentes/CampoIntegrantes.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoAsignacion, claseEstadoProyecto, formatearFechaHora } from '../../utilidades/formato.js'

/** Ficha del proyecto para el organizador: datos, jurados asignados, observación y edición. */
export default function DetalleProyecto() {
  const { id } = useParams()
  const { datos, cargando, error, recargar } = useCarga(`/proyectos/${id}`)
  const [observacion, setObservacion] = useState('')
  const [edicion, setEdicion] = useState(null)
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  useEffect(() => {
    if (datos) setObservacion(datos.proyecto.observacion ?? '')
  }, [datos])

  async function ejecutar(accion, textoExito) {
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: textoExito })
      setEdicion(null)
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  if (cargando && !datos) return <Pagina titulo="Proyecto"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Proyecto"><Mensaje texto={error} /></Pagina>

  const { proyecto, jurados, categorias } = datos
  const empezarEdicion = () => setEdicion({
    titulo: proyecto.titulo, resumen: proyecto.resumen ?? '', institucionGrado: proyecto.institucionGrado ?? '',
    categoriaId: proyecto.categoriaId ?? '', integrantes: proyecto.integrantes.split(' / '),
  })

  return (
    <Pagina titulo={`Proyecto ${proyecto.codigo}`}>
      <EncabezadoPagina etiqueta={proyecto.concurso} titulo={proyecto.titulo} descripcion={`${proyecto.codigo} · ${proyecto.categoria}`}>
        <Link className="btn btn-outline-secondary" to={`/proyectos?concursoId=${proyecto.concursoId}`}>← Proyectos</Link>
        {!edicion && <button className="btn btn-suave" type="button" onClick={empezarEdicion}>Editar</button>}
      </EncabezadoPagina>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      {edicion ? (
        <form className="card mb-3" onSubmit={(e) => {
          e.preventDefault()
          ejecutar(() => api.actualizar(`/proyectos/${id}`, { ...edicion, categoriaId: edicion.categoriaId ? Number(edicion.categoriaId) : null }), 'Proyecto actualizado')
        }}>
          <div className="card-body row g-3">
            <div className="col-md-8">
              <label className="form-label">Título</label>
              <input className="form-control" required value={edicion.titulo} onChange={(e) => setEdicion({ ...edicion, titulo: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <select className="form-select" value={edicion.categoriaId} onChange={(e) => setEdicion({ ...edicion, categoriaId: e.target.value })}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Resumen</label>
              <textarea className="form-control" rows={3} value={edicion.resumen} onChange={(e) => setEdicion({ ...edicion, resumen: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Institución / grado</label>
              <input className="form-control" value={edicion.institucionGrado} onChange={(e) => setEdicion({ ...edicion, institucionGrado: e.target.value })} />
            </div>
            <div className="col-12"><CampoIntegrantes valores={edicion.integrantes} alCambiar={(integrantes) => setEdicion({ ...edicion, integrantes })} /></div>
            <div className="col-12 d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" type="button" onClick={() => setEdicion(null)}>Cancelar</button>
              <button className="btn btn-primary" type="submit">Guardar cambios</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card mb-3"><div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Insignia texto={proyecto.estado} clase={claseEstadoProyecto(proyecto.estado)} />
            <span className="small text-secondary">Enviado: {formatearFechaHora(proyecto.fechaEnvio)}</span>
          </div>
          <dl className="row mb-0">
            <dt className="col-sm-3">Participantes</dt><dd className="col-sm-9">{proyecto.integrantes}</dd>
            <dt className="col-sm-3">Institución / grado</dt><dd className="col-sm-9">{proyecto.institucionGrado || '—'}</dd>
            <dt className="col-sm-3">Resumen</dt><dd className="col-sm-9">{proyecto.resumen || '—'}</dd>
            <dt className="col-sm-3">Documento</dt>
            <dd className="col-sm-9">
              {proyecto.tieneArchivo ? (
                <button className="btn btn-link p-0" type="button" onClick={() => api.descargar(`/proyectos/${id}/archivo`, proyecto.nombreArchivo)}>
                  {proyecto.nombreArchivo}
                </button>
              ) : 'Sin archivo'}
            </dd>
          </dl>
        </div></div>
      )}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Jurados asignados</h2>
            {jurados.length === 0 ? <p className="text-secondary mb-0">Todavía no tiene jurados.</p> : (
              <ul className="list-group list-group-flush">
                {jurados.map((j) => (
                  <li className="list-group-item px-0 d-flex justify-content-between" key={j.asignacionId}>
                    {j.jurado}<Insignia texto={j.estado} clase={claseEstadoAsignacion(j.estado)} />
                  </li>
                ))}
              </ul>
            )}
            <Link className="btn btn-suave btn-sm mt-3" to={`/concursos/${proyecto.concursoId}/asignaciones`}>Gestionar asignaciones</Link>
          </div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Observación para el participante</h2>
            <textarea className="form-control mb-2" rows={4} maxLength={1500} value={observacion}
                      onChange={(e) => setObservacion(e.target.value)} placeholder="Sin observaciones pendientes." />
            <button className="btn btn-primary btn-sm" type="button"
                    onClick={() => ejecutar(() => api.actualizar(`/proyectos/${id}/observacion`, { observacion }), 'Observación guardada')}>
              Guardar observación
            </button>
          </div></div>
        </div>
      </div>
    </Pagina>
  )
}
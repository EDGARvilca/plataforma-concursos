import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { formatearFechaHora } from '../../utilidades/formato.js'
import LineaTiempo from './LineaTiempo.jsx'

/** Seguimiento del proyecto del participante (WF19): línea de tiempo, documentos y observaciones. */
export default function SeguimientoProyecto() {
  const { id } = useParams()
  const { datos, cargando, error, recargar } = useCarga(`/participante/proyectos/${id}`)
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  async function actualizarArchivo(evento) {
    evento.preventDefault()
    const formulario = new FormData()
    formulario.append('archivo', evento.target.archivo.files[0])
    try {
      await api.subir(`/participante/proyectos/${id}/archivo`, formulario)
      evento.target.reset()
      setMensaje({ tipo: 'exito', texto: 'Archivo actualizado' })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  if (cargando && !datos) return <Pagina titulo="Mi proyecto"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Mi proyecto"><Mensaje texto={error} /></Pagina>

  const { proyecto, etapa, etapas, comentariosJurados, puedeActualizar } = datos
  return (
    <Pagina titulo="Mi proyecto">
      <EncabezadoPagina etiqueta={proyecto.concurso} titulo={proyecto.titulo} descripcion={`${proyecto.codigo} · ${proyecto.categoria}`}>
        <Link className="btn btn-outline-secondary" to="/participante">← Mis proyectos</Link>
      </EncabezadoPagina>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      <div className="card mb-3"><div className="card-body">
        <h2 className="h5">Línea de tiempo</h2>
        <LineaTiempo etapas={etapas} actual={etapa} />
      </div></div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Documentos enviados</h2>
            {proyecto.tieneArchivo ? (
              <div className="archivo mb-3">
                <span className="archivo-icono">PDF</span>
                <div className="flex-grow-1 overflow-hidden">
                  <strong className="small">{proyecto.nombreArchivo}</strong>
                  <small className="text-secondary">Enviado {formatearFechaHora(proyecto.fechaEnvio)}</small>
                </div>
                <button className="btn btn-sm btn-outline-secondary" type="button"
                        onClick={() => api.descargar(`/participante/proyectos/${id}/archivo`, proyecto.nombreArchivo)}>Descargar</button>
              </div>
            ) : <p className="text-secondary">No hay archivos enviados.</p>}
            {puedeActualizar ? (
              <form className="d-flex gap-2" onSubmit={actualizarArchivo}>
                <input type="file" name="archivo" className="form-control" required />
                <button className="btn btn-primary text-nowrap" type="submit">Actualizar archivo</button>
              </form>
            ) : <small className="text-secondary">La convocatoria ya no permite actualizar archivos.</small>}
          </div></div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h5">Observaciones del organizador</h2>
            <p className={proyecto.observacion ? '' : 'text-secondary'}>{proyecto.observacion || 'Sin observaciones pendientes.'}</p>
            {comentariosJurados.length > 0 && (
              <>
                <h3 className="h6 mt-3">Comentarios de los jurados</h3>
                <ul className="comentarios">
                  {comentariosJurados.map((texto, posicion) => <li key={posicion}>{texto}</li>)}
                </ul>
              </>
            )}
          </div></div>
        </div>
      </div>
    </Pagina>
  )
}
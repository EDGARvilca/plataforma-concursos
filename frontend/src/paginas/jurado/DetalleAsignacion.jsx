import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoAsignacion } from '../../utilidades/formato.js'

/** Ficha del proyecto que revisa el jurado antes de evaluar (WF13). */
export default function DetalleAsignacion() {
  const { id } = useParams()
  const { datos, cargando, error } = useCarga(`/jurado/asignaciones/${id}`)

  if (cargando) return <Pagina titulo="Detalle del proyecto"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Detalle del proyecto"><Mensaje texto={error} /></Pagina>

  const { proyecto, estado } = datos
  return (
    <Pagina titulo="Detalle del proyecto">
      <EncabezadoPagina etiqueta={proyecto.concurso} titulo={proyecto.titulo} descripcion={`${proyecto.codigo} · ${proyecto.categoria}`}>
        <Link className="btn btn-outline-secondary" to="/jurado/asignaciones">← Mis asignaciones</Link>
        {estado !== 'Enviada' && (
          <Link className="btn btn-primary" to={`/jurado/evaluacion/${id}`}>{estado === 'Borrador' ? 'Continuar evaluación' : 'Iniciar evaluación'}</Link>
        )}
      </EncabezadoPagina>

      <div className="card mb-3"><div className="card-body">
        <h2 className="h5">Información del proyecto</h2>
        <dl className="row mb-0">
          <dt className="col-sm-3">Título</dt><dd className="col-sm-9">{proyecto.titulo}</dd>
          <dt className="col-sm-3">Categoría</dt><dd className="col-sm-9">{proyecto.categoria}</dd>
          <dt className="col-sm-3">Participantes</dt><dd className="col-sm-9">{proyecto.integrantes}</dd>
          <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{proyecto.codigo}</dd>
          <dt className="col-sm-3">Tu evaluación</dt><dd className="col-sm-9"><Insignia texto={estado} clase={claseEstadoAsignacion(estado)} /></dd>
          <dt className="col-sm-3">Resumen</dt><dd className="col-sm-9">{proyecto.resumen || '—'}</dd>
        </dl>
      </div></div>

      <div className="card"><div className="card-body">
        <h2 className="h5">Documentos adjuntos</h2>
        {proyecto.tieneArchivo ? (
          <div className="archivo">
            <span className="archivo-icono">PDF</span>
            <div className="flex-grow-1 overflow-hidden"><strong className="small">{proyecto.nombreArchivo}</strong></div>
            <button className="btn btn-sm btn-outline-secondary" type="button"
                    onClick={() => api.descargar(`/jurado/asignaciones/${id}/archivo`, proyecto.nombreArchivo)}>Descargar</button>
          </div>
        ) : <p className="text-secondary mb-0">El participante no adjuntó archivos.</p>}
      </div></div>
    </Pagina>
  )
}
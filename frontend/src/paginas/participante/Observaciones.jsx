import { Link } from 'react-router-dom'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'

/** Todas las observaciones del organizador y comentarios de jurados sobre los proyectos del participante. */
export default function Observaciones() {
  const { datos, cargando, error } = useCarga('/participante/observaciones')

  return (
    <Pagina titulo="Observaciones">
      <EncabezadoPagina etiqueta="Seguimiento" titulo="Observaciones" descripcion="Lo que dejaron el organizador y los jurados sobre tus proyectos." />
      <Mensaje texto={error} />
      {!datos ? (cargando ? <Cargando /> : null) : datos.length === 0 ? (
        <EstadoVacio titulo="No hay registros todavía" texto="Cuando registres un proyecto verás aquí sus observaciones." />
      ) : datos.map(({ proyecto, comentariosJurados }) => (
        <div className="card mb-3" key={proyecto.id}><div className="card-body">
          <div className="d-flex justify-content-between">
            <h2 className="h5">{proyecto.titulo}</h2>
            <Link to={`/participante/proyectos/${proyecto.id}`} className="small">Ver seguimiento</Link>
          </div>
          <p className="small text-secondary">{proyecto.concurso}</p>
          <strong className="small">Organizador</strong>
          <p>{proyecto.observacion || 'Sin observaciones pendientes.'}</p>
          {comentariosJurados.length > 0 && (
            <>
              <strong className="small">Jurados</strong>
              <ul className="comentarios">{comentariosJurados.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </>
          )}
        </div></div>
      ))}
    </Pagina>
  )
}
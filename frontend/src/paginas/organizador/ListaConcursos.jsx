import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoConcurso, formatearRango } from '../../utilidades/formato.js'

const ESTADOS = [
  { valor: '', texto: 'Todos' },
  { valor: 'DRAFT', texto: 'Borrador' },
  { valor: 'OPEN', texto: 'Inscripciones abiertas' },
  { valor: 'EVALUATION', texto: 'En evaluación' },
  { valor: 'CLOSED', texto: 'Cerrado' },
]

/** Lista de concursos con búsqueda y filtro por estado (WF04). */
export default function ListaConcursos() {
  const { datos: concursos, cargando, error } = useCarga('/concursos')
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('')

  const visibles = useMemo(() => {
    const buscado = texto.trim().toLowerCase()
    return (concursos ?? []).filter((concurso) =>
      (!estado || concurso.estado === estado)
      && (!buscado || `${concurso.nombre} ${concurso.descripcion ?? ''} ${concurso.tipo ?? ''}`.toLowerCase().includes(buscado)))
  }, [concursos, texto, estado])

  return (
    <Pagina titulo="Concursos">
      <EncabezadoPagina etiqueta="Gestión institucional" titulo="Concursos y convocatorias"
                        descripcion="Configura cada evento, centraliza proyectos y controla la evaluación.">
        <Link className="btn btn-primary" to="/concursos/nuevo">+ Nuevo concurso</Link>
      </EncabezadoPagina>

      <Mensaje texto={error} />
      {cargando ? <Cargando /> : (
        <div className="card">
          <div className="card-body">
            <div className="fila-filtros">
              <input type="search" className="form-control" placeholder="Buscar concurso…" value={texto}
                     onChange={(e) => setTexto(e.target.value)} />
              <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.texto}</option>)}
              </select>
            </div>

            {visibles.length === 0 ? (
              <EstadoVacio titulo="No hay registros todavía"
                           texto={concursos.length === 0 ? 'Crea tu primera convocatoria para comenzar.' : 'Prueba con otro nombre o filtro.'}>
                {concursos.length === 0 && <Link className="btn btn-primary" to="/concursos/nuevo">Crear primero</Link>}
              </EstadoVacio>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Nombre</th><th>Tipo</th><th>Fechas</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
                  <tbody>
                    {visibles.map((concurso) => (
                      <tr key={concurso.id}>
                        <td><Link className="fw-semibold" to={`/concursos/${concurso.id}`}>{concurso.nombre}</Link></td>
                        <td className="small">{concurso.tipo || '—'}</td>
                        <td className="small text-nowrap">{formatearRango(concurso.fechaInicio, concurso.fechaCierre)}</td>
                        <td><Insignia texto={concurso.estadoEtiqueta} clase={claseEstadoConcurso(concurso.estado)} /></td>
                        <td className="text-end text-nowrap">
                          <Link className="btn btn-suave btn-sm me-1" to={`/concursos/${concurso.id}`}>Ver</Link>
                          <Link className="btn btn-outline-secondary btn-sm" to={`/concursos/${concurso.id}/editar`}>Editar</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Pagina>
  )
}
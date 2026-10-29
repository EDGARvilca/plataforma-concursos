import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { claseEstadoProyecto } from '../../utilidades/formato.js'

/** Lista de proyectos del organizador (WF10): búsqueda, filtro por categoría y por estado. */
export default function ListaProyectos() {
  const [parametros, setParametros] = useSearchParams()
  const concursoId = parametros.get('concursoId') ?? ''
  const { datos, cargando, error } = useCarga(`/proyectos${concursoId ? `?concursoId=${concursoId}` : ''}`)
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('')

  const categorias = useMemo(() => [...new Set((datos?.proyectos ?? []).map((p) => p.categoria))], [datos])
  const visibles = useMemo(() => (datos?.proyectos ?? []).filter((p) =>
    (!categoria || p.categoria === categoria)
    && (!estado || p.estado === estado)
    && `${p.codigo} ${p.titulo} ${p.integrantes}`.toLowerCase().includes(texto.trim().toLowerCase())), [datos, texto, categoria, estado])

  return (
    <Pagina titulo="Proyectos">
      <EncabezadoPagina etiqueta="Seguimiento" titulo="Proyectos inscritos" descripcion="Seguimiento y revisión de los proyectos del concurso.">
        <Link className="btn btn-primary" to={`/proyectos/nuevo${concursoId ? `?concursoId=${concursoId}` : ''}`}>+ Registrar proyecto</Link>
      </EncabezadoPagina>
      <Mensaje texto={error} />

      {cargando ? <Cargando /> : (
        <div className="card"><div className="card-body">
          <div className="fila-filtros">
            <input type="search" className="form-control" placeholder="Buscar proyecto…" value={texto} onChange={(e) => setTexto(e.target.value)} />
            <select className="form-select" value={concursoId} onChange={(e) => setParametros(e.target.value ? { concursoId: e.target.value } : {})}>
              <option value="">Todos los concursos</option>
              {datos.concursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Categoría: todas</option>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Estado: todos</option>
              <option>Inscrito</option><option>Evaluando</option><option>Evaluado</option>
            </select>
          </div>

          {visibles.length === 0 ? (
            <EstadoVacio titulo="No hay registros todavía" texto="Cuando haya proyectos inscritos los verás aquí." />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Código</th><th>Título</th><th>Categoría</th><th>Participantes</th><th>Jurados</th><th>Estado</th><th /></tr></thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id}>
                      <td>{p.codigo}</td>
                      <td className="fw-semibold">{p.titulo}</td>
                      <td className="small">{p.categoria}</td>
                      <td className="small">{p.integrantes}</td>
                      <td>{p.cantidadJurados}</td>
                      <td><Insignia texto={p.estado} clase={claseEstadoProyecto(p.estado)} /></td>
                      <td className="text-end"><Link className="btn btn-suave btn-sm" to={`/proyectos/${p.id}`}>Ver</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div></div>
      )}
    </Pagina>
  )
}
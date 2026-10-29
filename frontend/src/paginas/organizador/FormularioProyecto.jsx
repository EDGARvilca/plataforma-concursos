import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import CampoIntegrantes from '../../componentes/CampoIntegrantes.jsx'

/** Registro manual de un proyecto por el organizador (cuando el participante no lo inscribe por su cuenta). */
export default function FormularioProyecto() {
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const [concursos, setConcursos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState({
    concursoId: parametros.get('concursoId') ?? '', categoriaId: '', titulo: '', resumen: '', institucionGrado: '', integrantes: ['', ''],
  })

  useEffect(() => {
    api.obtener('/concursos').then((lista) => {
      setConcursos(lista)
      setFormulario((anterior) => ({ ...anterior, concursoId: anterior.concursoId || String(lista[0]?.id ?? '') }))
    }).catch((fallo) => setError(fallo.message)).finally(() => setCargando(false))
  }, [])

  // Las categorías cambian según el concurso elegido
  useEffect(() => {
    if (!formulario.concursoId) return
    api.obtener(`/concursos/${formulario.concursoId}/categorias`)
      .then((lista) => setCategorias(lista.filter((c) => c.activa)))
      .catch(() => setCategorias([]))
  }, [formulario.concursoId])

  async function guardar(evento) {
    evento.preventDefault()
    setError('')
    try {
      await api.enviar('/proyectos', {
        ...formulario,
        concursoId: Number(formulario.concursoId),
        categoriaId: formulario.categoriaId ? Number(formulario.categoriaId) : null,
      })
      navegar(`/proyectos?concursoId=${formulario.concursoId}`)
    } catch (fallo) {
      setError(fallo.message)
    }
  }

  if (cargando) return <Pagina titulo="Registrar proyecto"><Cargando /></Pagina>

  return (
    <Pagina titulo="Registrar proyecto">
      <EncabezadoPagina etiqueta="Inscripción" titulo="Registrar proyecto" descripcion="Datos del proyecto e integrantes." />
      <Mensaje texto={error} />
      <form className="card" onSubmit={guardar}>
        <div className="card-body p-4 row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="concurso">Concurso</label>
            <select id="concurso" className="form-select" required value={formulario.concursoId}
                    onChange={(e) => setFormulario({ ...formulario, concursoId: e.target.value, categoriaId: '' })}>
              {concursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="categoria">Categoría</label>
            <select id="categoria" className="form-select" value={formulario.categoriaId}
                    onChange={(e) => setFormulario({ ...formulario, categoriaId: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="titulo">Título del proyecto</label>
            <input id="titulo" className="form-control" required value={formulario.titulo}
                   onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="resumen">Resumen</label>
            <textarea id="resumen" className="form-control" rows={3} value={formulario.resumen}
                      onChange={(e) => setFormulario({ ...formulario, resumen: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="institucion">Institución / grado</label>
            <input id="institucion" className="form-control" value={formulario.institucionGrado}
                   onChange={(e) => setFormulario({ ...formulario, institucionGrado: e.target.value })} />
          </div>
          <div className="col-12">
            <CampoIntegrantes valores={formulario.integrantes} alCambiar={(integrantes) => setFormulario({ ...formulario, integrantes })} />
          </div>
          <div className="col-12 d-flex justify-content-end gap-2">
            <Link className="btn btn-outline-secondary" to="/proyectos">Cancelar</Link>
            <button className="btn btn-primary" type="submit">Registrar proyecto</button>
          </div>
        </div>
      </form>
    </Pagina>
  )
}
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import CampoIntegrantes from '../../componentes/CampoIntegrantes.jsx'

const VACIO = { categoriaId: '', titulo: '', resumen: '', institucionGrado: '', integrantes: ['', ''] }

/** Registro de proyecto del participante (WF09). Si ya inscribió uno en esa convocatoria, lo actualiza. */
export default function RegistrarProyecto() {
  const [parametros, setParametros] = useSearchParams()
  const concursoId = parametros.get('concursoId') ?? ''
  const navegar = useNavigate()
  const [datos, setDatos] = useState(null)
  const [formulario, setFormulario] = useState(VACIO)
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.obtener(`/participante/registro${concursoId ? `?concursoId=${concursoId}` : ''}`)
      .then((respuesta) => {
        setDatos(respuesta)
        const existente = respuesta.existente
        setFormulario(existente ? {
          categoriaId: existente.categoriaId ?? '', titulo: existente.titulo, resumen: existente.resumen ?? '',
          institucionGrado: existente.institucionGrado ?? '', integrantes: existente.integrantes.split(' / '),
        } : VACIO)
      })
      .catch((fallo) => setError(fallo.message))
  }, [concursoId])

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    const cuerpo = new FormData()
    cuerpo.append('concursoId', datos.seleccionada.id)
    if (formulario.categoriaId) cuerpo.append('categoriaId', formulario.categoriaId)
    cuerpo.append('titulo', formulario.titulo)
    cuerpo.append('resumen', formulario.resumen)
    cuerpo.append('institucionGrado', formulario.institucionGrado)
    formulario.integrantes.forEach((nombre) => cuerpo.append('integrantes', nombre))
    if (archivo) cuerpo.append('archivo', archivo)
    try {
      const guardado = await api.subir('/participante/registro', cuerpo)
      navegar(`/participante/proyectos/${guardado.id}`)
    } catch (fallo) {
      setError(fallo.message)
      setEnviando(false)
    }
  }

  if (!datos && !error) return <Pagina titulo="Registrar proyecto"><Cargando /></Pagina>
  if (datos && datos.convocatorias.length === 0) {
    return (
      <Pagina titulo="Registrar proyecto">
        <EstadoVacio titulo="No hay convocatorias abiertas" texto="Cuando haya una convocatoria recibiendo trabajos podrás inscribirte aquí." />
      </Pagina>
    )
  }

  const existente = datos?.existente
  return (
    <Pagina titulo="Registrar proyecto">
      <EncabezadoPagina etiqueta="Inscripción" titulo={existente ? 'Actualizar mi proyecto' : 'Registrar proyecto'}
                        descripcion="Completa los datos del proyecto, los integrantes y adjunta tu archivo." />
      <Mensaje texto={error} />

      {datos && (
        <form className="card" onSubmit={enviar}>
          <div className="card-body p-4 row g-3">
            <h2 className="h5 col-12 mb-0">Datos del proyecto</h2>
            <div className="col-md-6">
              <label className="form-label" htmlFor="concurso">Concurso</label>
              <select id="concurso" className="form-select" value={datos.seleccionada.id}
                      onChange={(e) => setParametros({ concursoId: e.target.value })}>
                {datos.convocatorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="categoria">Categoría</label>
              <select id="categoria" className="form-select" value={formulario.categoriaId}
                      onChange={(e) => setFormulario({ ...formulario, categoriaId: e.target.value })}>
                <option value="">Sin categoría</option>
                {datos.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="titulo">Título del proyecto</label>
              <input id="titulo" className="form-control" required value={formulario.titulo}
                     onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="resumen">Resumen del proyecto</label>
              <textarea id="resumen" className="form-control" rows={3} value={formulario.resumen}
                        onChange={(e) => setFormulario({ ...formulario, resumen: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="institucion">Institución / grado</label>
              <input id="institucion" className="form-control" value={formulario.institucionGrado}
                     onChange={(e) => setFormulario({ ...formulario, institucionGrado: e.target.value })} />
            </div>

            <h2 className="h5 col-12 mt-3 mb-0">Integrantes y archivos</h2>
            <div className="col-12">
              <CampoIntegrantes valores={formulario.integrantes} alCambiar={(integrantes) => setFormulario({ ...formulario, integrantes })} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="archivo">Archivo del proyecto (PDF)</label>
              <input id="archivo" type="file" className="form-control" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                     required={!existente?.tieneArchivo} onChange={(e) => setArchivo(e.target.files[0])} />
              {existente?.tieneArchivo && <div className="form-text">Ya subiste «{existente.nombreArchivo}». Solo elige otro archivo si quieres reemplazarlo.</div>}
            </div>
            <div className="col-12 d-flex justify-content-end gap-2">
              <Link className="btn btn-outline-secondary" to="/participante">Cancelar</Link>
              <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar proyecto'}</button>
            </div>
          </div>
        </form>
      )}
    </Pagina>
  )
}
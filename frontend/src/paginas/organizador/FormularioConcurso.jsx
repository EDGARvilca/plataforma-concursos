import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { leerPreferencias } from '../../utilidades/preferencias.js'

const ESTADOS = [
  { valor: 'DRAFT', texto: 'Borrador' },
  { valor: 'OPEN', texto: 'Inscripciones abiertas' },
  { valor: 'EVALUATION', texto: 'En evaluación' },
  { valor: 'CLOSED', texto: 'Cerrado' },
]

const VACIO = {
  nombre: '', descripcion: '', fechaInicio: '', fechaCierre: '', estado: 'DRAFT',
  tipo: '', cupoMaximo: '', minimoJurados: '', condiciones: '',
}

/** Crear o editar un concurso (WF05). La misma pantalla sirve para los dos casos. */
export default function FormularioConcurso() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navegar = useNavigate()
  // Un concurso nuevo arranca con los valores por defecto de Configuración
  const [formulario, setFormulario] = useState(() => {
    const preferencias = leerPreferencias()
    return {
      ...VACIO,
      tipo: preferencias.concursoTipo,
      cupoMaximo: preferencias.concursoCupoMaximo,
      minimoJurados: preferencias.concursoMinimoJurados,
      condiciones: preferencias.concursoCondiciones,
    }
  })
  const [cargando, setCargando] = useState(editando)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editando) return
    api.obtener(`/concursos/${id}`).then(({ concurso }) => {
      setFormulario({
        nombre: concurso.nombre ?? '',
        descripcion: concurso.descripcion ?? '',
        fechaInicio: concurso.fechaInicio ?? '',
        fechaCierre: concurso.fechaCierre ?? '',
        estado: concurso.estado,
        tipo: concurso.tipo ?? '',
        cupoMaximo: concurso.cupoMaximo ?? '',
        minimoJurados: concurso.minimoJurados ?? '',
        condiciones: concurso.condiciones ?? '',
      })
    }).catch((fallo) => setError(fallo.message)).finally(() => setCargando(false))
  }, [editando, id])

  function cambiar(campo) {
    return (evento) => setFormulario({ ...formulario, [campo]: evento.target.value })
  }

  async function guardar(evento) {
    evento.preventDefault()
    setError('')
    const cuerpo = {
      ...formulario,
      fechaInicio: formulario.fechaInicio || null,
      fechaCierre: formulario.fechaCierre || null,
      cupoMaximo: formulario.cupoMaximo === '' ? null : Number(formulario.cupoMaximo),
      minimoJurados: formulario.minimoJurados === '' ? null : Number(formulario.minimoJurados),
    }
    try {
      const guardado = editando ? await api.actualizar(`/concursos/${id}`, cuerpo) : await api.enviar('/concursos', cuerpo)
      navegar(`/concursos/${guardado.id}`)
    } catch (fallo) {
      setError(fallo.message)
    }
  }

  const titulo = editando ? 'Editar concurso' : 'Nuevo concurso'
  if (cargando) return <Pagina titulo={titulo}><Cargando /></Pagina>

  return (
    <Pagina titulo={titulo}>
      <EncabezadoPagina etiqueta="Configuración general" titulo={editando ? 'Editar concurso' : 'Crear un nuevo concurso'}
                        descripcion="Define la información base; después configuras categorías, rúbrica, proyectos y jurados." />
      <Mensaje texto={error} />

      <form className="card" onSubmit={guardar}>
        <div className="card-body p-4 row g-3">
          <h2 className="h5 col-12 mb-0">Información del concurso</h2>
          <div className="col-12">
            <label className="form-label" htmlFor="nombre">Nombre <span className="text-danger">*</span></label>
            <input id="nombre" className="form-control" required maxLength={160} value={formulario.nombre}
                   onChange={cambiar('nombre')} placeholder="Ej. Feria de Innovación 2026" />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" className="form-control" rows={4} maxLength={1500} value={formulario.descripcion}
                      onChange={cambiar('descripcion')} placeholder="Descripción general del concurso…" />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="fechaInicio">Fecha de inicio</label>
            <input id="fechaInicio" type="date" className="form-control" value={formulario.fechaInicio} onChange={cambiar('fechaInicio')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="fechaCierre">Fecha de cierre</label>
            <input id="fechaCierre" type="date" className="form-control" value={formulario.fechaCierre} onChange={cambiar('fechaCierre')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="estado">Estado</label>
            <select id="estado" className="form-select" value={formulario.estado} onChange={cambiar('estado')}>
              {ESTADOS.map((e) => <option key={e.valor} value={e.valor}>{e.texto}</option>)}
            </select>
          </div>

          <h2 className="h5 col-12 mt-4 mb-0">Reglas básicas</h2>
          <div className="col-md-4">
            <label className="form-label" htmlFor="tipo">Tipo de concurso</label>
            <input id="tipo" className="form-control" maxLength={80} value={formulario.tipo} onChange={cambiar('tipo')}
                   placeholder="Ej. Tecnología e innovación" />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="cupoMaximo">Cupo máximo de proyectos</label>
            <input id="cupoMaximo" type="number" min="1" className="form-control" value={formulario.cupoMaximo} onChange={cambiar('cupoMaximo')} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="minimoJurados">N° mínimo de jurados por proyecto</label>
            <input id="minimoJurados" type="number" min="1" className="form-control" value={formulario.minimoJurados} onChange={cambiar('minimoJurados')} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="condiciones">Condiciones generales</label>
            <textarea id="condiciones" className="form-control" rows={3} maxLength={1500} value={formulario.condiciones}
                      onChange={cambiar('condiciones')} placeholder="Condiciones generales…" />
          </div>

          <div className="col-12 d-flex justify-content-end gap-2">
            <Link className="btn btn-outline-secondary" to={editando ? `/concursos/${id}` : '/concursos'}>Cancelar</Link>
            <button className="btn btn-primary" type="submit">{editando ? 'Guardar cambios' : 'Crear y continuar →'}</button>
          </div>
        </div>
      </form>
    </Pagina>
  )
}
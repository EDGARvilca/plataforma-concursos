import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'

const NUEVA = { id: null, nombre: '', descripcion: '', activa: true }

/** Gestión de categorías del concurso (WF07): tabla a la izquierda y formulario lateral. */
export default function Categorias() {
  const { id } = useParams()
  const { datos: categorias, cargando, error, recargar } = useCarga(`/concursos/${id}/categorias`)
  const [edicion, setEdicion] = useState(NUEVA)
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  async function guardar(evento) {
    evento.preventDefault()
    const cuerpo = { nombre: edicion.nombre, descripcion: edicion.descripcion, activa: edicion.activa }
    try {
      if (edicion.id) await api.actualizar(`/concursos/${id}/categorias/${edicion.id}`, cuerpo)
      else await api.enviar(`/concursos/${id}/categorias`, cuerpo)
      setEdicion(NUEVA)
      setMensaje({ tipo: 'exito', texto: 'Categoría guardada correctamente' })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  return (
    <Pagina titulo="Categorías">
      <EncabezadoPagina etiqueta="Configuración" titulo="Gestión de categorías"
                        descripcion="Áreas, líneas o categorías en las que participan los proyectos.">
        <Link className="btn btn-outline-secondary" to={`/concursos/${id}`}>← Volver a la configuración</Link>
      </EncabezadoPagina>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto || error} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      <div className="row g-3">
        <div className="col-xl-7">
          <div className="card"><div className="card-body">
            {cargando ? <Cargando /> : categorias.length === 0 ? (
              <EstadoVacio titulo="No hay registros todavía" texto="Crea la primera categoría con el formulario." />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th><th /></tr></thead>
                  <tbody>
                    {categorias.map((categoria) => (
                      <tr key={categoria.id}>
                        <td className="fw-semibold">{categoria.nombre}</td>
                        <td className="small">{categoria.descripcion}</td>
                        <td><Insignia texto={categoria.activa ? 'Activo' : 'Inactivo'} clase={categoria.activa ? 'estado-open' : 'estado-draft'} /></td>
                        <td className="text-end">
                          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setEdicion(categoria)}>Editar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div></div>
        </div>

        <div className="col-xl-5">
          <form className="card" onSubmit={guardar}>
            <div className="card-body">
              <h2 className="h5">{edicion.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <div className="mb-3">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input id="nombre" className="form-control" required value={edicion.nombre}
                       onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="descripcion">Descripción</label>
                <textarea id="descripcion" className="form-control" rows={3} value={edicion.descripcion ?? ''}
                          onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })} />
              </div>
              <div className="form-check form-switch mb-3">
                <input id="activa" className="form-check-input" type="checkbox" checked={edicion.activa}
                       onChange={(e) => setEdicion({ ...edicion, activa: e.target.checked })} />
                <label className="form-check-label" htmlFor="activa">Categoría activa (se ofrece al registrar proyectos)</label>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">Guardar categoría</button>
                {edicion.id && <button className="btn btn-outline-secondary" type="button" onClick={() => setEdicion(NUEVA)}>Cancelar</button>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Pagina>
  )
}
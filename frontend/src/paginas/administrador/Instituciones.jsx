import { useState } from 'react'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'

const NUEVA = { id: null, nombre: '', ciudad: '', activa: true }

/** Catálogo de instituciones educativas a las que pertenecen los usuarios. */
export default function Instituciones() {
  const { datos, cargando, error, recargar } = useCarga('/administracion/instituciones')
  const [edicion, setEdicion] = useState(NUEVA)
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  async function guardar(evento) {
    evento.preventDefault()
    const cuerpo = { nombre: edicion.nombre, ciudad: edicion.ciudad, activa: edicion.activa }
    try {
      if (edicion.id) await api.actualizar(`/administracion/instituciones/${edicion.id}`, cuerpo)
      else await api.enviar('/administracion/instituciones', cuerpo)
      setEdicion(NUEVA)
      setMensaje({ tipo: 'exito', texto: 'Institución guardada correctamente' })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  return (
    <Pagina titulo="Instituciones">
      <EncabezadoPagina etiqueta="Administración" titulo="Instituciones" descripcion="Colegios, institutos y universidades registradas." />
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto || error} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="card"><div className="card-body">
            {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio titulo="No hay registros todavía" /> : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Nombre</th><th>Ciudad</th><th>Estado</th><th /></tr></thead>
                  <tbody>
                    {datos.map((i) => (
                      <tr key={i.id}>
                        <td className="fw-semibold">{i.nombre}</td>
                        <td>{i.ciudad || '—'}</td>
                        <td><Insignia texto={i.activa ? 'Activa' : 'Inactiva'} clase={i.activa ? 'estado-open' : 'estado-draft'} /></td>
                        <td className="text-end"><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setEdicion({ ...i, ciudad: i.ciudad ?? '' })}>Editar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div></div>
        </div>
        <div className="col-xl-4">
          <form className="card" onSubmit={guardar}>
            <div className="card-body">
              <h2 className="h5">{edicion.id ? 'Editar institución' : '+ Nueva institución'}</h2>
              <div className="mb-3">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input id="nombre" className="form-control" required value={edicion.nombre} onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="ciudad">Ciudad</label>
                <input id="ciudad" className="form-control" value={edicion.ciudad} onChange={(e) => setEdicion({ ...edicion, ciudad: e.target.value })} />
              </div>
              <div className="form-check form-switch mb-3">
                <input id="activa" className="form-check-input" type="checkbox" checked={edicion.activa} onChange={(e) => setEdicion({ ...edicion, activa: e.target.checked })} />
                <label className="form-check-label" htmlFor="activa">Institución activa</label>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">Guardar</button>
                {edicion.id && <button className="btn btn-outline-secondary" type="button" onClick={() => setEdicion(NUEVA)}>Cancelar</button>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Pagina>
  )
}
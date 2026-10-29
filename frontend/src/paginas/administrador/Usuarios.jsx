import { useMemo, useState } from 'react'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Insignia from '../../componentes/Insignia.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'

const ROLES = [
  { valor: 'ORGANIZER', texto: 'Organizador' },
  { valor: 'JUDGE', texto: 'Jurado' },
  { valor: 'PARTICIPANT', texto: 'Participante' },
  { valor: 'ADMIN', texto: 'Administrador' },
]

const NUEVO = { id: null, nombre: '', correo: '', clave: '', rol: 'PARTICIPANT', institucionId: '', activo: true }

/** Gestión de usuarios y roles (WF18): lista con filtros y formulario lateral para crear o editar. */
export default function Usuarios() {
  const { datos: usuarios, cargando, error, recargar } = useCarga('/administracion/usuarios')
  const { datos: instituciones } = useCarga('/administracion/instituciones')
  const [edicion, setEdicion] = useState(NUEVO)
  const [texto, setTexto] = useState('')
  const [rol, setRol] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  const visibles = useMemo(() => (usuarios ?? []).filter((u) =>
    (!rol || u.rol === rol) && `${u.nombre} ${u.correo}`.toLowerCase().includes(texto.trim().toLowerCase())), [usuarios, texto, rol])

  async function guardar(evento) {
    evento.preventDefault()
    const cuerpo = {
      nombre: edicion.nombre, correo: edicion.correo, clave: edicion.clave, rol: edicion.rol,
      institucionId: edicion.institucionId ? Number(edicion.institucionId) : null, activo: edicion.activo,
    }
    try {
      if (edicion.id) await api.actualizar(`/administracion/usuarios/${edicion.id}`, cuerpo)
      else await api.enviar('/administracion/usuarios', cuerpo)
      setEdicion(NUEVO)
      setMensaje({ tipo: 'exito', texto: 'Usuario guardado correctamente' })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  function editar(usuario) {
    setEdicion({ ...usuario, clave: '', institucionId: usuario.institucionId ?? '' })
  }

  return (
    <Pagina titulo="Usuarios">
      <EncabezadoPagina etiqueta="Administración" titulo="Gestión de usuarios" descripcion="Registro, roles y estado de los usuarios." />
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto || error} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="card"><div className="card-body">
            <div className="fila-filtros">
              <input type="search" className="form-control" placeholder="Buscar usuario…" value={texto} onChange={(e) => setTexto(e.target.value)} />
              <select className="form-select" value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="">Rol: todos</option>
                {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.texto}</option>)}
              </select>
            </div>
            {cargando ? <Cargando /> : visibles.length === 0 ? <EstadoVacio titulo="No hay registros todavía" /> : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Institución</th><th>Estado</th><th /></tr></thead>
                  <tbody>
                    {visibles.map((u) => (
                      <tr key={u.id}>
                        <td className="fw-semibold">{u.nombre}</td>
                        <td className="small">{u.correo}</td>
                        <td>{u.rolEtiqueta}</td>
                        <td className="small">{u.institucion || '—'}</td>
                        <td><Insignia texto={u.activo ? 'Activo' : 'Inactivo'} clase={u.activo ? 'estado-open' : 'estado-draft'} /></td>
                        <td className="text-end"><button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => editar(u)}>Editar</button></td>
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
              <h2 className="h5">{edicion.id ? 'Editar usuario' : '+ Nuevo usuario'}</h2>
              <div className="mb-3">
                <label className="form-label" htmlFor="nombre">Nombre completo</label>
                <input id="nombre" className="form-control" required value={edicion.nombre} onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="correo">Correo</label>
                <input id="correo" type="email" className="form-control" required value={edicion.correo} onChange={(e) => setEdicion({ ...edicion, correo: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="clave">{edicion.id ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
                <input id="clave" type="password" className="form-control" minLength={8} required={!edicion.id} value={edicion.clave}
                       onChange={(e) => setEdicion({ ...edicion, clave: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="rol">Rol</label>
                <select id="rol" className="form-select" value={edicion.rol} onChange={(e) => setEdicion({ ...edicion, rol: e.target.value })}>
                  {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.texto}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="institucion">Institución</label>
                <select id="institucion" className="form-select" value={edicion.institucionId} onChange={(e) => setEdicion({ ...edicion, institucionId: e.target.value })}>
                  <option value="">Sin institución</option>
                  {(instituciones ?? []).filter((i) => i.activa || i.id === edicion.institucionId).map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
              </div>
              <div className="form-check form-switch mb-3">
                <input id="activo" className="form-check-input" type="checkbox" checked={edicion.activo} onChange={(e) => setEdicion({ ...edicion, activo: e.target.checked })} />
                <label className="form-check-label" htmlFor="activo">Usuario activo</label>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">Guardar usuario</button>
                {edicion.id && <button className="btn btn-outline-secondary" type="button" onClick={() => setEdicion(NUEVO)}>Cancelar</button>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Pagina>
  )
}
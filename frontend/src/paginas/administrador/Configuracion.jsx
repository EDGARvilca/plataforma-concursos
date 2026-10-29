import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, MODO_LOCAL } from '../../servicios/api.js'
import { useSesion } from '../../contexto/ContextoSesion.jsx'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { guardarPreferencias, leerPreferencias } from '../../utilidades/preferencias.js'

/**
 * Configuración del administrador (WF17). Reúne tres cosas:
 *  1. Mi cuenta: cambiar mi contraseña.
 *  2. Valores por defecto que se cargan al crear un concurso nuevo.
 *  3. Apariencia: tamaño del texto.
 * Las preferencias (2 y 3) se guardan en este navegador.
 * Si la página funciona sin servidor, además se pueden restablecer los datos de ejemplo.
 */
export default function Configuracion() {
  const { usuario } = useSesion()
  const [preferencias, setPreferencias] = useState(leerPreferencias)
  const [mensajePreferencias, setMensajePreferencias] = useState({ tipo: 'exito', texto: '' })
  const [clave, setClave] = useState({ nueva: '', confirmacion: '' })
  const [mensajeClave, setMensajeClave] = useState({ tipo: 'exito', texto: '' })

  async function restablecer() {
    if (!window.confirm('Se borrarán todos los cambios hechos en este navegador y volverán los datos de ejemplo. ¿Continuar?')) return
    const { restablecerDatos } = await import('../../servicios/apiLocal.js')
    restablecerDatos()
    window.location.reload()
  }

  function cambiar(campo) {
    return (evento) => setPreferencias({ ...preferencias, [campo]: evento.target.value })
  }

  function guardar(evento) {
    evento.preventDefault()
    guardarPreferencias(preferencias)
    setMensajePreferencias({ tipo: 'exito', texto: 'Configuración guardada en este navegador' })
  }

  async function cambiarClave(evento) {
    evento.preventDefault()
    if (clave.nueva !== clave.confirmacion) {
      setMensajeClave({ tipo: 'error', texto: 'Las contraseñas no coinciden' })
      return
    }
    try {
      // Uso el mismo endpoint de usuarios: mando mis datos tal cual y solo cambia la contraseña
      await api.actualizar(`/administracion/usuarios/${usuario.id}`, {
        nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol,
        institucionId: usuario.institucionId, activo: true, clave: clave.nueva,
      })
      setClave({ nueva: '', confirmacion: '' })
      setMensajeClave({ tipo: 'exito', texto: 'Contraseña actualizada' })
    } catch (fallo) {
      setMensajeClave({ tipo: 'error', texto: fallo.message })
    }
  }

  return (
    <Pagina titulo="Configuración">
      <EncabezadoPagina etiqueta="Administración" titulo="Configuración"
                        descripcion="Tu cuenta, los valores por defecto de los concursos y la apariencia." />

      <div className="row g-3">
        <div className="col-lg-6">
          <form className="card h-100" onSubmit={cambiarClave}>
            <div className="card-body">
              <h2 className="h5">Mi cuenta</h2>
              <p className="text-secondary small mb-3">{usuario.nombre} · {usuario.correo} · {usuario.rolEtiqueta}</p>
              <Mensaje tipo={mensajeClave.tipo} texto={mensajeClave.texto} alCerrar={() => setMensajeClave({ ...mensajeClave, texto: '' })} />
              <div className="mb-3">
                <label className="form-label" htmlFor="clave-nueva">Contraseña nueva</label>
                <input id="clave-nueva" type="password" className="form-control" minLength={8} required autoComplete="new-password"
                       value={clave.nueva} onChange={(e) => setClave({ ...clave, nueva: e.target.value })} />
                <div className="form-text">Mínimo 8 caracteres.</div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="clave-confirmacion">Repite la contraseña</label>
                <input id="clave-confirmacion" type="password" className="form-control" required autoComplete="new-password"
                       value={clave.confirmacion} onChange={(e) => setClave({ ...clave, confirmacion: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit">Cambiar contraseña</button>
            </div>
          </form>
        </div>

        <div className="col-lg-6">
          <form className="card h-100" onSubmit={guardar}>
            <div className="card-body">
              <h2 className="h5">Valores por defecto de un concurso nuevo</h2>
              <p className="text-secondary small">Se cargan solos al abrir «Nuevo concurso»; igual puedes cambiarlos en cada uno.</p>
              <Mensaje tipo={mensajePreferencias.tipo} texto={mensajePreferencias.texto} alCerrar={() => setMensajePreferencias({ ...mensajePreferencias, texto: '' })} />
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="tipo">Tipo de concurso</label>
                  <input id="tipo" className="form-control" maxLength={80} value={preferencias.concursoTipo}
                         onChange={cambiar('concursoTipo')} placeholder="Ej. Tecnología e innovación" />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="cupo">Cupo máximo</label>
                  <input id="cupo" type="number" min="1" className="form-control" value={preferencias.concursoCupoMaximo}
                         onChange={cambiar('concursoCupoMaximo')} />
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="jurados">Jurados por proyecto (mínimo)</label>
                  <input id="jurados" type="number" min="1" className="form-control" value={preferencias.concursoMinimoJurados}
                         onChange={cambiar('concursoMinimoJurados')} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="condiciones">Condiciones generales</label>
                  <textarea id="condiciones" className="form-control" rows={3} maxLength={1500}
                            value={preferencias.concursoCondiciones} onChange={cambiar('concursoCondiciones')} />
                </div>

                <div className="col-12">
                  <h2 className="h5 mt-2">Apariencia</h2>
                  <label className="form-label" htmlFor="texto">Tamaño del texto</label>
                  <select id="texto" className="form-select" value={preferencias.tamanoTexto} onChange={cambiar('tamanoTexto')}>
                    <option value="normal">Normal</option>
                    <option value="grande">Grande (más fácil de leer)</option>
                  </select>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Guardar configuración</button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-12">
          <div className="card"><div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="h5 mb-1">Catálogos de la plataforma</h2>
              <p className="text-secondary small mb-0">Quién usa la plataforma y a qué institución pertenece.</p>
            </div>
            <div className="d-flex gap-2">
              <Link className="btn btn-suave" to="/administracion/usuarios">Usuarios y roles</Link>
              <Link className="btn btn-suave" to="/administracion/instituciones">Instituciones</Link>
            </div>
          </div></div>
        </div>

        {MODO_LOCAL && (
          <div className="col-12">
            <div className="card"><div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h2 className="h5 mb-1">Datos guardados en este navegador</h2>
                <p className="text-secondary small mb-0">
                  Esta versión todavía no usa base de datos: lo que registres se guarda solo en este equipo.
                </p>
              </div>
              <button className="btn btn-outline-secondary" type="button" onClick={restablecer}>Volver a los datos de ejemplo</button>
            </div></div>
          </div>
        )}
      </div>
    </Pagina>
  )
}
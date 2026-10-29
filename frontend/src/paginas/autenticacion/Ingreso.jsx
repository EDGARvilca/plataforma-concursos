import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { INICIO_POR_ROL, useSesion } from '../../contexto/ContextoSesion.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import PanelHistoria from './PanelHistoria.jsx'

// Cuentas de prueba: al tocar una se rellenan el correo y la clave
const CUENTAS_PRUEBA = [
  { rol: 'Administrador', correo: 'admin@demo.pe', clave: 'Admin123*' },
  { rol: 'Organizador', correo: 'organizador@demo.pe', clave: 'Org123*' },
  { rol: 'Jurado', correo: 'jurado@demo.pe', clave: 'Jurado123*' },
  { rol: 'Participante', correo: 'participante@demo.pe', clave: 'Part123*' },
]

export default function Ingreso() {
  const { usuario, iniciarSesion } = useSesion()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si ya hay sesión no tiene sentido mostrar el login
  if (usuario) return <Navigate to={INICIO_POR_ROL[usuario.rol]} replace />

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const datos = await iniciarSesion(correo, clave)
      navegar(INICIO_POR_ROL[datos.rol], { replace: true })
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="container-fluid pagina-acceso">
      <div className="row min-vh-100">
        <PanelHistoria />

        <section className="col-lg-5 d-flex align-items-center justify-content-center p-3">
          <div className="card tarjeta-acceso w-100">
            <div className="card-body p-4 p-md-5">
              <span className="etiqueta-seccion">Acceso seguro</span>
              <h1 className="h2">Iniciar sesión</h1>
              <p className="text-secondary">Ingresa con tu cuenta; te llevo a tu panel según tu rol.</p>

              {parametros.has('restablecida') && (
                <Mensaje tipo="exito" texto="Contraseña actualizada. Ya puedes iniciar sesión." />
              )}
              <Mensaje texto={error} />

              <form onSubmit={enviar}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="correo">Correo electrónico</label>
                  <input id="correo" type="email" className="form-control" autoComplete="username"
                         placeholder="usuario@correo.com" required value={correo}
                         onChange={(e) => setCorreo(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="clave">Contraseña</label>
                  <div className="input-group">
                    <input id="clave" type={verClave ? 'text' : 'password'} className="form-control"
                           autoComplete="current-password" required value={clave}
                           onChange={(e) => setClave(e.target.value)} />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setVerClave(!verClave)}>
                      {verClave ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>
                <div className="text-end mb-3">
                  <Link to="/olvide-clave" className="small">¿Olvidaste tu contraseña?</Link>
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={enviando}>
                  {enviando ? 'Ingresando…' : 'Iniciar sesión'}
                </button>
              </form>

              <hr className="my-4" />
              <small className="etiqueta-seccion">Cuentas de prueba</small>
              <div className="row g-2 mt-1">
                {CUENTAS_PRUEBA.map((cuenta) => (
                  <div className="col-6" key={cuenta.correo}>
                    <button type="button"
                            className={`btn btn-outline-secondary w-100 cuenta-prueba ${correo === cuenta.correo ? 'seleccionada' : ''}`}
                            onClick={() => { setCorreo(cuenta.correo); setClave(cuenta.clave) }}>
                      {cuenta.rol}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
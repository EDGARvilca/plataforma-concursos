import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Mensaje from '../../componentes/Mensaje.jsx'
import PanelHistoria from './PanelHistoria.jsx'

export default function OlvideClave() {
  const [correo, setCorreo] = useState('')
  const [respuesta, setRespuesta] = useState(null)
  const [error, setError] = useState('')

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    try {
      setRespuesta(await api.enviar('/autenticacion/olvide', { correo }))
    } catch (fallo) {
      setError(fallo.message)
    }
  }

  return (
    <div className="container-fluid pagina-acceso">
      <div className="row min-vh-100">
        <PanelHistoria />
        <section className="col-lg-5 d-flex align-items-center justify-content-center p-3">
          <div className="card tarjeta-acceso w-100">
            <div className="card-body p-4 p-md-5">
              <span className="etiqueta-seccion">Recuperar acceso</span>
              <h1 className="h2">¿Olvidaste tu contraseña?</h1>
              <Mensaje texto={error} />

              {respuesta ? (
                <>
                  <p className="text-secondary">{respuesta.mensaje}</p>
                  {respuesta.enlace && (
                    <div className="recuadro mb-3">
                      <small className="d-block mb-1">Como aún no se envían correos, usa este enlace:</small>
                      <Link to={respuesta.enlace}>Crear una contraseña nueva</Link>
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={enviar}>
                  <p className="text-secondary">Escribe tu correo y te genero un enlace para crear una contraseña nueva.</p>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="correo">Correo electrónico</label>
                    <input id="correo" type="email" className="form-control" required value={correo}
                           onChange={(e) => setCorreo(e.target.value)} />
                  </div>
                  <button className="btn btn-primary w-100" type="submit">Generar enlace</button>
                </form>
              )}
              <div className="text-center mt-3"><Link to="/ingreso" className="small">← Volver al inicio de sesión</Link></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
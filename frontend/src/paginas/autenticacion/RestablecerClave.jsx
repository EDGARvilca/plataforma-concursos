import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Mensaje from '../../componentes/Mensaje.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import PanelHistoria from './PanelHistoria.jsx'

export default function RestablecerClave() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token') || ''
  const navegar = useNavigate()
  const [estado, setEstado] = useState('validando') // validando | valido | invalido
  const [errorToken, setErrorToken] = useState('')
  const [clave, setClave] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState('')

  // Primero compruebo que el enlace sea válido y no haya vencido
  useEffect(() => {
    api.obtener(`/autenticacion/restablecer/validar?token=${encodeURIComponent(token)}`)
      .then(() => setEstado('valido'))
      .catch((fallo) => {
        setErrorToken(fallo.message)
        setEstado('invalido')
      })
  }, [token])

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    try {
      await api.enviar('/autenticacion/restablecer', { token, clave, confirmacion })
      navegar('/ingreso?restablecida', { replace: true })
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
              <span className="etiqueta-seccion">Nueva contraseña</span>
              <h1 className="h2">Crear contraseña nueva</h1>

              {estado === 'validando' && <Cargando />}
              {estado === 'invalido' && (
                <>
                  <Mensaje texto={errorToken} />
                  <Link to="/olvide-clave" className="btn btn-primary w-100">Pedir otro enlace</Link>
                </>
              )}
              {estado === 'valido' && (
                <form onSubmit={enviar}>
                  <Mensaje texto={error} />
                  <div className="mb-3">
                    <label className="form-label" htmlFor="clave">Contraseña nueva</label>
                    <input id="clave" type="password" className="form-control" minLength={8} required
                           value={clave} onChange={(e) => setClave(e.target.value)} />
                    <div className="form-text">Mínimo 8 caracteres.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="confirmacion">Repite la contraseña</label>
                    <input id="confirmacion" type="password" className="form-control" required
                           value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
                  </div>
                  <button className="btn btn-primary w-100" type="submit">Guardar contraseña</button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
import { Navigate } from 'react-router-dom'
import { INICIO_POR_ROL, useSesion } from '../contexto/ContextoSesion.jsx'
import Cargando from './Cargando.jsx'

/**
 * Deja pasar solo a quien inició sesión y tiene uno de los roles permitidos.
 * Si no hay sesión lo mando al login; si el rol no corresponde, a su propia página de inicio.
 */
export default function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useSesion()

  if (cargando) return <Cargando texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/ingreso" replace />
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={INICIO_POR_ROL[usuario.rol]} replace />
  }
  return children
}
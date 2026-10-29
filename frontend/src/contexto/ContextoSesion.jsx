import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../servicios/api.js'

const ContextoSesion = createContext(null)

/** Página de inicio de cada rol, para redirigir después del login. */
export const INICIO_POR_ROL = {
  ADMIN: '/panel',
  ORGANIZER: '/panel',
  JUDGE: '/jurado',
  PARTICIPANT: '/participante',
}

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al abrir la app pregunto si ya hay una sesión activa
  useEffect(() => {
    api.obtener('/autenticacion/yo')
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false))
  }, [])

  // Si en cualquier llamada la API responde 401, saco al usuario
  useEffect(() => {
    const alExpirar = () => setUsuario(null)
    window.addEventListener('sesion-expirada', alExpirar)
    return () => window.removeEventListener('sesion-expirada', alExpirar)
  }, [])

  const iniciarSesion = useCallback(async (correo, clave) => {
    const datos = await api.enviar('/autenticacion/iniciar', { correo, clave })
    setUsuario(datos)
    return datos
  }, [])

  const cerrarSesion = useCallback(async () => {
    await api.enviar('/autenticacion/salir')
    setUsuario(null)
  }, [])

  return (
    <ContextoSesion.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </ContextoSesion.Provider>
  )
}

export function useSesion() {
  return useContext(ContextoSesion)
}
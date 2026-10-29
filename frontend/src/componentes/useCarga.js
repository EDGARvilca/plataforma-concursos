import { useCallback, useEffect, useState } from 'react'
import { api } from '../servicios/api.js'

/**
 * Pide datos a la API cuando se abre la pantalla.
 * Devuelve { datos, cargando, error, recargar } para que cada página solo se preocupe de mostrarlos.
 */
export function useCarga(ruta) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(() => {
    setCargando(true)
    return api.obtener(ruta)
      .then((respuesta) => {
        setDatos(respuesta)
        setError('')
      })
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false))
  }, [ruta])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { datos, cargando, error, recargar }
}
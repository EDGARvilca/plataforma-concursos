import { useEffect } from 'react'

/** Aviso de éxito o error. Los de éxito se quitan solos a los 3 segundos. */
export default function Mensaje({ tipo = 'error', texto, alCerrar }) {
  useEffect(() => {
    if (tipo !== 'exito' || !texto || !alCerrar) return undefined
    const temporizador = setTimeout(alCerrar, 3000)
    return () => clearTimeout(temporizador)
  }, [tipo, texto, alCerrar])

  if (!texto) return null
  const clase = tipo === 'exito' ? 'alert-success' : 'alert-danger'
  return (
    <div className={`alert ${clase} d-flex justify-content-between align-items-start`} role="alert">
      <span>{texto}</span>
      {alCerrar && (
        <button type="button" className="btn-close" aria-label="Cerrar" onClick={alCerrar} />
      )}
    </div>
  )
}
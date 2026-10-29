import { useEffect, useRef, useState } from 'react'
import BarraLateral from './BarraLateral.jsx'

/**
 * A cada celda de las tablas le pongo el nombre de su columna (data-etiqueta).
 * En el celular el CSS usa ese nombre para mostrar cada fila como una tarjeta,
 * en vez de obligar a deslizar la tabla hacia los lados.
 */
function etiquetarTablas(contenedor) {
  contenedor.querySelectorAll('table').forEach((tabla) => {
    const titulos = [...tabla.querySelectorAll('thead th')].map((th) => th.textContent.trim())
    tabla.querySelectorAll('tbody tr').forEach((fila) => {
      ;[...fila.children].forEach((celda, posicion) => {
        const titulo = titulos[posicion]
        if (titulo && celda.getAttribute('data-etiqueta') !== titulo) celda.setAttribute('data-etiqueta', titulo)
      })
    })
  })
}

/**
 * Estructura común de todas las pantallas internas:
 * barra lateral + franja superior con el título + contenido.
 */
export default function Pagina({ titulo, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const contenido = useRef(null)

  // Las tablas aparecen cuando llegan los datos, así que vuelvo a etiquetar cada vez que cambia el contenido
  useEffect(() => {
    const contenedor = contenido.current
    if (!contenedor) return undefined
    etiquetarTablas(contenedor)
    const observador = new MutationObserver(() => etiquetarTablas(contenedor))
    observador.observe(contenedor, { childList: true, subtree: true })
    return () => observador.disconnect()
  }, [])

  return (
    <div className="app-shell">
      <BarraLateral abierta={menuAbierto} alCerrar={() => setMenuAbierto(false)} />
      <div className="app-main">
        <header className="app-top">
          <button
            className="btn btn-outline-secondary btn-sm d-lg-none"
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(true)}
          >
            ☰
          </button>
          <h2 className="titulo-pagina">{titulo}</h2>
        </header>
        <main className="app-content" ref={contenido}>{children}</main>
      </div>
    </div>
  )
}

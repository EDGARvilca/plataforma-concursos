import { useEffect, useId, useState } from 'react'
import { formatearNumero } from '../utilidades/formato.js'

// ---------------------------------------------------------------------------
// Medidas del dibujo (en unidades del viewBox). Lo dibujo más angosto que ancho
// para que en el celular las letras no queden diminutas al achicarse.
// ---------------------------------------------------------------------------
const ANCHO_LIENZO = 680
const ALTO_LIENZO = 470
const PISO = 430 // donde se apoyan los escalones
const ANCHO = 170 // ancho de la cara frontal
const PROFUNDIDAD = 18 // cuánto se corre la cara lateral hacia la derecha
const ELEVACION = 14 // cuánto sube la tapa (da la sensación de 3D)
// Altura de cada puesto: el 1.º siempre destaca. El puntaje solo ajusta un poco (hasta 15 % menos).
const ALTURA_POR_LUGAR = { 1: 230, 2: 170, 3: 125 }
const LINEA_NOMBRE = 23 // separación entre líneas del nombre en la placa

// Orden en pantalla: el 2.º a la izquierda, el 1.º al centro y el 3.º a la derecha
const PUESTOS = [
  { lugar: 2, x: 40, metal: 'plata', borde: '#cbd5e1' },
  { lugar: 1, x: 245, metal: 'oro', borde: '#e9c46a' },
  { lugar: 3, x: 450, metal: 'bronce', borde: '#d99665' },
]

// Colores de cada metal: frente (con brillos), lateral (más oscuro) y tapa (más clara)
const METALES = {
  oro: {
    frente: ['#fff2ad', '#ffd956', '#d89208', '#ffcb36', '#98600a'],
    lado: ['#c78109', '#633902'],
    tapa: ['#fff9cf', '#f7b92d'],
  },
  plata: {
    frente: ['#f9fdff', '#d4dce8', '#8795aa', '#e7edf5', '#68778d'],
    lado: ['#8291a5', '#39495f'],
    tapa: ['#ffffff', '#bbc9d9'],
  },
  bronce: {
    frente: ['#ffe0bb', '#df9c64', '#a75b30', '#e7a36d', '#824020'],
    lado: ['#ac633a', '#55250f'],
    tapa: ['#ffe9ce', '#c87743'],
  },
}
const PARADAS_FRENTE = [0, 0.12, 0.45, 0.75, 1]

/** Parte el título en hasta tres líneas; si aún no entra, lo corta con "…". */
function partirTitulo(texto, largoLinea = 14, maximoLineas = 3) {
  const palabras = texto.split(/\s+/)
  const lineas = ['']
  for (const palabra of palabras) {
    const actual = lineas[lineas.length - 1]
    const propuesta = actual ? `${actual} ${palabra}` : palabra
    if (propuesta.length <= largoLinea) {
      lineas[lineas.length - 1] = propuesta
    } else if (lineas.length < maximoLineas) {
      lineas.push(palabra)
    } else {
      lineas[maximoLineas - 1] = `${lineas[maximoLineas - 1]} ${palabra}`
      break
    }
  }
  return lineas.map((linea) => (linea.length > largoLinea ? `${linea.slice(0, largoLinea - 1)}…` : linea))
}

/** Hace crecer los escalones al aparecer (salvo que la persona prefiera menos animaciones). */
function useCrecimiento(clave) {
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    const sinAnimacion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (sinAnimacion) {
      setProgreso(1)
      return undefined
    }
    let cuadro = null
    const inicio = performance.now()
    const avanzar = (ahora) => {
      const t = Math.min((ahora - inicio) / 1000, 1)
      setProgreso(1 - (1 - t) ** 3) // arranca rápido y frena suave al final
      if (t < 1) cuadro = requestAnimationFrame(avanzar)
    }
    setProgreso(0)
    cuadro = requestAnimationFrame(avanzar)
    return () => cancelAnimationFrame(cuadro)
  }, [clave])

  return progreso
}

function Corona({ x, y }) {
  return (
    <path
      transform={`translate(${x - 22} ${y})`}
      d="M2 30 L7 8 L17 19 L22 3 L27 19 L37 8 L42 30 Z M2 33 h40 v5 h-40 Z"
      fill="#d9a520"
    />
  )
}

/** Un escalón: sombra, cara lateral, frente metálico, brillo, tapa, número y la placa con el proyecto. */
function Escalon({ puesto, fila, altura, ids }) {
  const { lugar, x, metal, borde } = puesto
  const y = PISO - altura
  const centroX = x + ANCHO / 2
  const centroNumero = y + altura * 0.52
  const vacio = !fila
  const lineas = vacio ? ['Por definir'] : partirTitulo(fila.titulo)
  // La placa crece según cuántas líneas ocupe el nombre
  const altoPlaca = 44 + lineas.length * LINEA_NOMBRE
  const yPlaca = y - ELEVACION - 12 - altoPlaca

  return (
    <g>
      <title>{vacio ? `${lugar}.º puesto: por definir` : `${lugar}.º puesto: ${fila.titulo}, ${formatearNumero(fila.promedio, 2)} puntos`}</title>

      <ellipse cx={centroX + 12} cy={PISO + 6} rx={ANCHO * 0.62} ry={12} fill="#1c1a16" opacity=".28" filter={`url(#${ids.sombra})`} />

      {vacio ? (
        // Puesto sin proyecto: un escalón "fantasma", rayado y punteado
        <g opacity=".75">
          <path d={`M${x + ANCHO} ${y} l${PROFUNDIDAD} ${-ELEVACION} V${PISO - ELEVACION} L${x + ANCHO} ${PISO} Z`} fill="#e4dac5" />
          <rect x={x} y={y} width={ANCHO} height={altura} fill={`url(#${ids.rayado})`} stroke="#c9bb9f" strokeDasharray="6 5" strokeWidth="1.5" />
          <path d={`M${x} ${y} l${PROFUNDIDAD} ${-ELEVACION} h${ANCHO} l${-PROFUNDIDAD} ${ELEVACION} Z`} fill="#f1eadb" />
        </g>
      ) : (
        <g>
          <path d={`M${x + ANCHO} ${y} l${PROFUNDIDAD} ${-ELEVACION} V${PISO - ELEVACION} L${x + ANCHO} ${PISO} Z`} fill={`url(#${ids[metal].lado})`} />
          <rect x={x} y={y} width={ANCHO} height={altura} fill={`url(#${ids[metal].frente})`} stroke="#1c1a16" strokeOpacity=".18" />
          <rect x={x + 10} y={y + 8} width={ANCHO - 20} height={Math.max(0, altura - 14)} rx="3" fill={`url(#${ids.reflejo})`} opacity=".6" />
          <path d={`M${x} ${y} l${PROFUNDIDAD} ${-ELEVACION} h${ANCHO} l${-PROFUNDIDAD} ${ELEVACION} Z`} fill={`url(#${ids[metal].tapa})`} stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />
        </g>
      )}

      {altura > 75 && (
        <>
          <circle cx={centroX} cy={centroNumero} r="32" fill="#1c1a16" fillOpacity={vacio ? 0.05 : 0.14} stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
          <text x={centroX} y={centroNumero} textAnchor="middle" dominantBaseline="central" className="podio-numero"
                fill={vacio ? '#b9ad94' : '#fffaf0'} filter={vacio ? undefined : `url(#${ids.sombraTexto})`}>
            {lugar}
          </text>
        </>
      )}

      {/* Placa con el nombre del proyecto y su puntaje, flotando sobre el escalón */}
      <g opacity={vacio ? 0.7 : 1}>
        <rect x={x + 6} y={yPlaca} width={ANCHO - 12} height={altoPlaca} rx="14"
              fill={vacio ? '#f7f2e6' : '#33493d'} stroke={vacio ? '#c9bb9f' : borde} strokeWidth="2.5"
              strokeDasharray={vacio ? '6 5' : undefined} />
        {lineas.map((linea, i) => (
          <text key={i} x={centroX} y={yPlaca + 28 + i * LINEA_NOMBRE} textAnchor="middle"
                className="podio-nombre-svg" fill={vacio ? '#8a7f6a' : '#ffffff'}>
            {linea}
          </text>
        ))}
        <text x={centroX} y={yPlaca + altoPlaca - 14} textAnchor="middle" className="podio-puntos-svg"
              fill={vacio ? '#a89c84' : '#e9d29a'}>
          {vacio ? 'sin evaluaciones' : `${formatearNumero(fila.promedio, 2)} pts`}
        </text>
      </g>

      {lugar === 1 && !vacio && <Corona x={centroX} y={yPlaca - 44} />}
    </g>
  )
}

/**
 * Podio 3D del Top 3 (WF16). Siempre dibuja los tres puestos; si aún no hay proyecto
 * para alguno, aparece como "Por definir". La altura de cada escalón depende del puntaje.
 */
export default function Podio({ filas }) {
  // useId da un id único por podio: así dos podios en la misma página no mezclan sus degradados
  const base = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = {
    reflejo: `${base}-reflejo`, sombra: `${base}-sombra`, sombraTexto: `${base}-sombra-texto`, rayado: `${base}-rayado`,
    ...Object.fromEntries(Object.keys(METALES).map((metal) => [metal, {
      frente: `${base}-${metal}-frente`, lado: `${base}-${metal}-lado`, tapa: `${base}-${metal}-tapa`,
    }])),
  }

  const top = filas.slice(0, 3)
  const maximo = Math.max(1, ...top.map((fila) => fila.promedio))
  const progreso = useCrecimiento(top.map((fila) => `${fila.proyectoId}:${fila.promedio}`).join('|'))

  // Altura final: la del puesto, ajustada un poco según qué tan cerca está del mejor puntaje
  const alturaDe = (fila, lugar) => {
    const base = ALTURA_POR_LUGAR[lugar]
    if (!fila) return base * 0.85
    return base * (0.85 + (0.15 * fila.promedio) / maximo)
  }

  const resumen = top.map((fila, i) => `${i + 1}. ${fila.titulo}, ${formatearNumero(fila.promedio, 2)} puntos`).join('; ')

  return (
    <div className="podio-3d">
      <svg viewBox={`0 0 ${ANCHO_LIENZO} ${ALTO_LIENZO}`} role="img" aria-label={`Podio. ${resumen || 'Aún sin puntajes'}`}>
        <defs>
          {Object.entries(METALES).map(([metal, colores]) => (
            <g key={metal}>
              <linearGradient id={ids[metal].frente}>
                {colores.frente.map((color, i) => <stop key={i} offset={PARADAS_FRENTE[i]} stopColor={color} />)}
              </linearGradient>
              <linearGradient id={ids[metal].lado} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={colores.lado[0]} />
                <stop offset="1" stopColor={colores.lado[1]} />
              </linearGradient>
              <linearGradient id={ids[metal].tapa} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={colores.tapa[0]} />
                <stop offset="1" stopColor={colores.tapa[1]} />
              </linearGradient>
            </g>
          ))}
          <linearGradient id={ids.reflejo} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity=".5" />
            <stop offset=".25" stopColor="#fff" stopOpacity=".06" />
            <stop offset=".7" stopColor="#fff" stopOpacity=".18" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <pattern id={ids.rayado} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="16" height="16" fill="#ece4d2" />
            <rect width="8" height="16" fill="#e4dac5" />
          </pattern>
          <filter id={ids.sombra} x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id={ids.sombraTexto} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity=".4" />
          </filter>
        </defs>

        {/* Piso */}
        <rect x="16" y={PISO} width={ANCHO_LIENZO - 32} height="10" rx="5" fill="#d9cdb4" />

        {PUESTOS.map((puesto) => {
          const fila = top[puesto.lugar - 1]
          return <Escalon key={puesto.lugar} puesto={puesto} fila={fila} altura={alturaDe(fila, puesto.lugar) * progreso} ids={ids} />
        })}
      </svg>
    </div>
  )
}

// Colores del logo oficial (tomados de la imagen original)
const CREMA = '#fbf0d4'
const VERDE = '#859763'
const DORADO = '#d3a53a'
const VERDE_MARCA = '#33493d' // reemplaza al crema cuando el logo va sobre fondo claro

/**
 * Ícono del logo redibujado en vector: una persona que alcanza la estrella
 * sobre tres barras que suben. Al ser SVG se ve nítido en cualquier tamaño.
 * El truco de las barras: un trazo grueso del mismo color con uniones redondeadas
 * les da las esquinas suaves del logo original.
 */
export function IconoLogo({ alto = 44, sobreOscuro = true }) {
  const claro = sobreOscuro ? CREMA : VERDE_MARCA
  const barra = { strokeWidth: 18, strokeLinejoin: 'round' }
  return (
    <svg height={alto} viewBox="370 60 660 760" role="img" aria-label="Evalúa Concursos" className="logo-icono">
      {/* estrella */}
      <path fill={DORADO} transform="rotate(-8 921 166)"
            d="M921 66 L944 136 L1018 136 L958 179 L981 249 L921 206 L861 249 L884 179 L824 136 L898 136 Z" />
      {/* cabeza */}
      <circle cx="663" cy="291" r="80" fill={claro} />
      {/* cuerpo con los brazos en alto */}
      <path fill={claro}
            d="M428 325 C500 328 600 360 660 416 L918 252 Q860 330 796 400 Q700 500 576 580 Q530 610 482 632 C540 560 540 420 428 325 Z" />
      {/* barras: crema, verde y dorada */}
      <polygon points="391,717 496,657 496,799 391,799" fill={claro} stroke={claro} {...barra} />
      <polygon points="539,641 659,575 659,771 631,799 539,799" fill={VERDE} stroke={VERDE} {...barra} />
      <polygon points="701,535 825,464 825,774 701,774" fill={DORADO} stroke={DORADO} {...barra} />
    </svg>
  )
}

/** Logo completo: ícono + "Evalúa" + "— CONCURSOS —", como en el diseño oficial. */
export default function Logo({ tamano = 44, conTexto = true, claro = false }) {
  return (
    // --logo-alto: el texto crece en proporción al ícono
    <span className={`logo ${claro ? 'logo-claro' : ''}`} style={{ '--logo-alto': `${tamano}px` }}>
      <IconoLogo alto={tamano} sobreOscuro={claro} />
      {conTexto && (
        <span className="logo-texto">
          <span className="logo-nombre">Evalúa</span>
          <span className="logo-sub">Concursos</span>
        </span>
      )}
    </span>
  )
}

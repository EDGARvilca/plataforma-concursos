/**
 * Gráfico circular (dona) hecho con SVG, sin librerías.
 * Dibujo un círculo de fondo y encima un arco cuyo largo depende del porcentaje.
 */
export default function GraficoCircular({ porcentaje, titulo, detalle, tamano = 168 }) {
  const grosor = 16
  const radio = (tamano - grosor) / 2
  const circunferencia = 2 * Math.PI * radio
  const limpio = Math.min(100, Math.max(0, Number(porcentaje) || 0))
  const largoArco = (limpio / 100) * circunferencia

  return (
    <figure className="grafico-circular" style={{ width: tamano }}>
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img"
           aria-label={`${titulo}: ${limpio.toFixed(0)}%`}>
        <circle cx={tamano / 2} cy={tamano / 2} r={radio} fill="none" stroke="#e6ddc9" strokeWidth={grosor} />
        <circle cx={tamano / 2} cy={tamano / 2} r={radio} fill="none" stroke="#33493d" strokeWidth={grosor}
                strokeLinecap="round" strokeDasharray={`${largoArco} ${circunferencia}`}
                transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`} />
        <text x="50%" y="48%" textAnchor="middle" className="grafico-cifra">{limpio.toFixed(0)}%</text>
        <text x="50%" y="62%" textAnchor="middle" className="grafico-leyenda">{titulo}</text>
      </svg>
      {detalle && <figcaption className="small text-secondary text-center">{detalle}</figcaption>}
    </figure>
  )
}
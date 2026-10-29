/**
 * Logo de la plataforma: un emblema con un podio y una estrella (el primer puesto),
 * y el nombre escrito en cursiva, igual que los títulos de las pantallas.
 */
export default function Logo({ tamano = 40, conTexto = true, claro = false }) {
  return (
    <span className={`logo ${claro ? 'logo-claro' : ''}`}>
      <svg width={tamano} height={tamano} viewBox="0 0 64 64" role="img" aria-label="Evalúa Concursos">
        <defs>
          <linearGradient id="logo-fondo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9a86a" />
            <stop offset="1" stopColor="#7a6a3c" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#logo-fondo)" />
        <rect x="7" y="7" width="50" height="50" rx="14" fill="none" stroke="#fdfbf7" strokeOpacity=".35" strokeWidth="1.2" />
        <rect x="13" y="38" width="10" height="13" rx="2" fill="#fdfbf7" fillOpacity=".55" />
        <rect x="27" y="29" width="10" height="22" rx="2" fill="#fdfbf7" />
        <rect x="41" y="43" width="10" height="8" rx="2" fill="#fdfbf7" fillOpacity=".4" />
        <path d="M32 11.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L32 24.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fdfbf7" />
      </svg>
      {conTexto && (
        <span className="logo-texto">
          <span className="logo-nombre">Evalúa</span>
          <span className="logo-sub">Concursos</span>
        </span>
      )}
    </span>
  )
}
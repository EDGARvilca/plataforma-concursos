import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../contexto/ContextoSesion.jsx'
import Logo from './Logo.jsx'

// Menú de cada rol, igual que en los wireframes WF03–WF19.
const MENUS = {
  ADMIN: [
    { ruta: '/panel', texto: 'Dashboard', icono: '▦' },
    { ruta: '/concursos', texto: 'Concursos', icono: '◈' },
    { ruta: '/proyectos', texto: 'Proyectos', icono: '▤' },
    { ruta: '/asignaciones', texto: 'Jurados', icono: '⚖', incluye: /^\/concursos\/[^/]+\/asignaciones/ },
    { ruta: '/evaluaciones', texto: 'Evaluaciones', icono: '✎', incluye: /^\/concursos\/[^/]+\/evaluaciones/ },
    { ruta: '/resultados', texto: 'Resultados', icono: '★' },
    { etiqueta: 'Administración' },
    { ruta: '/administracion/usuarios', texto: 'Usuarios', icono: '☺' },
    { ruta: '/administracion/instituciones', texto: 'Instituciones', icono: '⌂' },
    { ruta: '/administracion/configuracion', texto: 'Configuración', icono: '⚙' },
  ],
  ORGANIZER: [
    { ruta: '/panel', texto: 'Dashboard', icono: '▦' },
    { ruta: '/concursos', texto: 'Concursos', icono: '◈' },
    { ruta: '/proyectos', texto: 'Proyectos', icono: '▤' },
    { ruta: '/asignaciones', texto: 'Jurados', icono: '⚖', incluye: /^\/concursos\/[^/]+\/asignaciones/ },
    { ruta: '/evaluaciones', texto: 'Evaluaciones', icono: '✎', incluye: /^\/concursos\/[^/]+\/evaluaciones/ },
    { ruta: '/resultados', texto: 'Resultados', icono: '★' },
  ],
  JUDGE: [
    { ruta: '/jurado', texto: 'Dashboard', icono: '▦', exacta: true },
    { ruta: '/jurado/asignaciones', texto: 'Mis asignaciones', icono: '▤' },
    { ruta: '/jurado/evaluaciones', texto: 'Evaluaciones', icono: '✎' },
  ],
  PARTICIPANT: [
    { ruta: '/participante', texto: 'Mis proyectos', icono: '▤', exacta: true },
    { ruta: '/participante/registro', texto: 'Registrar proyecto', icono: '＋' },
    { ruta: '/participante/observaciones', texto: 'Observaciones', icono: '✉' },
    { ruta: '/participante/resultados', texto: 'Resultados', icono: '★' },
  ],
}

/**
 * Decide qué opción del menú se marca. Primero gana una opción que "incluye" la pantalla actual
 * (por ejemplo, /concursos/1/evaluaciones es de "Evaluaciones" aunque empiece con /concursos);
 * si ninguna la reclama, se marca la que coincide con el inicio de la dirección.
 */
function rutaActiva(opciones, actual) {
  const especial = opciones.find((o) => o.incluye?.test(actual))
  if (especial) return especial.ruta
  const coincide = opciones.find((o) => o.ruta && (actual === o.ruta || (!o.exacta && actual.startsWith(o.ruta + '/'))))
  return coincide?.ruta
}

export default function BarraLateral({ abierta, alCerrar }) {
  const { usuario, cerrarSesion } = useSesion()
  const { pathname } = useLocation()
  const opciones = MENUS[usuario.rol] ?? []
  const activa = rutaActiva(opciones, pathname)

  return (
    <>
      <aside className={`sidebar ${abierta ? 'abierta' : ''}`} aria-label="Menú principal">
        <div className="sidebar-cuerpo">
          <div className="marca">
            <Logo claro />
          </div>

          <nav className="d-flex flex-column gap-1" onClick={alCerrar}>
            {opciones.map((opcion, posicion) =>
              opcion.etiqueta ? (
                <div className="menu-etiqueta" key={posicion}>{opcion.etiqueta}</div>
              ) : (
                <Link
                  key={opcion.ruta}
                  to={opcion.ruta}
                  className={`menu-link ${opcion.ruta === activa ? 'active' : ''}`}
                  aria-current={opcion.ruta === activa ? 'page' : undefined}
                >
                  <span className="menu-icono">{opcion.icono}</span>
                  {opcion.texto}
                </Link>
              ),
            )}
          </nav>

          <div className="sidebar-pie">
            <div className="usuario">
              <strong>{usuario.nombre}</strong>
              <small>{usuario.rolEtiqueta}</small>
            </div>
            <button className="btn btn-sm btn-outline-light w-100" type="button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      <div className="fondo-menu" onClick={alCerrar} />
    </>
  )
}
import { NavLink } from 'react-router-dom'
import { useSesion } from '../contexto/ContextoSesion.jsx'
import Logo from './Logo.jsx'

// Menú de cada rol, igual que en los wireframes WF03–WF19.
const MENUS = {
  ADMIN: [
    { ruta: '/panel', texto: 'Dashboard', icono: '▦' },
    { ruta: '/concursos', texto: 'Concursos', icono: '◈' },
    { ruta: '/proyectos', texto: 'Proyectos', icono: '▤' },
    { ruta: '/asignaciones', texto: 'Jurados', icono: '⚖' },
    { ruta: '/evaluaciones', texto: 'Evaluaciones', icono: '✎' },
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
    { ruta: '/asignaciones', texto: 'Jurados', icono: '⚖' },
    { ruta: '/evaluaciones', texto: 'Evaluaciones', icono: '✎' },
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

export default function BarraLateral({ abierta, alCerrar }) {
  const { usuario, cerrarSesion } = useSesion()
  const opciones = MENUS[usuario.rol] ?? []

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
                <NavLink
                  key={opcion.ruta}
                  to={opcion.ruta}
                  end={opcion.exacta}
                  className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
                >
                  <span className="menu-icono">{opcion.icono}</span>
                  {opcion.texto}
                </NavLink>
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
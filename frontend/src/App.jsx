import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { INICIO_POR_ROL, useSesion } from './contexto/ContextoSesion.jsx'
import RutaProtegida from './componentes/RutaProtegida.jsx'
import AtajoConcurso from './componentes/AtajoConcurso.jsx'
import Cargando from './componentes/Cargando.jsx'

const Ingreso = lazy(() => import('./paginas/autenticacion/Ingreso.jsx'))
const OlvideClave = lazy(() => import('./paginas/autenticacion/OlvideClave.jsx'))
const RestablecerClave = lazy(() => import('./paginas/autenticacion/RestablecerClave.jsx'))

const Panel = lazy(() => import('./paginas/organizador/Panel.jsx'))
const ListaConcursos = lazy(() => import('./paginas/organizador/ListaConcursos.jsx'))
const FormularioConcurso = lazy(() => import('./paginas/organizador/FormularioConcurso.jsx'))
const ConfiguracionConcurso = lazy(() => import('./paginas/organizador/ConfiguracionConcurso.jsx'))
const Categorias = lazy(() => import('./paginas/organizador/Categorias.jsx'))
const Rubrica = lazy(() => import('./paginas/organizador/Rubrica.jsx'))
const AsignacionJurados = lazy(() => import('./paginas/organizador/AsignacionJurados.jsx'))
const SeguimientoEvaluaciones = lazy(() => import('./paginas/organizador/SeguimientoEvaluaciones.jsx'))
const ListaProyectos = lazy(() => import('./paginas/organizador/ListaProyectos.jsx'))
const FormularioProyecto = lazy(() => import('./paginas/organizador/FormularioProyecto.jsx'))
const DetalleProyecto = lazy(() => import('./paginas/organizador/DetalleProyecto.jsx'))
const Resultados = lazy(() => import('./paginas/organizador/Resultados.jsx'))

const Usuarios = lazy(() => import('./paginas/administrador/Usuarios.jsx'))
const Instituciones = lazy(() => import('./paginas/administrador/Instituciones.jsx'))
const Configuracion = lazy(() => import('./paginas/administrador/Configuracion.jsx'))

const PanelJurado = lazy(() => import('./paginas/jurado/PanelJurado.jsx'))
const MisAsignaciones = lazy(() => import('./paginas/jurado/MisAsignaciones.jsx'))
const DetalleAsignacion = lazy(() => import('./paginas/jurado/DetalleAsignacion.jsx'))
const Evaluacion = lazy(() => import('./paginas/jurado/Evaluacion.jsx'))
const Confirmacion = lazy(() => import('./paginas/jurado/Confirmacion.jsx'))

const MisProyectos = lazy(() => import('./paginas/participante/MisProyectos.jsx'))
const RegistrarProyecto = lazy(() => import('./paginas/participante/RegistrarProyecto.jsx'))
const SeguimientoProyecto = lazy(() => import('./paginas/participante/SeguimientoProyecto.jsx'))
const Observaciones = lazy(() => import('./paginas/participante/Observaciones.jsx'))
const ResultadosParticipante = lazy(() => import('./paginas/participante/Resultados.jsx'))

const GESTION = ['ADMIN', 'ORGANIZER']

// Cada pantalla se carga recién cuando se abre (lazy): el teléfono descarga menos al inicio

/** Tabla de rutas de toda la aplicación, agrupadas por rol. */
export default function App() {
  const { usuario, cargando } = useSesion()
  if (cargando) return <Cargando texto="Cargando…" />

  const inicio = usuario ? INICIO_POR_ROL[usuario.rol] : '/ingreso'
  const gestion = (elemento) => <RutaProtegida roles={GESTION}>{elemento}</RutaProtegida>

  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        <Route path="/" element={<Navigate to={inicio} replace />} />
        <Route path="/ingreso" element={<Ingreso />} />
        <Route path="/olvide-clave" element={<OlvideClave />} />
        <Route path="/restablecer-clave" element={<RestablecerClave />} />

        {/* Organizador y administrador */}
        <Route path="/panel" element={gestion(<Panel />)} />
        <Route path="/concursos" element={gestion(<ListaConcursos />)} />
        <Route path="/concursos/nuevo" element={gestion(<FormularioConcurso />)} />
        <Route path="/concursos/:id" element={gestion(<ConfiguracionConcurso />)} />
        <Route path="/concursos/:id/editar" element={gestion(<FormularioConcurso />)} />
        <Route path="/concursos/:id/categorias" element={gestion(<Categorias />)} />
        <Route path="/concursos/:id/rubrica" element={gestion(<Rubrica />)} />
        <Route path="/concursos/:id/asignaciones" element={gestion(<AsignacionJurados />)} />
        <Route path="/concursos/:id/evaluaciones" element={gestion(<SeguimientoEvaluaciones />)} />
        <Route path="/proyectos" element={gestion(<ListaProyectos />)} />
        <Route path="/proyectos/nuevo" element={gestion(<FormularioProyecto />)} />
        <Route path="/proyectos/:id" element={gestion(<DetalleProyecto />)} />
        <Route path="/resultados/:id" element={gestion(<Resultados />)} />
        <Route path="/asignaciones" element={gestion(<AtajoConcurso titulo="Jurados" destino={(id) => `/concursos/${id}/asignaciones`} />)} />
        <Route path="/evaluaciones" element={gestion(<AtajoConcurso titulo="Evaluaciones" destino={(id) => `/concursos/${id}/evaluaciones`} />)} />
        <Route path="/resultados" element={gestion(<AtajoConcurso titulo="Resultados" destino={(id) => `/resultados/${id}`} />)} />

        {/* Solo administrador */}
        <Route path="/administracion/usuarios" element={<RutaProtegida roles={['ADMIN']}><Usuarios /></RutaProtegida>} />
        <Route path="/administracion/instituciones" element={<RutaProtegida roles={['ADMIN']}><Instituciones /></RutaProtegida>} />

        <Route path="/administracion/configuracion" element={<RutaProtegida roles={['ADMIN']}><Configuracion /></RutaProtegida>} />

        {/* Jurado */}
        <Route path="/jurado" element={<RutaProtegida roles={['JUDGE']}><PanelJurado /></RutaProtegida>} />
        <Route path="/jurado/asignaciones" element={<RutaProtegida roles={['JUDGE']}><MisAsignaciones /></RutaProtegida>} />
        <Route path="/jurado/evaluaciones" element={<RutaProtegida roles={['JUDGE']}><MisAsignaciones soloEvaluados /></RutaProtegida>} />
        <Route path="/jurado/asignaciones/:id" element={<RutaProtegida roles={['JUDGE']}><DetalleAsignacion /></RutaProtegida>} />
        <Route path="/jurado/evaluacion/:id" element={<RutaProtegida roles={['JUDGE']}><Evaluacion /></RutaProtegida>} />
        <Route path="/jurado/evaluacion/:id/confirmar" element={<RutaProtegida roles={['JUDGE']}><Confirmacion /></RutaProtegida>} />

        {/* Participante */}
        <Route path="/participante" element={<RutaProtegida roles={['PARTICIPANT']}><MisProyectos /></RutaProtegida>} />
        <Route path="/participante/registro" element={<RutaProtegida roles={['PARTICIPANT']}><RegistrarProyecto /></RutaProtegida>} />
        <Route path="/participante/proyectos/:id" element={<RutaProtegida roles={['PARTICIPANT']}><SeguimientoProyecto /></RutaProtegida>} />
        <Route path="/participante/observaciones" element={<RutaProtegida roles={['PARTICIPANT']}><Observaciones /></RutaProtegida>} />
        <Route path="/participante/resultados" element={<RutaProtegida roles={['PARTICIPANT']}><ResultadosParticipante /></RutaProtegida>} />

        <Route path="*" element={<Navigate to={inicio} replace />} />
      </Routes>
    </Suspense>
  )
}
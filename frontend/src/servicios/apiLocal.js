// API local.
// Cuando la página se publica sin backend (GitHub Pages), este archivo hace de "servidor":
// responde a las mismas rutas que la API real de Spring Boot, pero guarda los datos en el
// navegador de quien la usa (localStorage). Así los cambios sobreviven a recargar la página,
// aunque cada persona ve solo sus propios datos. Cuando exista la base de datos, bastará con
// apagar este modo y la página hablará con el servidor real.

import { ErrorApi } from './ErrorApi.js'

// ---------------------------------------------------------------------------
// Utilidades de fecha
// ---------------------------------------------------------------------------

function fechaDesdeHoy(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

function momentoDesdeHoy(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString()
}

// ---------------------------------------------------------------------------
// Datos de ejemplo (mismos que carga el backend la primera vez que arranca)
// ---------------------------------------------------------------------------

const ROLES = {
  ADMIN: 'Administrador',
  ORGANIZER: 'Organizador',
  JUDGE: 'Jurado',
  PARTICIPANT: 'Participante',
}

const ESTADOS_CONCURSO = {
  DRAFT: 'Borrador',
  OPEN: 'Inscripciones abiertas',
  EVALUATION: 'En evaluación',
  CLOSED: 'Cerrado',
}

const CLAVE_DATOS = 'evalua-concursos-datos-v1'

/** Datos de ejemplo con los que arranca la aplicación (los mismos que carga el backend la primera vez). */
const crearDatosIniciales = () => ({
  siguienteId: 100,
  instituciones: [
    { id: 1, nombre: 'Universidad Nacional de Educación', ciudad: 'Lima', activa: true },
    { id: 2, nombre: 'Colegio Santa Rosa', ciudad: 'Lima', activa: true },
    { id: 3, nombre: 'Instituto Tecnológico del Norte', ciudad: 'Trujillo', activa: true },
  ],
  usuarios: [
    { id: 1, nombre: 'Administrador Demo', correo: 'admin@demo.pe', clave: 'Admin123*', rol: 'ADMIN', institucionId: 1, activo: true },
    { id: 2, nombre: 'Coordinador Demo', correo: 'organizador@demo.pe', clave: 'Org123*', rol: 'ORGANIZER', institucionId: 1, activo: true },
    { id: 3, nombre: 'Jurado Uno', correo: 'jurado@demo.pe', clave: 'Jurado123*', rol: 'JUDGE', institucionId: 2, activo: true },
    { id: 4, nombre: 'Jurado Dos', correo: 'jurado2@demo.pe', clave: 'Jurado123*', rol: 'JUDGE', institucionId: 3, activo: true },
    { id: 5, nombre: 'Jurado Tres', correo: 'jurado3@demo.pe', clave: 'Jurado123*', rol: 'JUDGE', institucionId: null, activo: true },
    { id: 6, nombre: 'Participante Demo', correo: 'participante@demo.pe', clave: 'Part123*', rol: 'PARTICIPANT', institucionId: 2, activo: true },
  ],
  concursos: [
    {
      id: 1, nombre: 'Feria de Innovación 2026',
      descripcion: 'Evento demostrativo para gestionar proyectos, jurados, rúbricas, evaluaciones y resultados en un único flujo digital.',
      fechaInicio: fechaDesdeHoy(-20), fechaCierre: fechaDesdeHoy(30), estado: 'EVALUATION',
      tipo: 'Tecnología e innovación', cupoMaximo: 150, minimoJurados: 2,
      condiciones: 'Trabajos originales, en equipos de hasta 4 integrantes. Archivo en PDF de máximo 10 MB.',
      organizadorId: 2, nombreBases: 'bases-feria-innovacion-2026.pdf',
    },
    {
      id: 2, nombre: 'Olimpiada de Ciencias 2026',
      descripcion: 'Convocatoria abierta para estudiantes de secundaria con proyectos de ciencias naturales.',
      fechaInicio: fechaDesdeHoy(-3), fechaCierre: fechaDesdeHoy(45), estado: 'OPEN',
      tipo: 'Ciencias naturales', cupoMaximo: 80, minimoJurados: 2,
      condiciones: 'Equipos de hasta 3 estudiantes.',
      organizadorId: 2, nombreBases: null,
    },
  ],
  categorias: [
    { id: 1, concursoId: 1, nombre: 'Investigación', descripcion: 'Proyectos de indagación e investigación aplicada.', activa: true },
    { id: 2, concursoId: 1, nombre: 'Innovación tecnológica', descripcion: 'Soluciones, prototipos y productos tecnológicos.', activa: true },
    { id: 3, concursoId: 1, nombre: 'Emprendimiento', descripcion: 'Propuestas con potencial de impacto y sostenibilidad.', activa: true },
    { id: 4, concursoId: 2, nombre: 'Biología y ambiente', descripcion: 'Estudios sobre seres vivos y su entorno.', activa: true },
    { id: 5, concursoId: 2, nombre: 'Física y química', descripcion: 'Experimentos y modelos de ciencias exactas.', activa: true },
  ],
  criterios: [
    { id: 1, concursoId: 1, nombre: 'Problema y objetivos', descripcion: 'Claridad, pertinencia y coherencia del problema planteado.', puntajeMaximo: 20, peso: 25 },
    { id: 2, concursoId: 1, nombre: 'Metodología', descripcion: 'Rigor del procedimiento, evidencias y trazabilidad del trabajo.', puntajeMaximo: 20, peso: 25 },
    { id: 3, concursoId: 1, nombre: 'Innovación e impacto', descripcion: 'Originalidad, utilidad, viabilidad e impacto de la propuesta.', puntajeMaximo: 20, peso: 30 },
    { id: 4, concursoId: 1, nombre: 'Presentación', descripcion: 'Claridad de resultados, conclusiones y comunicación del proyecto.', puntajeMaximo: 20, peso: 20 },
    { id: 5, concursoId: 2, nombre: 'Método científico', descripcion: 'Hipótesis, experimento y conclusiones.', puntajeMaximo: 10, peso: 50 },
    { id: 6, concursoId: 2, nombre: 'Originalidad', descripcion: 'Aporte propio de las y los estudiantes.', puntajeMaximo: 10, peso: 30 },
    { id: 7, concursoId: 2, nombre: 'Exposición', descripcion: 'Claridad al explicar el trabajo.', puntajeMaximo: 10, peso: 20 },
  ],
  proyectos: [
    {
      id: 1, concursoId: 1, categoriaId: 1, titulo: 'Filtro ecológico de agua',
      resumen: 'Sistema de purificación con materiales de bajo costo y evaluación de parámetros básicos de calidad.',
      integrantes: 'Ana Pérez / Luis Torres', institucionGrado: '5.º de secundaria', participanteId: 6,
      observacion: '', nombreArchivo: 'informe-filtro-ecologico.pdf', fechaEnvio: momentoDesdeHoy(-12),
    },
    {
      id: 2, concursoId: 1, categoriaId: 2, titulo: 'Sensor de alerta vial',
      resumen: 'Prototipo de advertencia de proximidad vehicular orientado a prevención de accidentes.',
      integrantes: 'María Soto / Diego Ramos', institucionGrado: '4.º de secundaria', participanteId: null,
      observacion: 'Falta adjuntar el presupuesto del prototipo.', nombreArchivo: 'sensor-alerta-vial.pdf', fechaEnvio: momentoDesdeHoy(-10),
    },
    {
      id: 3, concursoId: 1, categoriaId: 3, titulo: 'BioMaceta circular',
      resumen: 'Maceta biodegradable elaborada con residuos orgánicos y propuesta de comercialización escolar.',
      integrantes: 'Camila Rojas / André León', institucionGrado: '5.º de secundaria', participanteId: null,
      observacion: '', nombreArchivo: 'biomaceta.pdf', fechaEnvio: momentoDesdeHoy(-9),
    },
    {
      id: 4, concursoId: 1, categoriaId: 2, titulo: 'Riego inteligente escolar',
      resumen: 'Sistema de riego automatizado con sensores de humedad para áreas verdes educativas.',
      integrantes: 'Lucía Flores / Mateo Ruiz', institucionGrado: '3.º de secundaria', participanteId: null,
      observacion: '', nombreArchivo: 'riego-inteligente.pdf', fechaEnvio: momentoDesdeHoy(-8),
    },
  ],
  asignaciones: [
    { id: 1, proyectoId: 1, juradoId: 3 },
    { id: 2, proyectoId: 1, juradoId: 4 },
    { id: 3, proyectoId: 2, juradoId: 3 },
    { id: 4, proyectoId: 2, juradoId: 5 },
    { id: 5, proyectoId: 3, juradoId: 4 },
    { id: 6, proyectoId: 3, juradoId: 5 },
    { id: 7, proyectoId: 4, juradoId: 3 },
    { id: 8, proyectoId: 4, juradoId: 4 },
  ],
  // clave: id de la asignación
  evaluaciones: {
    1: { puntajes: { 1: 18, 2: 17, 3: 19, 4: 18 }, observaciones: 'Muy buen manejo del problema; sustentar mejor los resultados.', enviada: true, fechaEnvio: momentoDesdeHoy(-4) },
    2: { puntajes: { 1: 17, 2: 18, 3: 18, 4: 19 }, observaciones: 'Prototipo sólido y bien documentado.', enviada: true, fechaEnvio: momentoDesdeHoy(-3) },
    3: { puntajes: { 1: 15, 2: 14, 3: 17, 4: 16 }, observaciones: 'Buena idea, falta validar con más pruebas.', enviada: true, fechaEnvio: momentoDesdeHoy(-2) },
    4: { puntajes: { 1: 14, 2: 15 }, observaciones: '', enviada: false, fechaEnvio: null },
  },
})

function cargarDatos() {
  try {
    const guardados = localStorage.getItem(CLAVE_DATOS)
    if (guardados) return JSON.parse(guardados)
  } catch {
    // si el navegador no deja leer, empiezo con los datos de ejemplo
  }
  return crearDatosIniciales()
}

function guardarDatos() {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(bd))
  } catch {
    // sin espacio o en ventana privada: los datos valen solo hasta recargar
  }
}

let bd = cargarDatos()

/** Vuelve a los datos de ejemplo y cierra la sesión. */
export function restablecerDatos() {
  bd = crearDatosIniciales()
  guardarDatos()
  usuarioActualId = null
  try {
    sessionStorage.removeItem('demo-usuario')
  } catch {
    // nada que limpiar
  }
}

let usuarioActualId = null
try {
  usuarioActualId = Number(sessionStorage.getItem('demo-usuario')) || null
} catch {
  usuarioActualId = null
}

// ---------------------------------------------------------------------------
// Funciones de apoyo (réplica de las reglas del backend)
// ---------------------------------------------------------------------------

const nuevoId = () => bd.siguienteId++
const concursoDe = (id) => bd.concursos.find((c) => c.id === Number(id))
const proyectoDe = (id) => bd.proyectos.find((p) => p.id === Number(id))
const usuarioDe = (id) => bd.usuarios.find((u) => u.id === Number(id))
const criteriosDe = (idConcurso) => bd.criterios.filter((c) => c.concursoId === idConcurso)
const categoriasDe = (idConcurso) => bd.categorias.filter((c) => c.concursoId === idConcurso)
const proyectosDe = (idConcurso) => bd.proyectos.filter((p) => p.concursoId === idConcurso).sort((a, b) => b.id - a.id)
const asignacionesDe = (idProyecto) => bd.asignaciones.filter((a) => a.proyectoId === idProyecto)
const codigoDe = (id) => `P-${String(id).padStart(3, '0')}`
const redondear = (valor, decimales = 1) => Math.round(valor * 10 ** decimales) / 10 ** decimales

function error(estado, mensaje) {
  return new ErrorApi(mensaje, estado)
}

function exigir(condicion, mensaje) {
  if (!condicion) throw error(400, mensaje)
}

function pesoRubrica(idConcurso) {
  return redondear(criteriosDe(idConcurso).reduce((suma, c) => suma + c.peso, 0))
}

function rubricaValida(idConcurso) {
  return Math.abs(pesoRubrica(idConcurso) - 100) < 0.01
}

/** Puntaje ponderado (0 a 100): Σ((puntaje / máximo) × peso) / Σ pesos × 100 */
function puntajePonderado(idConcurso, puntajes) {
  const criterios = criteriosDe(idConcurso)
  const pesoTotal = criterios.reduce((suma, c) => suma + c.peso, 0)
  if (pesoTotal <= 0) return 0
  const ponderado = criterios.reduce((suma, c) => suma + ((puntajes[c.id] ?? 0) / c.puntajeMaximo) * c.peso, 0)
  return redondear((ponderado / pesoTotal) * 100)
}

function estadoAsignacion(idAsignacion) {
  const evaluacion = bd.evaluaciones[idAsignacion]
  if (!evaluacion) return 'Pendiente'
  return evaluacion.enviada ? 'Enviada' : 'Borrador'
}

function estadoProyecto(proyecto) {
  const asignaciones = asignacionesDe(proyecto.id)
  const enviadas = asignaciones.filter((a) => bd.evaluaciones[a.id]?.enviada).length
  if (asignaciones.length === 0 || enviadas === 0) return 'Inscrito'
  return enviadas >= asignaciones.length ? 'Evaluado' : 'Evaluando'
}

function etapaDe(proyecto) {
  if (concursoDe(proyecto.concursoId).estado === 'CLOSED') return 3
  if (estadoProyecto(proyecto) !== 'Inscrito') return 2
  return asignacionesDe(proyecto.id).length === 0 ? 0 : 1
}

function progreso(idConcurso) {
  const proyectos = proyectosDe(idConcurso)
  const asignaciones = proyectos.flatMap((p) => asignacionesDe(p.id))
  const enviadas = asignaciones.filter((a) => bd.evaluaciones[a.id]?.enviada).length
  return {
    proyectos: proyectos.length,
    asignaciones: asignaciones.length,
    evaluacionesEnviadas: enviadas,
    avance: asignaciones.length === 0 ? 0 : redondear((enviadas * 100) / asignaciones.length),
    pesoRubrica: pesoRubrica(idConcurso),
  }
}

// ---------------------------------------------------------------------------
// Armado de las vistas JSON (mismos campos que devuelve Spring Boot)
// ---------------------------------------------------------------------------

function vistaUsuario(usuario) {
  const institucion = bd.instituciones.find((i) => i.id === usuario.institucionId)
  return {
    id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, rolEtiqueta: ROLES[usuario.rol],
    activo: usuario.activo, institucionId: usuario.institucionId ?? null, institucion: institucion ? institucion.nombre : null,
  }
}

function vistaConcurso(concurso) {
  const organizador = usuarioDe(concurso.organizadorId)
  return {
    id: concurso.id, nombre: concurso.nombre, descripcion: concurso.descripcion, fechaInicio: concurso.fechaInicio,
    fechaCierre: concurso.fechaCierre, estado: concurso.estado, estadoEtiqueta: ESTADOS_CONCURSO[concurso.estado],
    tipo: concurso.tipo, cupoMaximo: concurso.cupoMaximo, minimoJurados: concurso.minimoJurados ?? 2,
    condiciones: concurso.condiciones, organizadorId: organizador ? organizador.id : null,
    organizador: organizador ? organizador.nombre : null, tieneBases: Boolean(concurso.nombreBases), nombreBases: concurso.nombreBases,
  }
}

function vistaProyecto(proyecto) {
  const categoria = bd.categorias.find((c) => c.id === proyecto.categoriaId)
  return {
    id: proyecto.id, codigo: codigoDe(proyecto.id), titulo: proyecto.titulo, resumen: proyecto.resumen,
    integrantes: proyecto.integrantes, institucionGrado: proyecto.institucionGrado || null,
    categoriaId: categoria ? categoria.id : null, categoria: categoria ? categoria.nombre : 'Sin categoría',
    concursoId: proyecto.concursoId, concurso: concursoDe(proyecto.concursoId).nombre, estado: estadoProyecto(proyecto),
    observacion: proyecto.observacion || null, tieneArchivo: Boolean(proyecto.nombreArchivo),
    nombreArchivo: proyecto.nombreArchivo, fechaEnvio: proyecto.fechaEnvio, cantidadJurados: asignacionesDe(proyecto.id).length,
  }
}

const vistaCategoria = (c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion, activa: c.activa })
const vistaCriterio = (c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion, puntajeMaximo: c.puntajeMaximo, peso: c.peso })

function listaVerificacion(concurso) {
  const proyectos = proyectosDe(concurso.id)
  const minimo = concurso.minimoJurados ?? 2
  const todosCubiertos = proyectos.length > 0 && proyectos.every((p) => asignacionesDe(p.id).length >= minimo)
  return {
    categorias: categoriasDe(concurso.id).length, pesoRubrica: pesoRubrica(concurso.id), proyectos: proyectos.length,
    asignaciones: proyectos.reduce((suma, p) => suma + asignacionesDe(p.id).length, 0), minimoJurados: minimo,
    categoriasListas: categoriasDe(concurso.id).length > 0, rubricaLista: rubricaValida(concurso.id),
    juradosListos: todosCubiertos, proyectosListos: proyectos.length > 0,
  }
}

function filaRanking(proyecto) {
  const asignaciones = asignacionesDe(proyecto.id)
  const puntajes = asignaciones
    .map((a) => bd.evaluaciones[a.id])
    .filter((e) => e?.enviada)
    .map((e) => puntajePonderado(proyecto.concursoId, e.puntajes))
  const promedio = puntajes.length === 0 ? 0 : redondear(puntajes.reduce((s, v) => s + v, 0) / puntajes.length)
  let estado = 'Completo'
  if (asignaciones.length === 0) estado = 'Sin jurados'
  else if (puntajes.length === 0) estado = 'Pendiente'
  else if (puntajes.length < asignaciones.length) estado = 'Parcial'
  const categoria = bd.categorias.find((c) => c.id === proyecto.categoriaId)
  return {
    proyectoId: proyecto.id, titulo: proyecto.titulo, integrantes: proyecto.integrantes,
    categoria: categoria ? categoria.nombre : 'Sin categoría', evaluacionesEnviadas: puntajes.length,
    juradosAsignados: asignaciones.length, promedio, estado,
  }
}

function datosEvaluacion(asignacion) {
  const proyecto = proyectoDe(asignacion.proyectoId)
  const evaluacion = bd.evaluaciones[asignacion.id]
  const puntajes = evaluacion ? evaluacion.puntajes : {}
  return {
    asignacionId: asignacion.id, proyecto: vistaProyecto(proyecto), estado: estadoAsignacion(asignacion.id),
    criterios: criteriosDe(proyecto.concursoId).map(vistaCriterio), puntajes,
    observaciones: evaluacion ? evaluacion.observaciones : '', puntajeFinal: puntajePonderado(proyecto.concursoId, puntajes),
  }
}

// ---------------------------------------------------------------------------
// Reglas de acceso y de visibilidad
// ---------------------------------------------------------------------------

function usuarioActual() {
  const usuario = usuarioDe(usuarioActualId)
  if (!usuario) throw error(401, 'Sesión no iniciada')
  return usuario
}

/** El administrador ve todos los concursos; el organizador solo los suyos. */
function concursosVisibles(usuario) {
  return bd.concursos.filter((c) => usuario.rol === 'ADMIN' || c.organizadorId === usuario.id).sort((a, b) => b.id - a.id)
}

function concursoGestionable(id, usuario) {
  const concurso = concursoDe(id)
  if (!concurso) throw error(400, 'Concurso no encontrado')
  if (usuario.rol !== 'ADMIN' && concurso.organizadorId !== usuario.id) {
    throw error(400, 'No tienes permiso para administrar este concurso')
  }
  return concurso
}

function proyectoGestionable(id, usuario) {
  const proyecto = proyectoDe(id)
  if (!proyecto) throw error(400, 'Trabajo no encontrado')
  concursoGestionable(proyecto.concursoId, usuario)
  return proyecto
}

function asignacionDelJurado(id, usuario) {
  const asignacion = bd.asignaciones.find((a) => a.id === Number(id))
  if (!asignacion) throw error(400, 'Asignación no encontrada')
  if (asignacion.juradoId !== usuario.id) throw error(400, 'No tiene acceso a esta evaluación')
  return asignacion
}

function proyectoDelParticipante(id, usuario) {
  const proyecto = proyectoDe(id)
  if (!proyecto || proyecto.participanteId !== usuario.id) throw error(400, 'No tienes permiso para ver este proyecto')
  return proyecto
}

function convocatoriaAbierta(concurso) {
  return concurso.estado === 'OPEN' && (!concurso.fechaCierre || concurso.fechaCierre >= fechaDesdeHoy(0))
}

function unirIntegrantes(lista) {
  return (lista ?? []).map((n) => String(n).trim()).filter(Boolean).join(' / ')
}

function validarPuntajes(idConcurso, puntajes, completo) {
  for (const criterio of criteriosDe(idConcurso)) {
    const valor = puntajes[criterio.id]
    if (valor === undefined || valor === null) {
      exigir(!completo, 'Debe completar todos los criterios')
      continue
    }
    exigir(valor >= 0 && valor <= criterio.puntajeMaximo, `Puntaje fuera de rango en: ${criterio.nombre}`)
  }
}

function limpiarPuntajes(puntajes) {
  const limpios = {}
  Object.entries(puntajes ?? {}).forEach(([criterio, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') limpios[criterio] = Number(valor)
  })
  return limpios
}

// ---------------------------------------------------------------------------
// Tabla de rutas
// ---------------------------------------------------------------------------

const rutas = []

function ruta(metodo, patron, manejador, roles) {
  const expresion = new RegExp('^' + patron.replace(/:[a-z]+/gi, '([^/]+)') + '$')
  rutas.push({ metodo, expresion, manejador, roles })
}

const GESTION = ['ADMIN', 'ORGANIZER']

// ----- Autenticación -----
ruta('GET', '/autenticacion/yo', () => vistaUsuario(usuarioActual()))

ruta('POST', '/autenticacion/iniciar', ({ cuerpo }) => {
  const correo = String(cuerpo.correo ?? '').trim().toLowerCase()
  const usuario = bd.usuarios.find((u) => u.correo === correo && u.clave === cuerpo.clave)
  if (!usuario) throw error(401, 'El correo o la contraseña no son correctos')
  if (!usuario.activo) throw error(401, 'Tu cuenta está desactivada, comunícate con el administrador')
  usuarioActualId = usuario.id
  try {
    sessionStorage.setItem('demo-usuario', String(usuario.id))
  } catch {
    // sin sessionStorage la sesión dura solo mientras no se recargue la página
  }
  return vistaUsuario(usuario)
})

ruta('POST', '/autenticacion/salir', () => {
  usuarioActualId = null
  try {
    sessionStorage.removeItem('demo-usuario')
  } catch {
    // nada que limpiar
  }
  return { mensaje: 'Sesión cerrada' }
})

ruta('POST', '/autenticacion/olvide', () => ({
  mensaje: 'Esta versión no envía correos: la recuperación de contraseña estará disponible cuando se conecte el servidor.',
}))
ruta('GET', '/autenticacion/restablecer/validar', () => {
  throw error(400, 'El enlace de recuperación no es válido o ya venció')
})
ruta('POST', '/autenticacion/restablecer', () => {
  throw error(400, 'El enlace de recuperación no es válido o ya venció')
})

// ----- Panel -----
ruta('GET', '/panel', ({ usuario }) => {
  const concursos = concursosVisibles(usuario)
  const proyectos = concursos.flatMap((c) => proyectosDe(c.id))
  const asignaciones = proyectos.flatMap((p) => asignacionesDe(p.id))
  const enviadas = asignaciones.filter((a) => bd.evaluaciones[a.id]?.enviada).length
  const activo = concursos.find((c) => c.estado === 'EVALUATION') || concursos.find((c) => c.estado === 'OPEN') || concursos[0] || null
  const esAdmin = usuario.rol === 'ADMIN'
  return {
    estadisticas: {
      concursos: concursos.length,
      concursosActivos: concursos.filter((c) => c.estado === 'OPEN' || c.estado === 'EVALUATION').length,
      proyectos: proyectos.length,
      jurados: bd.usuarios.filter((u) => u.rol === 'JUDGE').length,
      evaluacionesEnviadas: enviadas,
      asignaciones: asignaciones.length,
      avance: asignaciones.length === 0 ? 0 : redondear((enviadas * 100) / asignaciones.length),
    },
    concursoActivo: activo ? vistaConcurso(activo) : null,
    progreso: activo ? progreso(activo.id) : null,
    proyectosRecientes: [...proyectos].sort((a, b) => b.id - a.id).slice(0, 6).map(vistaProyecto),
    cantidadUsuarios: esAdmin ? bd.usuarios.length : null,
    cantidadInstituciones: esAdmin ? bd.instituciones.length : null,
    actividad: esAdmin
      ? [...bd.proyectos].sort((a, b) => String(b.fechaEnvio).localeCompare(String(a.fechaEnvio))).slice(0, 8).map((p) => ({
        texto: `Proyecto «${p.titulo}» recibido en ${concursoDe(p.concursoId).nombre}`, fecha: p.fechaEnvio,
      }))
      : [],
  }
}, GESTION)

// ----- Concursos -----
ruta('GET', '/concursos', ({ usuario }) => concursosVisibles(usuario).map(vistaConcurso), GESTION)

function datosConcurso(cuerpo) {
  exigir(cuerpo.nombre && String(cuerpo.nombre).trim(), 'El nombre es obligatorio')
  exigir(!cuerpo.fechaInicio || !cuerpo.fechaCierre || cuerpo.fechaCierre >= cuerpo.fechaInicio,
    'La fecha de cierre no puede ser anterior a la de inicio')
  exigir(cuerpo.cupoMaximo == null || cuerpo.cupoMaximo >= 1, 'El cupo máximo debe ser al menos 1')
  exigir(cuerpo.minimoJurados == null || cuerpo.minimoJurados >= 1, 'Se requiere al menos 1 jurado por proyecto')
  return {
    nombre: String(cuerpo.nombre).trim(), descripcion: cuerpo.descripcion || '', fechaInicio: cuerpo.fechaInicio,
    fechaCierre: cuerpo.fechaCierre, estado: cuerpo.estado || 'DRAFT', tipo: cuerpo.tipo || '',
    cupoMaximo: cuerpo.cupoMaximo, minimoJurados: cuerpo.minimoJurados, condiciones: cuerpo.condiciones || '',
  }
}

ruta('POST', '/concursos', ({ cuerpo, usuario }) => {
  const concurso = { id: nuevoId(), ...datosConcurso(cuerpo), organizadorId: usuario.id, nombreBases: null }
  bd.concursos.push(concurso)
  return vistaConcurso(concurso)
}, GESTION)

ruta('GET', '/concursos/:id', ({ p, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  return {
    concurso: vistaConcurso(concurso), lista: listaVerificacion(concurso), progreso: progreso(concurso.id),
    organizadores: bd.usuarios.filter((u) => u.rol === 'ORGANIZER').map(vistaUsuario),
  }
}, GESTION)

ruta('PUT', '/concursos/:id', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  Object.assign(concurso, datosConcurso(cuerpo))
  return vistaConcurso(concurso)
}, GESTION)

ruta('PUT', '/concursos/:id/estado', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  exigir(cuerpo.estado !== 'EVALUATION' || rubricaValida(concurso.id),
    `La rúbrica debe sumar 100 % para iniciar la evaluación (suma actual: ${pesoRubrica(concurso.id)} %)`)
  concurso.estado = cuerpo.estado
  return vistaConcurso(concurso)
}, GESTION)

ruta('PUT', '/concursos/:id/organizador', ({ p, cuerpo, usuario }) => {
  exigir(usuario.rol === 'ADMIN', 'Solo un administrador puede cambiar el organizador')
  const organizador = usuarioDe(cuerpo.organizadorId)
  exigir(organizador && organizador.rol === 'ORGANIZER', 'Organizador no válido')
  const concurso = concursoDe(p[0])
  concurso.organizadorId = organizador.id
  return vistaConcurso(concurso)
}, GESTION)

ruta('POST', '/concursos/:id/bases', ({ p, formulario, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  const archivo = formulario?.get('archivo')
  exigir(archivo && archivo.name, 'Selecciona el archivo de las bases')
  concurso.nombreBases = archivo.name
  return vistaConcurso(concurso)
}, GESTION)

// ----- Categorías -----
ruta('GET', '/concursos/:id/categorias', ({ p, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  return categoriasDe(concurso.id).sort((a, b) => a.nombre.localeCompare(b.nombre)).map(vistaCategoria)
}, GESTION)

ruta('POST', '/concursos/:id/categorias', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  exigir(cuerpo.nombre && cuerpo.nombre.trim(), 'El nombre de la categoría es obligatorio')
  const categoria = { id: nuevoId(), concursoId: concurso.id, nombre: cuerpo.nombre.trim(), descripcion: cuerpo.descripcion || '', activa: Boolean(cuerpo.activa) }
  bd.categorias.push(categoria)
  return vistaCategoria(categoria)
}, GESTION)

ruta('PUT', '/concursos/:id/categorias/:cid', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  const categoria = categoriasDe(concurso.id).find((c) => c.id === Number(p[1]))
  exigir(categoria, 'Categoría no encontrada')
  exigir(cuerpo.nombre && cuerpo.nombre.trim(), 'El nombre de la categoría es obligatorio')
  Object.assign(categoria, { nombre: cuerpo.nombre.trim(), descripcion: cuerpo.descripcion || '', activa: Boolean(cuerpo.activa) })
  return vistaCategoria(categoria)
}, GESTION)

// ----- Rúbrica -----
ruta('GET', '/concursos/:id/rubrica', ({ p, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  return { criterios: criteriosDe(concurso.id).map(vistaCriterio), pesoTotal: pesoRubrica(concurso.id), valida: rubricaValida(concurso.id) }
}, GESTION)

function validarCriterio(cuerpo) {
  exigir(cuerpo.nombre && cuerpo.nombre.trim(), 'El nombre del criterio es obligatorio')
  exigir(cuerpo.puntajeMaximo > 0 && cuerpo.peso > 0, 'Puntaje y peso deben ser mayores que cero')
}

ruta('POST', '/concursos/:id/rubrica', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  validarCriterio(cuerpo)
  const criterio = { id: nuevoId(), concursoId: concurso.id, nombre: cuerpo.nombre.trim(), descripcion: cuerpo.descripcion || '', puntajeMaximo: Number(cuerpo.puntajeMaximo), peso: Number(cuerpo.peso) }
  bd.criterios.push(criterio)
  return vistaCriterio(criterio)
}, GESTION)

ruta('PUT', '/concursos/:id/rubrica/:cid', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  const criterio = criteriosDe(concurso.id).find((c) => c.id === Number(p[1]))
  exigir(criterio, 'Criterio no encontrado')
  validarCriterio(cuerpo)
  Object.assign(criterio, { nombre: cuerpo.nombre.trim(), descripcion: cuerpo.descripcion || '', puntajeMaximo: Number(cuerpo.puntajeMaximo), peso: Number(cuerpo.peso) })
  return vistaCriterio(criterio)
}, GESTION)

// ----- Asignación de jurados -----
ruta('GET', '/concursos/:id/asignaciones', ({ p, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  const proyectos = proyectosDe(concurso.id)
  return {
    concurso: vistaConcurso(concurso), proyectos: proyectos.map(vistaProyecto),
    jurados: bd.usuarios.filter((u) => u.rol === 'JUDGE' && u.activo).map(vistaUsuario),
    asignados: Object.fromEntries(proyectos.map((pr) => [pr.id, asignacionesDe(pr.id).map((a) => a.juradoId)])),
    minimoJurados: concurso.minimoJurados ?? 2,
  }
}, GESTION)

ruta('PUT', '/concursos/:id/asignaciones', ({ p, cuerpo, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  let asignadas = 0
  let quitadas = 0
  let bloqueadas = 0
  const separar = (par) => par.split(':').map(Number)

  for (const par of cuerpo.asignar ?? []) {
    const [idProyecto, idJurado] = separar(par)
    const proyecto = proyectoDe(idProyecto)
    exigir(proyecto && proyecto.concursoId === concurso.id, 'El trabajo no pertenece a este concurso')
    const jurado = usuarioDe(idJurado)
    exigir(jurado && jurado.rol === 'JUDGE' && jurado.activo, 'Jurado no válido')
    if (!asignacionesDe(idProyecto).some((a) => a.juradoId === idJurado)) {
      bd.asignaciones.push({ id: nuevoId(), proyectoId: idProyecto, juradoId: idJurado })
      asignadas += 1
    }
  }
  for (const par of cuerpo.quitar ?? []) {
    const [idProyecto, idJurado] = separar(par)
    const asignacion = asignacionesDe(idProyecto).find((a) => a.juradoId === idJurado)
    if (!asignacion) continue
    if (bd.evaluaciones[asignacion.id]) {
      bloqueadas += 1
    } else {
      bd.asignaciones.splice(bd.asignaciones.indexOf(asignacion), 1)
      quitadas += 1
    }
  }
  return { asignadas, quitadas, bloqueadas }
}, GESTION)

// ----- Seguimiento de evaluaciones -----
ruta('GET', '/concursos/:id/evaluaciones', ({ p, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  const filas = proyectosDe(concurso.id).flatMap((proyecto) => asignacionesDe(proyecto.id).map((asignacion) => {
    const evaluacion = bd.evaluaciones[asignacion.id]
    const categoria = bd.categorias.find((c) => c.id === proyecto.categoriaId)
    return {
      codigo: codigoDe(proyecto.id), proyecto: proyecto.titulo, categoria: categoria ? categoria.nombre : 'Sin categoría',
      jurado: usuarioDe(asignacion.juradoId).nombre, estado: estadoAsignacion(asignacion.id),
      puntaje: evaluacion?.enviada ? puntajePonderado(concurso.id, evaluacion.puntajes) : null,
      fechaEnvio: evaluacion?.enviada ? evaluacion.fechaEnvio : null,
    }
  }))
  return { concurso: vistaConcurso(concurso), filas, progreso: progreso(concurso.id) }
}, GESTION)

// ----- Proyectos (organizador) -----
ruta('GET', '/proyectos', ({ q, usuario }) => {
  const idConcurso = q.get('concursoId') ? Number(q.get('concursoId')) : null
  const concursos = concursosVisibles(usuario)
  const proyectos = concursos.filter((c) => !idConcurso || c.id === idConcurso).flatMap((c) => proyectosDe(c.id)).sort((a, b) => b.id - a.id)
  return { proyectos: proyectos.map(vistaProyecto), concursos: concursos.map(vistaConcurso) }
}, GESTION)

function datosProyecto(cuerpo, concurso) {
  const integrantes = unirIntegrantes(cuerpo.integrantes)
  exigir(cuerpo.titulo && cuerpo.titulo.trim() && integrantes, 'El título y los participantes son obligatorios')
  let categoriaId = null
  if (cuerpo.categoriaId) {
    const categoria = categoriasDe(concurso.id).find((c) => c.id === Number(cuerpo.categoriaId))
    exigir(categoria, 'Categoría no válida')
    categoriaId = categoria.id
  }
  return { titulo: cuerpo.titulo.trim(), resumen: cuerpo.resumen || '', integrantes, institucionGrado: cuerpo.institucionGrado || '', categoriaId }
}

ruta('POST', '/proyectos', ({ cuerpo, usuario }) => {
  const concurso = concursoGestionable(cuerpo.concursoId, usuario)
  const proyecto = {
    id: nuevoId(), concursoId: concurso.id, ...datosProyecto(cuerpo, concurso), participanteId: null,
    observacion: '', nombreArchivo: null, fechaEnvio: new Date().toISOString(),
  }
  bd.proyectos.push(proyecto)
  return vistaProyecto(proyecto)
}, GESTION)

ruta('GET', '/proyectos/:id', ({ p, usuario }) => {
  const proyecto = proyectoGestionable(p[0], usuario)
  return {
    proyecto: vistaProyecto(proyecto),
    jurados: asignacionesDe(proyecto.id).map((a) => ({ asignacionId: a.id, jurado: usuarioDe(a.juradoId).nombre, estado: estadoAsignacion(a.id) })),
    categorias: categoriasDe(proyecto.concursoId).filter((c) => c.activa).map(vistaCategoria),
  }
}, GESTION)

ruta('PUT', '/proyectos/:id', ({ p, cuerpo, usuario }) => {
  const proyecto = proyectoGestionable(p[0], usuario)
  Object.assign(proyecto, datosProyecto(cuerpo, concursoDe(proyecto.concursoId)))
  return vistaProyecto(proyecto)
}, GESTION)

ruta('PUT', '/proyectos/:id/observacion', ({ p, cuerpo, usuario }) => {
  const proyecto = proyectoGestionable(p[0], usuario)
  proyecto.observacion = (cuerpo.observacion ?? '').trim()
  return vistaProyecto(proyecto)
}, GESTION)

// ----- Resultados -----
ruta('GET', '/resultados/:id', ({ p, usuario }) => {
  const concurso = concursoGestionable(p[0], usuario)
  const filas = proyectosDe(concurso.id).map(filaRanking).sort((a, b) => b.promedio - a.promedio)
  return {
    concurso: vistaConcurso(concurso), concursos: concursosVisibles(usuario).map(vistaConcurso),
    ranking: filas.map((fila, indice) => ({ ...fila, puesto: indice + 1 })), progreso: progreso(concurso.id),
  }
}, GESTION)

// ----- Jurado -----
ruta('GET', '/jurado/asignaciones', ({ usuario }) => {
  const lista = bd.asignaciones.filter((a) => a.juradoId === usuario.id).sort((a, b) => b.id - a.id).map((a) => {
    const proyecto = proyectoDe(a.proyectoId)
    const categoria = bd.categorias.find((c) => c.id === proyecto.categoriaId)
    return {
      id: a.id, codigo: codigoDe(proyecto.id), proyecto: proyecto.titulo, concurso: concursoDe(proyecto.concursoId).nombre,
      categoria: categoria ? categoria.nombre : 'Sin categoría', estado: estadoAsignacion(a.id),
    }
  })
  const enviadas = lista.filter((a) => a.estado === 'Enviada').length
  return {
    asignaciones: lista, total: lista.length, enviadas, pendientes: lista.length - enviadas,
    avance: lista.length === 0 ? 0 : Math.round((enviadas * 100) / lista.length),
  }
}, ['JUDGE'])

ruta('GET', '/jurado/asignaciones/:id', ({ p, usuario }) => {
  const asignacion = asignacionDelJurado(p[0], usuario)
  return { id: asignacion.id, proyecto: vistaProyecto(proyectoDe(asignacion.proyectoId)), estado: estadoAsignacion(asignacion.id) }
}, ['JUDGE'])

ruta('GET', '/jurado/evaluaciones/:id', ({ p, usuario }) => datosEvaluacion(asignacionDelJurado(p[0], usuario)), ['JUDGE'])

ruta('PUT', '/jurado/evaluaciones/:id/borrador', ({ p, cuerpo, usuario }) => {
  const asignacion = asignacionDelJurado(p[0], usuario)
  const proyecto = proyectoDe(asignacion.proyectoId)
  exigir(!bd.evaluaciones[asignacion.id]?.enviada, 'La evaluación ya fue enviada y no puede volver a borrador')
  const puntajes = limpiarPuntajes(cuerpo.puntajes)
  validarPuntajes(proyecto.concursoId, puntajes, false)
  bd.evaluaciones[asignacion.id] = { puntajes, observaciones: (cuerpo.observaciones ?? '').trim(), enviada: false, fechaEnvio: null }
  return datosEvaluacion(asignacion)
}, ['JUDGE'])

ruta('POST', '/jurado/evaluaciones/:id/enviar', ({ p, cuerpo, usuario }) => {
  const asignacion = asignacionDelJurado(p[0], usuario)
  const proyecto = proyectoDe(asignacion.proyectoId)
  const puntajes = limpiarPuntajes(cuerpo.puntajes)
  validarPuntajes(proyecto.concursoId, puntajes, true)
  bd.evaluaciones[asignacion.id] = {
    puntajes, observaciones: (cuerpo.observaciones ?? '').trim(), enviada: true, fechaEnvio: new Date().toISOString(),
  }
  return datosEvaluacion(asignacion)
}, ['JUDGE'])

// ----- Participante -----
ruta('GET', '/participante/inicio', ({ usuario }) => ({
  proyectos: bd.proyectos.filter((p) => p.participanteId === usuario.id).sort((a, b) => b.id - a.id)
    .map((p) => ({ proyecto: vistaProyecto(p), etapa: etapaDe(p) })),
  convocatoriasAbiertas: bd.concursos.filter(convocatoriaAbierta).map(vistaConcurso),
  etapas: ['Inscrito', 'Validado', 'Evaluación', 'Resultado'],
}), ['PARTICIPANT'])

ruta('GET', '/participante/registro', ({ q, usuario }) => {
  const abiertas = bd.concursos.filter(convocatoriaAbierta)
  const idPedido = q.get('concursoId') ? Number(q.get('concursoId')) : null
  const elegida = abiertas.find((c) => !idPedido || c.id === idPedido) || null
  const existente = elegida ? bd.proyectos.find((p) => p.participanteId === usuario.id && p.concursoId === elegida.id) : null
  return {
    convocatorias: abiertas.map(vistaConcurso), seleccionada: elegida ? vistaConcurso(elegida) : null,
    categorias: elegida ? categoriasDe(elegida.id).filter((c) => c.activa).map(vistaCategoria) : [],
    existente: existente ? vistaProyecto(existente) : null,
  }
}, ['PARTICIPANT'])

ruta('POST', '/participante/registro', ({ formulario, usuario }) => {
  const concurso = concursoDe(formulario.get('concursoId'))
  exigir(concurso && convocatoriaAbierta(concurso), 'Esta convocatoria no está recibiendo trabajos')
  const datos = datosProyecto({
    categoriaId: formulario.get('categoriaId'), titulo: formulario.get('titulo') ?? '', resumen: formulario.get('resumen') ?? '',
    integrantes: formulario.getAll('integrantes'), institucionGrado: formulario.get('institucionGrado') ?? '',
  }, concurso)
  let proyecto = bd.proyectos.find((p) => p.participanteId === usuario.id && p.concursoId === concurso.id)
  exigir(proyecto || !concurso.cupoMaximo || proyectosDe(concurso.id).length < concurso.cupoMaximo, 'Se alcanzó el cupo máximo de proyectos de esta convocatoria')
  const archivo = formulario.get('archivo')
  const hayArchivo = archivo && archivo.name
  exigir(hayArchivo || proyecto?.nombreArchivo, 'Selecciona el archivo de tu trabajo')
  if (!proyecto) {
    proyecto = { id: nuevoId(), concursoId: concurso.id, participanteId: usuario.id, observacion: '', nombreArchivo: null }
    bd.proyectos.push(proyecto)
  }
  Object.assign(proyecto, datos, { fechaEnvio: new Date().toISOString() })
  if (hayArchivo) proyecto.nombreArchivo = archivo.name
  return vistaProyecto(proyecto)
}, ['PARTICIPANT'])

ruta('GET', '/participante/proyectos/:id', ({ p, usuario }) => {
  const proyecto = proyectoDelParticipante(p[0], usuario)
  const comentarios = asignacionesDe(proyecto.id).map((a) => bd.evaluaciones[a.id])
    .filter((e) => e?.enviada && e.observaciones).map((e) => e.observaciones)
  return {
    proyecto: vistaProyecto(proyecto), etapa: etapaDe(proyecto), etapas: ['Inscrito', 'Validado', 'Evaluación', 'Resultado'],
    comentariosJurados: comentarios, puedeActualizar: concursoDe(proyecto.concursoId).estado === 'OPEN',
  }
}, ['PARTICIPANT'])

ruta('POST', '/participante/proyectos/:id/archivo', ({ p, formulario, usuario }) => {
  const proyecto = proyectoDelParticipante(p[0], usuario)
  exigir(concursoDe(proyecto.concursoId).estado === 'OPEN', 'La convocatoria ya no permite actualizar archivos')
  const archivo = formulario?.get('archivo')
  exigir(archivo && archivo.name, 'Selecciona el nuevo archivo')
  proyecto.nombreArchivo = archivo.name
  proyecto.fechaEnvio = new Date().toISOString()
  return vistaProyecto(proyecto)
}, ['PARTICIPANT'])

ruta('GET', '/participante/observaciones', ({ usuario }) => bd.proyectos.filter((p) => p.participanteId === usuario.id).map((p) => ({
  proyecto: vistaProyecto(p),
  comentariosJurados: asignacionesDe(p.id).map((a) => bd.evaluaciones[a.id]).filter((e) => e?.enviada && e.observaciones).map((e) => e.observaciones),
})), ['PARTICIPANT'])

ruta('GET', '/participante/resultados', ({ usuario }) => {
  // Un bloque por cada concurso en el que participo. El ranking se publica recién cuando el concurso se cierra.
  const mios = bd.proyectos.filter((p) => p.participanteId === usuario.id)
  const idsConcursos = [...new Set(mios.map((p) => p.concursoId))]
  return idsConcursos.map((id) => {
    const concurso = concursoDe(id)
    const publicado = concurso.estado === 'CLOSED'
    const ranking = publicado
      ? proyectosDe(id).map(filaRanking).sort((a, b) => b.promedio - a.promedio).map((fila, indice) => ({ ...fila, puesto: indice + 1 }))
      : []
    return {
      concurso: vistaConcurso(concurso), publicado, ranking,
      misProyectos: mios.filter((p) => p.concursoId === id).map((p) => p.id),
    }
  })
}, ['PARTICIPANT'])

// ----- Administración -----
ruta('GET', '/administracion/usuarios', () => [...bd.usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(vistaUsuario), ['ADMIN'])

function validarUsuario(cuerpo, idActual) {
  exigir(cuerpo.nombre && cuerpo.nombre.trim() && cuerpo.correo && cuerpo.correo.trim() && cuerpo.rol, 'Nombre, correo y rol son obligatorios')
  const correo = cuerpo.correo.trim().toLowerCase()
  exigir(!bd.usuarios.some((u) => u.correo === correo && u.id !== idActual), 'El correo ya está registrado')
  exigir(!cuerpo.clave || cuerpo.clave.length >= 8, 'La contraseña requiere al menos 8 caracteres')
  return correo
}

ruta('POST', '/administracion/usuarios', ({ cuerpo }) => {
  const correo = validarUsuario(cuerpo)
  exigir(cuerpo.clave && cuerpo.clave.length >= 8, 'Completa los datos; la contraseña requiere al menos 8 caracteres')
  const usuario = {
    id: nuevoId(), nombre: cuerpo.nombre.trim(), correo, clave: cuerpo.clave, rol: cuerpo.rol,
    institucionId: cuerpo.institucionId ?? null, activo: cuerpo.activo !== false,
  }
  bd.usuarios.push(usuario)
  return vistaUsuario(usuario)
}, ['ADMIN'])

ruta('PUT', '/administracion/usuarios/:id', ({ p, cuerpo, usuario: quienEdita }) => {
  const usuario = usuarioDe(p[0])
  exigir(usuario, 'Usuario no encontrado')
  const correo = validarUsuario(cuerpo, usuario.id)
  const esMiCuenta = usuario.id === quienEdita.id
  exigir(!esMiCuenta || (usuario.correo === correo && usuario.rol === cuerpo.rol), 'Por seguridad, no puedes cambiar el correo ni el rol de tu sesión actual')
  exigir(!esMiCuenta || cuerpo.activo !== false, 'No puedes desactivar tu propia cuenta')
  const administradores = bd.usuarios.filter((u) => u.rol === 'ADMIN').length
  exigir(!(usuario.rol === 'ADMIN' && (cuerpo.rol !== 'ADMIN' || cuerpo.activo === false) && administradores <= 1), 'Debe existir al menos un administrador activo')
  Object.assign(usuario, { nombre: cuerpo.nombre.trim(), correo, rol: cuerpo.rol, institucionId: cuerpo.institucionId ?? null, activo: cuerpo.activo !== false })
  if (cuerpo.clave) usuario.clave = cuerpo.clave
  return vistaUsuario(usuario)
}, ['ADMIN'])

ruta('GET', '/administracion/instituciones', () => [...bd.instituciones].sort((a, b) => a.nombre.localeCompare(b.nombre)), ['ADMIN'])

function validarInstitucion(cuerpo, idActual) {
  exigir(cuerpo.nombre && cuerpo.nombre.trim(), 'El nombre de la institución es obligatorio')
  exigir(!bd.instituciones.some((i) => i.nombre.toLowerCase() === cuerpo.nombre.trim().toLowerCase() && i.id !== idActual), 'Ya existe una institución con ese nombre')
}

ruta('POST', '/administracion/instituciones', ({ cuerpo }) => {
  validarInstitucion(cuerpo)
  const institucion = { id: nuevoId(), nombre: cuerpo.nombre.trim(), ciudad: cuerpo.ciudad || null, activa: Boolean(cuerpo.activa) }
  bd.instituciones.push(institucion)
  return institucion
}, ['ADMIN'])

ruta('PUT', '/administracion/instituciones/:id', ({ p, cuerpo }) => {
  const institucion = bd.instituciones.find((i) => i.id === Number(p[0]))
  exigir(institucion, 'Institución no encontrada')
  validarInstitucion(cuerpo, institucion.id)
  Object.assign(institucion, { nombre: cuerpo.nombre.trim(), ciudad: cuerpo.ciudad || null, activa: Boolean(cuerpo.activa) })
  return institucion
}, ['ADMIN'])

// ---------------------------------------------------------------------------
// Punto de entrada: lo usa servicios/api.js cuando la página está en modo local (sin backend)
// ---------------------------------------------------------------------------

/** Responde a una llamada como lo haría el servidor. `ruta` viene con su query, por ejemplo "/proyectos?concursoId=1". */
export async function pedirLocal(rutaCompleta, { metodo = 'GET', cuerpo, formulario } = {}) {
  // Una pequeña espera para que se sienta como una llamada real
  await new Promise((resolver) => setTimeout(resolver, 120))

  const [camino, consulta = ''] = rutaCompleta.split('?')
  const coincidencia = rutas
    .map((r) => ({ r, partes: r.expresion.exec(camino) }))
    .find(({ r, partes }) => partes && r.metodo === metodo)
  if (!coincidencia) throw error(404, 'Esta acción no existe en la versión sin servidor')

  const { r, partes } = coincidencia
  const esAcceso = camino.startsWith('/autenticacion')
  const usuario = esAcceso ? null : usuarioActual()
  if (r.roles && !r.roles.includes(usuario.rol)) throw error(403, 'No tienes permiso para esta sección')

  const respuesta = r.manejador({
    p: partes.slice(1), q: new URLSearchParams(consulta), cuerpo: cuerpo ?? {}, formulario, usuario,
  })
  if (metodo !== 'GET') guardarDatos()
  // Devuelvo una copia para que la pantalla no pueda modificar los datos "del servidor" por accidente
  return JSON.parse(JSON.stringify(respuesta))
}

/** Archivos descargables de la versión sin servidor: un texto de ejemplo con el nombre que corresponde. */
export function archivoLocal(rutaCompleta, nombreSugerido) {
  let contenido = 'Archivo de ejemplo.\n'
  let nombre = nombreSugerido
  const ranking = /^\/resultados\/(\d+)\/(excel|pdf)$/.exec(rutaCompleta)
  if (ranking) {
    const concurso = concursoDe(ranking[1])
    const filas = proyectosDe(concurso.id).map(filaRanking).sort((a, b) => b.promedio - a.promedio)
    contenido = ['Puesto;Proyecto;Participantes;Categoría;Evaluaciones;Promedio %;Estado',
      ...filas.map((f, i) => `${i + 1};${f.titulo};${f.integrantes};${f.categoria};${f.evaluacionesEnviadas}/${f.juradosAsignados};${f.promedio};${f.estado}`)].join('\n')
    nombre = `ranking-${concurso.id}.csv`
  }
  return { blob: new Blob(['﻿' + contenido], { type: 'text/plain;charset=utf-8' }), nombre }
}

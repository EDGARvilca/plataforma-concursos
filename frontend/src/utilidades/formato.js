// Funciones chicas para mostrar fechas y estados de forma consistente en todas las pantallas.

export function formatearFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor.length === 10 ? valor + 'T00:00:00' : valor)
  return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatearFechaHora(valor) {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function formatearRango(inicio, cierre) {
  if (!inicio && !cierre) return 'Sin fechas'
  return `${formatearFecha(inicio)} → ${cierre ? formatearFecha(cierre) : 'sin cierre'}`
}

/** Clase de color para el estado de un concurso (BORRADOR, ABIERTO, etc. vienen de la API). */
export function claseEstadoConcurso(estado) {
  return 'estado-' + String(estado).toLowerCase()
}

/** Clase de color para el estado de un proyecto (Inscrito, Evaluando, Evaluado). */
export function claseEstadoProyecto(estado) {
  if (estado === 'Evaluado') return 'estado-open'
  if (estado === 'Evaluando') return 'estado-evaluation'
  return 'estado-draft'
}

/** Clase de color para el estado de una asignación del jurado (Pendiente, Borrador, Enviada). */
export function claseEstadoAsignacion(estado) {
  if (estado === 'Enviada') return 'estado-open'
  if (estado === 'Borrador') return 'estado-evaluation'
  return 'estado-draft'
}

export function formatearNumero(valor, decimales = 1) {
  return Number(valor ?? 0).toFixed(decimales)
}
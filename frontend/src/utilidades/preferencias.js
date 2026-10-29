// Preferencias de la persona que usa la plataforma. Se guardan en el navegador (localStorage),
// por eso envuelvo todo en try/catch: en ventanas privadas el navegador puede bloquearlo.

const CLAVE = 'preferencias-evalua-concursos'

export const PREFERENCIAS_INICIALES = {
  tamanoTexto: 'normal', // normal | grande
  concursoTipo: '',
  concursoCupoMaximo: '',
  concursoMinimoJurados: '2',
  concursoCondiciones: '',
}

export function leerPreferencias() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE) || '{}')
    return { ...PREFERENCIAS_INICIALES, ...guardadas }
  } catch {
    return { ...PREFERENCIAS_INICIALES }
  }
}

export function guardarPreferencias(preferencias) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(preferencias))
  } catch {
    // si el navegador no deja guardar, la preferencia vale solo durante esta visita
  }
  aplicarApariencia(preferencias)
}

/** Aplica el tamaño de texto a toda la página. */
export function aplicarApariencia(preferencias = leerPreferencias()) {
  document.documentElement.style.fontSize = preferencias.tamanoTexto === 'grande' ? '112.5%' : ''
}
// Cliente para hablar con la API de Spring Boot.
// Aquí centralizo todo: la cookie de sesión, el token CSRF y el manejo de errores,
// así las páginas solo llaman a api.obtener(...), api.enviar(...), etc.
//
// Si la página se construye con VITE_MODO_LOCAL=true (versión publicada sin backend),
// las llamadas no salen a internet: las responde servicios/apiLocal.js con datos de ejemplo.

import { ErrorApi } from './ErrorApi.js'

export { ErrorApi }

/** Verdadero cuando la página funciona sin servidor, con los datos guardados en el navegador. */
export const MODO_LOCAL = import.meta.env.VITE_MODO_LOCAL === 'true'

const BASE = '/api'

function leerCookie(nombre) {
  const par = document.cookie.split('; ').find((c) => c.startsWith(nombre + '='))
  return par ? decodeURIComponent(par.split('=')[1]) : null
}

function avisarSesionExpirada() {
  window.dispatchEvent(new Event('sesion-expirada'))
}

async function pedirSinServidor(ruta, opciones) {
  // El import dinámico hace que este código no se incluya en la versión con servidor
  const { pedirLocal } = await import('./apiLocal.js')
  try {
    return await pedirLocal(ruta, opciones)
  } catch (fallo) {
    if (fallo.estado === 401 && ruta !== '/autenticacion/iniciar') avisarSesionExpirada()
    throw fallo
  }
}

async function pedir(ruta, { metodo = 'GET', cuerpo, formulario } = {}) {
  if (MODO_LOCAL) return pedirSinServidor(ruta, { metodo, cuerpo, formulario })

  const cabeceras = {}
  const opciones = { method: metodo, headers: cabeceras, credentials: 'same-origin' }

  // Toda petición que cambia datos lleva el token CSRF que Spring dejó en una cookie
  if (metodo !== 'GET') {
    const token = leerCookie('XSRF-TOKEN')
    if (token) cabeceras['X-XSRF-TOKEN'] = token
  }
  if (formulario) {
    opciones.body = formulario // el navegador arma solo el Content-Type multipart
  } else if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(cuerpo)
  }

  const respuesta = await fetch(BASE + ruta, opciones)

  if (respuesta.status === 401 && ruta !== '/autenticacion/iniciar') {
    // La sesión caducó: aviso a la app para que mande al usuario al login
    avisarSesionExpirada()
  }
  if (!respuesta.ok) {
    let mensaje = 'No se pudo completar la acción'
    try {
      const datos = await respuesta.json()
      if (datos.mensaje) mensaje = datos.mensaje
    } catch {
      // la respuesta no traía JSON; dejo el mensaje por defecto
    }
    throw new ErrorApi(mensaje, respuesta.status)
  }
  const tipo = respuesta.headers.get('content-type') || ''
  return tipo.includes('application/json') ? respuesta.json() : respuesta
}

function guardarArchivo(blob, nombre) {
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(blob)
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

/** Descarga un archivo (Excel, PDF, adjuntos) usando la sesión actual. */
async function descargar(ruta, nombreSugerido) {
  if (MODO_LOCAL) {
    const { archivoLocal } = await import('./apiLocal.js')
    const { blob, nombre } = archivoLocal(ruta, nombreSugerido)
    guardarArchivo(blob, nombre)
    return
  }
  const respuesta = await pedir(ruta)
  const blob = await respuesta.blob()
  const disposicion = respuesta.headers.get('content-disposition') || ''
  const coincidencia = disposicion.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  guardarArchivo(blob, coincidencia ? decodeURIComponent(coincidencia[1]) : nombreSugerido)
}

export const api = {
  obtener: (ruta) => pedir(ruta),
  enviar: (ruta, cuerpo) => pedir(ruta, { metodo: 'POST', cuerpo }),
  actualizar: (ruta, cuerpo) => pedir(ruta, { metodo: 'PUT', cuerpo }),
  subir: (ruta, formulario) => pedir(ruta, { metodo: 'POST', formulario }),
  descargar,
}

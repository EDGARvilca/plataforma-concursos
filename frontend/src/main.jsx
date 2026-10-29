import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './estilos/estilos.css'
import App from './App.jsx'
import { ProveedorSesion } from './contexto/ContextoSesion.jsx'
import { aplicarApariencia } from './utilidades/preferencias.js'
import { MODO_LOCAL } from './servicios/api.js'

aplicarApariencia()

// Sin servidor uso rutas con # (ej. /#/panel) porque GitHub Pages no puede responder a rutas internas al recargar
const Enrutador = MODO_LOCAL ? HashRouter : BrowserRouter

createRoot(document.getElementById('raiz')).render(
  <React.StrictMode>
    <Enrutador>
      <ProveedorSesion>
        <App />
      </ProveedorSesion>
    </Enrutador>
  </React.StrictMode>,
)
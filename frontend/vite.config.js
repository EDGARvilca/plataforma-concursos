import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hay dos formas de construir el frontend:
//  - normal (npm run build): se copia a la carpeta "static" de Spring Boot y se sirve junto con la API.
//  - web (npm run build:web): versión sin backend que guarda los datos en el navegador y se publica en GitHub Pages (carpeta /docs).
export default defineConfig(({ mode }) => {
  const esWeb = mode === 'web'
  return {
    plugins: [react()],
    // rutas relativas para que funcione bajo https://usuario.github.io/nombre-del-repositorio/
    base: esWeb ? './' : '/',
    server: {
      port: 5173,
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
    build: {
      outDir: esWeb ? '../docs' : '../src/main/resources/static',
      emptyOutDir: true,
    },
  }
})
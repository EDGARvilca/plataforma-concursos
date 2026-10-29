import purgecss from '@fullhuman/postcss-purgecss'

// Al compilar, quito del CSS (sobre todo de Bootstrap) las clases que ningún componente usa.
// Así la página pesa menos y carga más rápido en celulares de gama baja.
// En desarrollo no recorto nada para no tener sorpresas mientras programo.
const esCompilacion = process.env.NODE_ENV === 'production'

export default {
  plugins: esCompilacion
    ? [
        purgecss({
          content: ['./index.html', './src/**/*.{js,jsx}'],
          // Clases que armo uniendo textos (ej. 'estado-' + estado) y por eso no aparecen completas en el código
          safelist: {
            standard: [/^estado-/, /^puesto-/, /^base-/],
          },
        }),
      ]
    : [],
}
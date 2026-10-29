# Evalúa Concursos

Es una página web para organizar concursos de principio a fin: armas la convocatoria, defines las categorías y la rúbrica, recibes los proyectos, le asignas jurados a cada uno, ellos califican y al final sale el ranking solito.

## Pruébala aquí

👉 **https://edgarvilca.github.io/plataforma-concursos/**

Funciona en compu y en celular, no tienes que instalar nada. Entra con cualquiera de las cuentas de prueba que están más abajo (en el login hay botones que te las llenan solas).

Ojo con algo: por ahora **no tiene base de datos**. Lo que registres se guarda en tu propio navegador, así que no se pierde si recargas, pero otra persona no va a ver tus cambios. Si quieres empezar de cero, entra como administrador y en **Configuración** está el botón para volver a los datos de ejemplo.

## ¿Quién hace qué?

- **Administrador:** maneja los usuarios, las instituciones y la configuración.
- **Organizador:** crea los concursos, sus categorías y rúbrica, registra proyectos, asigna jurados y ve los resultados.
- **Jurado:** ve solo los proyectos que le tocaron y los califica con la rúbrica. Puede guardar borrador y, cuando está seguro, lo envía.
- **Participante:** inscribe su proyecto, ve en qué etapa va y lee las observaciones.

### Cuentas de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@demo.pe | Admin123* |
| Organizador | organizador@demo.pe | Org123* |
| Jurado | jurado@demo.pe | Jurado123* |
| Participante | participante@demo.pe | Part123* |

Son solo para probar, no las uses para nada real.

## Algunas reglas que respeta

- Un concurso no puede pasar a «En evaluación» si la rúbrica no suma 100 %.
- Cada proyecto necesita el mínimo de jurados que pide el concurso.
- Cuando un jurado envía su evaluación, ya no la puede cambiar.
- El puntaje se calcula así: `Σ((puntaje / máximo) × peso) / Σ pesos × 100`, y el ranking saca el promedio entre los jurados que ya enviaron.

## Con qué está hecha

| Parte | Herramientas |
|-------|--------------|
| Lo que se ve (frontend) | React, Vite, React Router, Bootstrap y estilos propios |
| El servidor (backend) | Spring Boot con Java 21 y Spring Security |
| Base de datos | H2 por ahora, lista para pasar a PostgreSQL |
| Reportes | Excel (Apache POI) y PDF (OpenPDF) |

La traté de hacer liviana para que cargue bien hasta en celulares sencillos: cada pantalla se descarga recién cuando la abres, le saqué a Bootstrap todo lo que no se usaba y en pantallas chicas las tablas se ven como tarjetas.

## Si quieres correrla en tu compu

Necesitas Java 21 y Node 20 o más.

Para la versión completa, con servidor:

```bash
cd frontend
npm install
npm run build
cd ..
./mvnw spring-boot:run
```

Y entras a http://localhost:8080.

Si solo vas a mover cosas del diseño, deja el servidor corriendo y en otra terminal haz `npm run dev` dentro de `frontend/`. Se abre en http://localhost:5173 y se actualiza solo cada vez que guardas.

### Para actualizar la página publicada

```bash
cd frontend
npm run build:web
```

Eso deja todo en la carpeta `docs/`, que es la que publica GitHub Pages. Luego haces commit y push, y en un par de minutos ya está.

## Cómo está ordenado el código

```
frontend/src/
  paginas/        las pantallas, separadas por rol
  componentes/    piezas que se repiten (menú, gráficos, mensajes, logo)
  servicios/      la conexión con el servidor (o con los datos del navegador)
  contexto/       quién inició sesión
  utilidades/     formato de fechas, estados y preferencias
src/main/java/com/concursos/plataforma/
  api/            lo que recibe y responde el servidor
  service/        las reglas del negocio
  repository/     acceso a la base de datos
  model/          las tablas
  config/         seguridad y datos de arranque
```

Para correr las pruebas: `./mvnw test`

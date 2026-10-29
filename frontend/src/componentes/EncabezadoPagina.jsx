/** Título grande de cada pantalla con su descripción y, a la derecha, las acciones principales. */
export default function EncabezadoPagina({ etiqueta, titulo, descripcion, children }) {
  return (
    <div className="encabezado-pagina">
      <div>
        {etiqueta && <span className="etiqueta-seccion">{etiqueta}</span>}
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}
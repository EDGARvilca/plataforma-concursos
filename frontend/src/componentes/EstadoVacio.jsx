/** Mensaje para cuando todavía no hay registros (patrón del wireframe WF20). */
export default function EstadoVacio({ titulo, texto, children }) {
  return (
    <div className="vacio">
      {titulo && <h3 className="h5">{titulo}</h3>}
      {texto && <p className="text-secondary">{texto}</p>}
      {children}
    </div>
  )
}
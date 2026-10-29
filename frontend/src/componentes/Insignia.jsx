/** Etiqueta de color para mostrar un estado. La clase la calculo en utilidades/formato.js. */
export default function Insignia({ texto, clase }) {
  return <span className={`badge estado ${clase}`}>{texto}</span>
}
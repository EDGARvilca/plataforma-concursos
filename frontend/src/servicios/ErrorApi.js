/** Error que lanzo cuando la API (real o local) falla; trae el mensaje listo para mostrar. */
export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje)
    this.estado = estado
  }
}

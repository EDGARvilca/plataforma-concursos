import Logo from '../../componentes/Logo.jsx'

/** Panel izquierdo decorativo de las pantallas de acceso. */
export default function PanelHistoria() {
  return (
    <section className="col-lg-7 auth-historia d-none d-lg-flex flex-column justify-content-between p-5">
      <div className="marca">
        <Logo tamano={64} claro />
      </div>

      <div>
        <span className="etiqueta-seccion">Gestión integral de convocatorias</span>
        <h1>Decisiones más claras. Procesos más confiables.</h1>
        <p className="fs-5 mt-3">
          Una plataforma para organizar convocatorias, recibir propuestas y evaluar con transparencia de principio a fin.
        </p>
        <div className="d-flex flex-wrap gap-2 mt-4">
          <span className="auth-chip"><b>✓</b> Rúbricas digitales</span>
          <span className="auth-chip"><b>✓</b> Recepción segura</span>
          <span className="auth-chip"><b>✓</b> Resultados trazables</span>
        </div>
      </div>

      <small className="text-white-50">Operación segura y trazable</small>
    </section>
  )
}
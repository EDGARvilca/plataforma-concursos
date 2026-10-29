import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { useSesion } from '../../contexto/ContextoSesion.jsx'
import TablaAsignaciones from './TablaAsignaciones.jsx'

function Indicador({ etiqueta, valor, detalle }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card h-100"><div className="card-body">
        <small className="etiqueta-seccion">{etiqueta}</small>
        <div className="cifra-metrica">{valor}</div>
        <small className="text-secondary">{detalle}</small>
      </div></div>
    </div>
  )
}

/** Panel del jurado (WF12): sus indicadores y la lista de proyectos asignados. */
export default function PanelJurado() {
  const { usuario } = useSesion()
  const { datos, cargando, error } = useCarga('/jurado/asignaciones')

  return (
    <Pagina titulo="Dashboard">
      <EncabezadoPagina etiqueta="Panel del jurado" titulo={`Hola, ${usuario.nombre}`} descripcion="Tus proyectos pendientes y evaluados." />
      <Mensaje texto={error} />
      {!datos ? (cargando ? <Cargando /> : null) : (
        <>
          <section className="row g-3 mb-3">
            <Indicador etiqueta="Asignados" valor={datos.total} detalle="proyectos" />
            <Indicador etiqueta="Pendientes" valor={datos.pendientes} detalle="por evaluar" />
            <Indicador etiqueta="Evaluados" valor={datos.enviadas} detalle="enviados" />
            <Indicador etiqueta="Avance" valor={`${datos.avance}%`} detalle="de tu carga" />
          </section>
          <TablaAsignaciones asignaciones={datos.asignaciones} />
        </>
      )}
    </Pagina>
  )
}
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import TablaAsignaciones from './TablaAsignaciones.jsx'

/** Lista completa de proyectos asignados al jurado. Con `soloEvaluados` muestra el historial de evaluaciones enviadas. */
export default function MisAsignaciones({ soloEvaluados = false }) {
  const { datos, cargando, error } = useCarga('/jurado/asignaciones')
  const titulo = soloEvaluados ? 'Evaluaciones' : 'Mis asignaciones'

  return (
    <Pagina titulo={titulo}>
      <EncabezadoPagina etiqueta="Jurado" titulo={titulo}
                        descripcion={soloEvaluados ? 'Evaluaciones que ya enviaste.' : 'Todos los proyectos que te asignaron.'} />
      <Mensaje texto={error} />
      {!datos ? (cargando ? <Cargando /> : null) : (
        <TablaAsignaciones asignaciones={datos.asignaciones} filtroInicial={soloEvaluados ? 'evaluados' : 'todos'} />
      )}
    </Pagina>
  )
}
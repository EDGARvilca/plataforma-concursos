import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'

/** Lista donde se marcan elementos con un clic (varios a la vez). */
function ListaSeleccionable({ titulo, elementos, marcados, alMarcar, vacio }) {
  return (
    <div>
      <h3 className="h6">{titulo} <span className="text-secondary fw-normal">({elementos.length})</span></h3>
      <div className="asignacion-lista asignacion-corta">
        {elementos.length === 0 && <div className="p-3 small text-secondary">{vacio}</div>}
        {elementos.map((elemento) => (
          <div key={elemento.id}
               className={`asignacion-item ${marcados.includes(elemento.id) ? 'seleccionado' : ''}`}
               onClick={() => alMarcar(elemento.id)}>
            {elemento.nombre}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Asignación de jurados (WF11). Elijo un proyecto a la izquierda y muevo jurados entre
 * "disponibles" y "asignados" con los botones > >> < <<. Los cambios se mandan al guardar.
 * Mientras tanto trabajo sobre una copia local de las asignaciones.
 */
export default function AsignacionJurados() {
  const { id } = useParams()
  const { datos, cargando, error, recargar } = useCarga(`/concursos/${id}/asignaciones`)
  const [seleccion, setSeleccion] = useState({}) // idProyecto -> ids de jurados asignados (copia editable)
  const [proyectoElegido, setProyectoElegido] = useState(null)
  const [marcadosDisponibles, setMarcadosDisponibles] = useState([])
  const [marcadosAsignados, setMarcadosAsignados] = useState([])
  const [buscaProyecto, setBuscaProyecto] = useState('')
  const [buscaJurado, setBuscaJurado] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  // Cuando llegan datos nuevos del servidor reinicio la copia local
  useEffect(() => {
    if (!datos) return
    setSeleccion(Object.fromEntries(Object.entries(datos.asignados).map(([clave, jurados]) => [clave, [...jurados]])))
    setProyectoElegido((actual) => actual ?? datos.proyectos[0]?.id ?? null)
  }, [datos])

  // Al cambiar de proyecto se limpian las marcas de las dos listas
  useEffect(() => {
    setMarcadosDisponibles([])
    setMarcadosAsignados([])
  }, [proyectoElegido])

  // Comparo la copia local con lo guardado para saber qué asignar y qué quitar
  const cambios = useMemo(() => {
    const asignar = []
    const quitar = []
    if (!datos) return { asignar, quitar }
    for (const proyecto of datos.proyectos) {
      const original = datos.asignados[proyecto.id] ?? []
      const actual = seleccion[proyecto.id] ?? []
      actual.filter((j) => !original.includes(j)).forEach((j) => asignar.push(`${proyecto.id}:${j}`))
      original.filter((j) => !actual.includes(j)).forEach((j) => quitar.push(`${proyecto.id}:${j}`))
    }
    return { asignar, quitar }
  }, [datos, seleccion])

  const alternar = (lista, setLista) => (idJurado) =>
    setLista(lista.includes(idJurado) ? lista.filter((j) => j !== idJurado) : [...lista, idJurado])

  function cambiarAsignados(nuevos) {
    setSeleccion({ ...seleccion, [proyectoElegido]: nuevos })
    setMarcadosDisponibles([])
    setMarcadosAsignados([])
  }

  async function guardar() {
    try {
      const resultado = await api.actualizar(`/concursos/${id}/asignaciones`, cambios)
      let texto = `Asignaciones guardadas: ${resultado.asignadas} nuevas, ${resultado.quitadas} quitadas`
      if (resultado.bloqueadas > 0) texto += ` (${resultado.bloqueadas} no se pueden quitar porque ya tienen evaluación iniciada)`
      setMensaje({ tipo: 'exito', texto })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  if (cargando && !datos) return <Pagina titulo="Asignación de jurados"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Asignación de jurados"><Mensaje texto={error} /></Pagina>

  const minimo = datos.minimoJurados
  const proyectos = datos.proyectos.filter((p) => `${p.codigo} ${p.titulo}`.toLowerCase().includes(buscaProyecto.toLowerCase()))
  const asignadosIds = seleccion[proyectoElegido] ?? []
  const coincide = (jurado) => jurado.nombre.toLowerCase().includes(buscaJurado.toLowerCase())
  const disponibles = datos.jurados.filter((j) => !asignadosIds.includes(j.id) && coincide(j))
  const asignados = datos.jurados.filter((j) => asignadosIds.includes(j.id) && coincide(j))
  const debajoDelMinimo = datos.proyectos.filter((p) => (seleccion[p.id] ?? []).length < minimo)
  const proyectoActual = datos.proyectos.find((p) => p.id === proyectoElegido)

  return (
    <Pagina titulo="Asignación de jurados">
      <EncabezadoPagina etiqueta={datos.concurso.nombre} titulo="Asignación de jurados"
                        descripcion="Relación entre proyectos inscritos y evaluadores disponibles.">
        <Link className="btn btn-outline-secondary" to={`/concursos/${id}`}>← Volver a la configuración</Link>
      </EncabezadoPagina>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      {datos.proyectos.length === 0 ? (
        <EstadoVacio titulo="No hay proyectos todavía" texto="Cuando se inscriban proyectos podrás asignarles jurados." />
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-lg-4">
              <h2 className="h6">Proyectos inscritos</h2>
              <input className="form-control mb-2" type="search" placeholder="Buscar proyecto…" value={buscaProyecto}
                     onChange={(e) => setBuscaProyecto(e.target.value)} />
              <div className="asignacion-lista">
                {proyectos.map((proyecto) => {
                  const cantidad = (seleccion[proyecto.id] ?? []).length
                  return (
                    <div key={proyecto.id}
                         className={`asignacion-item ${proyecto.id === proyectoElegido ? 'seleccionado' : ''} ${cantidad < minimo ? 'insuficiente' : ''}`}
                         onClick={() => setProyectoElegido(proyecto.id)}>
                      <span><strong>{proyecto.codigo}</strong> {proyecto.titulo}</span>
                      <span className="conteo small">{cantidad}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="col-lg-8">
              <h2 className="h6">Jurados para «{proyectoActual?.titulo}»</h2>
              <input className="form-control mb-2" type="search" placeholder="Buscar jurado…" value={buscaJurado}
                     onChange={(e) => setBuscaJurado(e.target.value)} />
              <div className="transferencia">
                <ListaSeleccionable titulo="Jurados disponibles" elementos={disponibles} marcados={marcadosDisponibles}
                                    alMarcar={alternar(marcadosDisponibles, setMarcadosDisponibles)} vacio="No quedan jurados por asignar." />

                <div className="transferencia-botones">
                  <button type="button" className="btn btn-outline-secondary" title="Asignar los marcados" aria-label="Asignar los marcados"
                          disabled={marcadosDisponibles.length === 0}
                          onClick={() => cambiarAsignados([...asignadosIds, ...marcadosDisponibles])}>&gt;</button>
                  <button type="button" className="btn btn-outline-secondary" title="Asignar todos" aria-label="Asignar todos"
                          disabled={disponibles.length === 0}
                          onClick={() => cambiarAsignados([...asignadosIds, ...disponibles.map((j) => j.id)])}>&gt;&gt;</button>
                  <button type="button" className="btn btn-outline-secondary" title="Quitar los marcados" aria-label="Quitar los marcados"
                          disabled={marcadosAsignados.length === 0}
                          onClick={() => cambiarAsignados(asignadosIds.filter((j) => !marcadosAsignados.includes(j)))}>&lt;</button>
                  <button type="button" className="btn btn-outline-secondary" title="Quitar todos" aria-label="Quitar todos"
                          disabled={asignados.length === 0}
                          onClick={() => cambiarAsignados(asignadosIds.filter((j) => !asignados.some((a) => a.id === j)))}>&lt;&lt;</button>
                </div>

                <ListaSeleccionable titulo="Asignados al proyecto" elementos={asignados} marcados={marcadosAsignados}
                                    alMarcar={alternar(marcadosAsignados, setMarcadosAsignados)} vacio="Este proyecto aún no tiene jurados." />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h2 className="h6 mb-1">Validación y resumen de asignación</h2>
                <div className="small">Jurados por proyecto: {minimo} como mínimo.</div>
                {debajoDelMinimo.length > 0 ? (
                  <div className="small" style={{ color: '#a36a0d' }}>
                    {debajoDelMinimo.length} proyecto(s) aún no llegan al mínimo.
                  </div>
                ) : (
                  <div className="small text-success">Todos los proyectos cumplen el mínimo.</div>
                )}
                <div className="small text-secondary">
                  Cambios pendientes: {cambios.asignar.length} por asignar, {cambios.quitar.length} por quitar.
                </div>
              </div>
              <button className="btn btn-primary" type="button" onClick={guardar}
                      disabled={cambios.asignar.length + cambios.quitar.length === 0}>
                Guardar asignaciones
              </button>
            </div>
          </div>
        </>
      )}
    </Pagina>
  )
}
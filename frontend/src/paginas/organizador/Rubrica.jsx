import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import EstadoVacio from '../../componentes/EstadoVacio.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { formatearNumero } from '../../utilidades/formato.js'

const NUEVO = { id: null, nombre: '', descripcion: '', puntajeMaximo: 20, peso: 25 }

/** Configuración de la rúbrica (WF08): criterios, puntaje máximo y peso. El total debe sumar 100%. */
export default function Rubrica() {
  const { id } = useParams()
  const { datos, cargando, error, recargar } = useCarga(`/concursos/${id}/rubrica`)
  const [edicion, setEdicion] = useState(NUEVO)
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  async function guardar(evento) {
    evento.preventDefault()
    const cuerpo = {
      nombre: edicion.nombre,
      descripcion: edicion.descripcion,
      puntajeMaximo: Number(edicion.puntajeMaximo),
      peso: Number(edicion.peso),
    }
    try {
      if (edicion.id) await api.actualizar(`/concursos/${id}/rubrica/${edicion.id}`, cuerpo)
      else await api.enviar(`/concursos/${id}/rubrica`, cuerpo)
      setEdicion(NUEVO)
      setMensaje({ tipo: 'exito', texto: 'Criterio guardado correctamente' })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  return (
    <Pagina titulo="Rúbrica">
      <EncabezadoPagina etiqueta="Configuración" titulo="Rúbrica del concurso"
                        descripcion="Criterios, puntajes máximos y pesos de evaluación.">
        <Link className="btn btn-outline-secondary" to={`/concursos/${id}`}>← Volver a la configuración</Link>
      </EncabezadoPagina>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto || error} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      {cargando && !datos ? <Cargando /> : (
        <>
          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <small className="etiqueta-seccion">Total peso</small>
                <div className="cifra-metrica">{formatearNumero(datos.pesoTotal, 1)}%</div>
              </div>
              <span className={`badge estado ${datos.valida ? 'estado-open' : 'estado-evaluation'}`}>
                {datos.valida ? 'Rúbrica completa' : 'Debe sumar 100% para iniciar la evaluación'}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-xl-8">
              <div className="card"><div className="card-body">
                {datos.criterios.length === 0 ? (
                  <EstadoVacio titulo="No hay registros todavía" texto="Agrega el primer criterio con el formulario." />
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead><tr><th>Criterio</th><th>Descripción</th><th>Máx.</th><th>Peso</th><th /></tr></thead>
                      <tbody>
                        {datos.criterios.map((criterio) => (
                          <tr key={criterio.id}>
                            <td className="fw-semibold">{criterio.nombre}</td>
                            <td className="small">{criterio.descripcion}</td>
                            <td>{criterio.puntajeMaximo}</td>
                            <td>{criterio.peso}%</td>
                            <td className="text-end">
                              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setEdicion(criterio)}>Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div></div>
            </div>

            <div className="col-xl-4">
              <form className="card" onSubmit={guardar}>
                <div className="card-body">
                  <h2 className="h5">{edicion.id ? 'Editar criterio' : '+ Agregar criterio'}</h2>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="nombre">Criterio</label>
                    <input id="nombre" className="form-control" required value={edicion.nombre}
                           onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="descripcion">Descripción</label>
                    <input id="descripcion" className="form-control" value={edicion.descripcion ?? ''}
                           onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label" htmlFor="maximo">Puntaje máx.</label>
                      <input id="maximo" type="number" min="1" step="0.1" className="form-control" required value={edicion.puntajeMaximo}
                             onChange={(e) => setEdicion({ ...edicion, puntajeMaximo: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="peso">Peso %</label>
                      <input id="peso" type="number" min="0.1" step="0.1" className="form-control" required value={edicion.peso}
                             onChange={(e) => setEdicion({ ...edicion, peso: e.target.value })} />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit">Guardar criterio</button>
                    {edicion.id && <button className="btn btn-outline-secondary" type="button" onClick={() => setEdicion(NUEVO)}>Cancelar</button>}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </Pagina>
  )
}
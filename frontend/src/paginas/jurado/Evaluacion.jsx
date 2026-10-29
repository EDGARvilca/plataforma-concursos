import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'

const LIMITE_OBSERVACIONES = 1000

/**
 * Evaluación por rúbrica (WF14). Mientras el jurado escribe se recalcula el total ponderado:
 *   puntaje = Σ((puntaje / máximo) × peso) / Σ(pesos) × 100
 * (es la misma fórmula que usa el servidor para el ranking).
 */
export default function Evaluacion() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { datos, cargando, error, recargar } = useCarga(`/jurado/evaluaciones/${id}`)
  const [puntajes, setPuntajes] = useState({})
  const [observaciones, setObservaciones] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: 'exito', texto: '' })

  useEffect(() => {
    if (!datos) return
    setPuntajes(Object.fromEntries(Object.entries(datos.puntajes).map(([criterio, valor]) => [criterio, String(valor)])))
    setObservaciones(datos.observaciones ?? '')
  }, [datos])

  const resumen = useMemo(() => {
    if (!datos) return { completados: 0, total: 0 }
    const pesoTotal = datos.criterios.reduce((suma, c) => suma + c.peso, 0)
    let ponderado = 0
    let completados = 0
    datos.criterios.forEach((criterio) => {
      const valor = puntajes[criterio.id]
      if (valor !== undefined && valor !== '') completados += 1
      ponderado += ((Number(valor) || 0) / criterio.puntajeMaximo) * criterio.peso
    })
    return { completados, total: pesoTotal > 0 ? (ponderado / pesoTotal) * 100 : 0 }
  }, [datos, puntajes])

  function cuerpo() {
    const limpios = {}
    Object.entries(puntajes).forEach(([criterio, valor]) => {
      if (valor !== '') limpios[criterio] = Number(valor)
    })
    return { puntajes: limpios, observaciones }
  }

  async function guardarBorrador() {
    try {
      await api.actualizar(`/jurado/evaluaciones/${id}/borrador`, cuerpo())
      setMensaje({ tipo: 'exito', texto: 'Borrador guardado' })
      await recargar()
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  // "Enviar evaluación" no envía todavía: guarda el borrador y pasa a la pantalla de confirmación
  async function revisar(evento) {
    evento.preventDefault()
    const faltan = datos.criterios.some((c) => puntajes[c.id] === undefined || puntajes[c.id] === '')
    if (faltan) {
      setMensaje({ tipo: 'error', texto: 'Debes completar todos los criterios antes de enviar' })
      return
    }
    try {
      await api.actualizar(`/jurado/evaluaciones/${id}/borrador`, cuerpo())
      navegar(`/jurado/evaluacion/${id}/confirmar`)
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    }
  }

  if (cargando && !datos) return <Pagina titulo="Evaluación"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Evaluación"><Mensaje texto={error} /></Pagina>

  const { proyecto, criterios, estado } = datos
  if (estado === 'Enviada') {
    return (
      <Pagina titulo="Evaluación">
        <Mensaje tipo="exito" texto="Esta evaluación ya fue enviada y cuenta para el ranking." />
        <Link className="btn btn-primary" to="/jurado">Volver al panel</Link>
      </Pagina>
    )
  }

  return (
    <Pagina titulo="Evaluación">
      <EncabezadoPagina etiqueta={proyecto.concurso} titulo={proyecto.titulo} descripcion={`${proyecto.codigo} · ${proyecto.categoria}`}>
        <Link className="btn btn-outline-secondary" to={`/jurado/asignaciones/${id}`}>← Detalle del proyecto</Link>
      </EncabezadoPagina>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} alCerrar={() => setMensaje({ ...mensaje, texto: '' })} />

      <form onSubmit={revisar}>
        <div className="card mb-3"><div className="card-body">
          {criterios.map((criterio, posicion) => {
            const valor = Number(puntajes[criterio.id]) || 0
            return (
              <div className="rubrica-fila" key={criterio.id}>
                <span className="rubrica-numero">{posicion + 1}</span>
                <div>
                  <strong>{criterio.nombre}</strong>
                  <div className="small text-secondary">{criterio.descripcion}</div>
                  <div className="small text-secondary">Peso {criterio.peso}% · máximo {criterio.puntajeMaximo}</div>
                  <div className="progress" role="progressbar">
                    <div className="progress-bar" style={{ width: `${Math.min(100, (valor / criterio.puntajeMaximo) * 100)}%` }} />
                  </div>
                </div>
                <div className="rubrica-puntaje">
                  <input type="number" className="form-control" min="0" max={criterio.puntajeMaximo}
                         step="0.1" aria-label={`Puntaje de ${criterio.nombre}`} value={puntajes[criterio.id] ?? ''}
                         onChange={(e) => setPuntajes({ ...puntajes, [criterio.id]: e.target.value })} />
                </div>
              </div>
            )
          })}
        </div></div>

        <div className="card mb-3"><div className="card-body">
          <label className="form-label" htmlFor="observaciones">Observaciones generales</label>
          <textarea id="observaciones" className="form-control" rows={4} maxLength={LIMITE_OBSERVACIONES}
                    value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Observaciones generales…" />
          <div className="form-text text-end">{observaciones.length} / {LIMITE_OBSERVACIONES}</div>
        </div></div>

        <div className="resumen-evaluacion mb-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <small>Total ponderado</small>
              <div className="h2 mb-0">{resumen.total.toFixed(1)} / 100</div>
            </div>
            <div className="flex-grow-1" style={{ maxWidth: 260 }}>
              <small>{resumen.completados} de {criterios.length} criterios</small>
              <div className="progress mt-1"><div className="progress-bar" style={{ width: `${(resumen.completados / criterios.length) * 100}%` }} /></div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light" type="button" onClick={guardarBorrador}>Guardar borrador</button>
              <button className="btn btn-light" type="submit">Enviar evaluación</button>
            </div>
          </div>
        </div>
      </form>
    </Pagina>
  )
}
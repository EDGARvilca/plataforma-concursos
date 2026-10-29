import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../servicios/api.js'
import Pagina from '../../componentes/Pagina.jsx'
import EncabezadoPagina from '../../componentes/EncabezadoPagina.jsx'
import Cargando from '../../componentes/Cargando.jsx'
import Mensaje from '../../componentes/Mensaje.jsx'
import { useCarga } from '../../componentes/useCarga.js'
import { formatearNumero } from '../../utilidades/formato.js'

/** Confirmación antes del envío definitivo (WF15). Una vez enviada, la evaluación ya no se puede modificar. */
export default function Confirmacion() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { datos, cargando, error } = useCarga(`/jurado/evaluaciones/${id}`)
  const [fallo, setFallo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    setEnviando(true)
    setFallo('')
    try {
      await api.enviar(`/jurado/evaluaciones/${id}/enviar`, { puntajes: datos.puntajes, observaciones: datos.observaciones })
      navegar('/jurado', { replace: true })
    } catch (errorEnvio) {
      setFallo(errorEnvio.message)
      setEnviando(false)
    }
  }

  if (cargando) return <Pagina titulo="Confirmación"><Cargando /></Pagina>
  if (error) return <Pagina titulo="Confirmación"><Mensaje texto={error} /></Pagina>

  const { proyecto, criterios, puntajes, puntajeFinal } = datos
  const completados = criterios.filter((c) => puntajes[c.id] !== undefined).length

  return (
    <Pagina titulo="Confirmación">
      <EncabezadoPagina etiqueta={proyecto.concurso} titulo="¿Confirmar el envío de la evaluación?"
                        descripcion="Una vez enviada, la evaluación queda registrada para el cálculo del ranking." />
      <Mensaje texto={fallo} />

      <div className="card mb-3"><div className="card-body">
        <div className="row g-3 text-center">
          <div className="col-md-4"><small className="etiqueta-seccion">Puntaje final</small><div className="puntaje-final">{formatearNumero(puntajeFinal, 1)}</div></div>
          <div className="col-md-4"><small className="etiqueta-seccion">Criterios</small><div className="cifra-metrica">{completados}/{criterios.length}</div><small className="text-secondary">completados</small></div>
          <div className="col-md-4"><small className="etiqueta-seccion">Observaciones</small><div className="cifra-metrica">{datos.observaciones ? '✓' : '—'}</div><small className="text-secondary">{datos.observaciones ? 'registradas' : 'sin observaciones'}</small></div>
        </div>
        <hr />
        <p className="mb-1"><strong>{proyecto.titulo}</strong> <span className="text-secondary">({proyecto.codigo})</span></p>
        <ul className="mb-0 small">
          {criterios.map((c) => <li key={c.id}>{c.nombre}: {puntajes[c.id]} / {c.puntajeMaximo}</li>)}
        </ul>
      </div></div>

      <div className="d-flex gap-2 justify-content-end">
        <Link className="btn btn-outline-secondary" to={`/jurado/evaluacion/${id}`}>Volver y editar</Link>
        <button className="btn btn-primary" type="button" onClick={confirmar} disabled={enviando || completados < criterios.length}>
          {enviando ? 'Enviando…' : 'Confirmar envío'}
        </button>
      </div>
    </Pagina>
  )
}
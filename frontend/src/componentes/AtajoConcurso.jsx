import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../servicios/api.js'
import Pagina from './Pagina.jsx'
import Cargando from './Cargando.jsx'
import EstadoVacio from './EstadoVacio.jsx'

/**
 * Las opciones del menú "Jurados", "Evaluaciones" y "Resultados" trabajan sobre un concurso.
 * Este componente elige el concurso activo (en evaluación, o abierto, o el primero) y redirige ahí.
 */
export default function AtajoConcurso({ destino, titulo }) {
  const [ruta, setRuta] = useState(null)
  const [sinConcursos, setSinConcursos] = useState(false)

  useEffect(() => {
    api.obtener('/concursos').then((lista) => {
      const activo = lista.find((c) => c.estado === 'EVALUATION') || lista.find((c) => c.estado === 'OPEN') || lista[0]
      if (!activo) {
        setSinConcursos(true)
        return
      }
      setRuta(destino(activo.id))
    })
  }, [destino])

  if (ruta) return <Navigate to={ruta} replace />
  return (
    <Pagina titulo={titulo}>
      {sinConcursos ? (
        <EstadoVacio titulo="Aún no hay concursos" texto="Crea un concurso para poder usar esta sección.">
          <Link className="btn btn-primary" to="/concursos/nuevo">Crear concurso</Link>
        </EstadoVacio>
      ) : (
        <Cargando />
      )}
    </Pagina>
  )
}
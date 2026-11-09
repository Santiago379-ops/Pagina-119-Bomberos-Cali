import BadgeEstado from './BadgeEstado.jsx'
import Icono from './Icono.jsx'
import { formatoHora } from '../utils/formato.js'
import { colorDeGrupo, grupoDe } from '../data/grupos.js'

// Lista de reportes: color y código del grupo, hora, barrio y estado.
// `cercanos` (extra) = cuántos reportes activos hay a menos de 250 m.
export default function ListaReportes({ reportes, seleccionadoId, onSeleccionar, cercanos }) {
  if (!reportes.length) {
    return (
      <div className="vacio">
        <Icono nombre="lista" tam={28} />
        <strong>Aún no hay reportes</strong>
        <p>Cuando un ciudadano envíe uno desde <b>/reportar</b>, aparecerá aquí y en el mapa. Para probar, usa «Simular 50 reportes».</p>
      </div>
    )
  }
  return (
    <ul className="lista">
      {reportes.map((r) => {
        const n = cercanos(r)
        return (
          <li key={r.id}>
            <button
              type="button"
              className={`lista__item ${r.id === seleccionadoId ? 'is-activo' : ''}`}
              style={{ '--c': colorDeGrupo(r.grupo) }}
              onClick={() => onSeleccionar(r.id)}
              aria-label={`Reporte ${r.id}, grupo ${r.grupo}, ${r.barrio}, ${r.estado}`}
            >
              <span className="lista__codigo" title={grupoDe(r.grupo)?.nombre}>{r.grupo}</span>
              <span className="lista__cuerpo">
                <span className="lista__fila">
                  <strong className="lista__barrio">{r.barrio}</strong>
                  <time>{formatoHora(r.creadoEn)}</time>
                </span>
                <span className="lista__fila">
                  <BadgeEstado estado={r.estado} />
                  {n > 0 && <small className="cerca" title="Reportes activos a menos de 250 m"><Icono nombre="alerta" tam={13} /> {n} cercano{n > 1 ? 's' : ''}</small>}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

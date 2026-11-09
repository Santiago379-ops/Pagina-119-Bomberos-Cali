import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import Logo from '../components/Logo.jsx'
import MapaOperador from '../mapa/MapaOperador.jsx'
import ListaReportes from '../components/ListaReportes.jsx'
import DetalleReporte from '../components/DetalleReporte.jsx'
import { useReportes } from '../context/ReportesContext.jsx'
import { GRUPOS } from '../data/grupos.js'
import { ESTADOS, ESTADOS_INACTIVOS } from '../data/estados.js'
import { distanciaMetros } from '../utils/formato.js'

const RADIO_CERCANOS_M = 250

// Pantalla 3 · /operador. Los reportes vienen del estado global (los que envía
// el ciudadano); ya no hay datos de prueba.
export default function Operador() {
  const { reportes, simular, limpiarTodo } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [centrarKey, setCentrarKey] = useState(0)
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [agrupar, setAgrupar] = useState(true)

  // Extra: filtros por grupo y estado (afectan lista y mapa).
  const visibles = useMemo(
    () =>
      reportes.filter(
        (r) => (!filtroGrupo || r.grupo === Number(filtroGrupo)) && (!filtroEstado || r.estado === filtroEstado),
      ),
    [reportes, filtroGrupo, filtroEstado],
  )

  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  // Extra: aviso de reportes cercanos (activos, a menos de 250 m).
  const cercanosDe = useCallback(
    (r) =>
      ESTADOS_INACTIVOS.includes(r.estado)
        ? []
        : reportes.filter(
            (o) => o.id !== r.id && !ESTADOS_INACTIVOS.includes(o.estado) && distanciaMetros(r, o) <= RADIO_CERCANOS_M,
          ),
    [reportes],
  )

  // Clic en lista o en el mapa: selecciona, y la señal hace que el mapa se centre.
  const seleccionar = (id) => {
    setSeleccionadoId(id)
    setCentrarKey((k) => k + 1)
  }

  const porAtender = reportes.filter((r) => r.estado === ESTADOS.RECIBIDO).length
  const enCurso = reportes.filter((r) => r.estado === ESTADOS.VALIDADO || r.estado === ESTADOS.DESPACHADO).length
  const cerrados = reportes.filter((r) => ESTADOS_INACTIVOS.includes(r.estado)).length

  return (
    <div className="operador">
      <header className="operador__barra">
        <Logo claro />
        <h1>Centro de despacho</h1>
        <ul className="resumen" aria-label="Resumen de reportes">
          <li className="resumen__item resumen__item--alerta"><b>{porAtender}</b> por atender</li>
          <li className="resumen__item"><b>{enCurso}</b> en curso</li>
          <li className="resumen__item"><b>{cerrados}</b> finalizados</li>
        </ul>
        <Link to="/" className="barra__enlace">Inicio</Link>
      </header>

      <div className="operador__mapa">
        <MapaOperador
          reportes={visibles}
          seleccionadoId={seleccionadoId}
          centrarKey={centrarKey}
          agrupar={agrupar}
          onSeleccionar={setSeleccionadoId}
        />
      </div>

      <aside className="operador__panel">
        {seleccionado ? (
          <div className="operador__detalle">
            <DetalleReporte
              key={seleccionado.id}
              reporte={seleccionado}
              cercanos={cercanosDe(seleccionado)}
              onSeleccionar={seleccionar}
              onVolver={() => setSeleccionadoId(null)}
            />
          </div>
        ) : (
          <>
            <div className="panel__cabeza">
              <h2>Reportes <span>{visibles.length}</span></h2>
              <div className="filtros">
                <select aria-label="Filtrar por grupo" value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)}>
                  <option value="">Todos los grupos</option>
                  {GRUPOS.map((g) => <option key={g.codigo} value={g.codigo}>{g.codigo} · {g.nombre}</option>)}
                </select>
                <select aria-label="Filtrar por estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {Object.values(ESTADOS).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <label className="check check--panel">
                <input type="checkbox" checked={agrupar} onChange={(e) => setAgrupar(e.target.checked)} />
                Agrupar pines cercanos en el mapa
              </label>
            </div>

            <div className="operador__lista">
              <ListaReportes reportes={visibles} seleccionadoId={seleccionadoId} onSeleccionar={seleccionar} cercanos={(r) => cercanosDe(r).length} />
            </div>

            <footer className="panel__pie">
              <button type="button" className="btn btn--mini" onClick={() => simular(50)}>
                <Icono nombre="lista" tam={14} /> Simular 50 reportes
              </button>
              <button
                type="button"
                className="btn btn--mini btn--mini-peligro"
                onClick={() => { if (reportes.length && window.confirm('¿Borrar TODOS los reportes?')) { limpiarTodo(); setSeleccionadoId(null) } }}
                disabled={!reportes.length}
              >
                Limpiar
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

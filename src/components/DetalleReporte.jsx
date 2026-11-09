import { useState } from 'react'
import BadgeEstado from './BadgeEstado.jsx'
import EtiquetaGrupo from './EtiquetaGrupo.jsx'
import Icono from './Icono.jsx'
import Medios from './Medios.jsx'
import Seguimiento from './Seguimiento.jsx'
import { GRUPOS } from '../data/grupos.js'
import { ESTADOS, UNIDADES, MOTIVOS_DESCARTE } from '../data/estados.js'
import { enlaceGoogleMaps, formatoFechaHora, formatoHora } from '../utils/formato.js'
import { useReportes } from '../context/ReportesContext.jsx'

// Mensajes rápidos para el botón «Solicitar más información».
const PREGUNTAS = [
  '¿Hay personas atrapadas o heridas?',
  '¿En qué piso o lugar exacto está la emergencia?',
  'Si es seguro, envíe una foto o un video de lo que ve.',
  'Confirme su ubicación o un punto de referencia cercano.',
]
const OTRA = 'otra'

// Detalle del reporte seleccionado + acciones del operador:
//   Recibido → (Llamar) → Validado (puede corregir el grupo) o Descartado
//   Validado → Despachar (elige unidad) → Unidad despachada → Cerrado
export default function DetalleReporte({ reporte: r, cercanos, onSeleccionar, onVolver }) {
  const { validar, descartar, despachar, cerrar, solicitarInfo } = useReportes()
  // Estado local de los controles; se reinicia al cambiar de reporte (key en el padre).
  const [grupo, setGrupo] = useState(r.grupo)
  const [motivo, setMotivo] = useState(MOTIVOS_DESCARTE[0])
  const [unidad, setUnidad] = useState('')
  const [pregunta, setPregunta] = useState(PREGUNTAS[0])
  const [libre, setLibre] = useState('')
  const [enviado, setEnviado] = useState(false)

  const recibido = r.estado === ESTADOS.RECIBIDO
  const validado = r.estado === ESTADOS.VALIDADO
  const despachado = r.estado === ESTADOS.DESPACHADO
  const finalizado = r.estado === ESTADOS.CERRADO || r.estado === ESTADOS.DESCARTADO
  const mensaje = pregunta === OTRA ? libre.trim() : pregunta

  const pedirInfo = () => {
    solicitarInfo(r.id, mensaje)
    setLibre('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <section className="detalle" aria-label={`Detalle del reporte ${r.radicado}`}>
      <button type="button" className="detalle__volver" onClick={onVolver}>
        <Icono nombre="atras" tam={16} /> Volver a la lista
      </button>

      <header className="detalle__cabeza">
        <div>
          <span className="detalle__radicado">{r.radicado}</span>
          <span className="detalle__hora">Recibido {formatoFechaHora(r.creadoEn)}</span>
        </div>
        <BadgeEstado estado={r.estado} />
      </header>
      <Seguimiento estado={r.estado} oscuro />

      {/* ───── Datos ───── */}
      <div className="tarjeta-op">
        <h3><Icono nombre="usuario" tam={16} /> Ciudadano</h3>
        <dl className="datos">
          <dt>Nombre</dt><dd>{r.nombres} {r.apellidos}</dd>
          <dt>Teléfono</dt><dd className="datos__tel">{r.telefono}</dd>
        </dl>
        <a className="btn btn--llamar btn--completo" href={`tel:${r.telefono}`}>
          <Icono nombre="telefono" tam={18} /> Llamar a {r.nombres}
        </a>
      </div>

      <div className="tarjeta-op">
        <h3><Icono nombre="fuego" tam={16} /> Emergencia</h3>
        <dl className="datos">
          <dt>Grupo</dt>
          <dd>
            <EtiquetaGrupo codigo={r.grupo} conNombre />
            {r.grupo !== r.grupoOriginal && <small className="datos__nota"> (el ciudadano indicó {r.grupoOriginal})</small>}
          </dd>
          <dt>¿Qué ve?</dt><dd>{r.queVe}</dd>
          {r.extra300 && (<>
            <dt>Afectado</dt>
            <dd>{r.extra300.sexo}, {r.extra300.edad} años · consciente: <b>{r.extra300.consciente}</b> · respira: <b>{r.extra300.respira}</b></dd>
          </>)}
          {r.motivoDescarte && (<><dt>Motivo</dt><dd>{r.motivoDescarte}</dd></>)}
        </dl>
      </div>

      <div className="tarjeta-op">
        <h3><Icono nombre="ubicacion" tam={16} /> Ubicación</h3>
        <dl className="datos">
          <dt>Dirección</dt><dd>{r.direccion}</dd>
          <dt>Barrio</dt><dd>{r.barrio}</dd>
          <dt>Referencia</dt><dd>{r.referencia}</dd>
          <dt>Edificio</dt><dd>{r.edificio}</dd>
          <dt>Coordenadas</dt><dd>{r.lat.toFixed(5)}, {r.lng.toFixed(5)} <small className="datos__nota">{r.ubicacionExacta ? '(punto exacto)' : '(centro del barrio)'}</small></dd>
        </dl>
        <a className="btn btn--oscuro btn--completo" href={enlaceGoogleMaps(r.lat, r.lng)} target="_blank" rel="noreferrer">
          <Icono nombre="mapa" tam={18} /> Ver en Google Maps
        </a>
      </div>

      <div className="tarjeta-op">
        <h3><Icono nombre="camara" tam={16} /> Fotos y videos</h3>
        {r.fotos.length > 0
          ? <Medios medios={r.fotos} />
          : <p className="detalle__nota">{r.simulado ? 'Reporte simulado: sin archivos.' : 'El ciudadano no adjuntó fotos.'}</p>}
      </div>

      {cercanos.length > 0 && (
        <div className="cercanos" role="status">
          <strong><Icono nombre="alerta" tam={16} /> {cercanos.length} reporte{cercanos.length > 1 ? 's' : ''} activo{cercanos.length > 1 ? 's' : ''} a menos de 250 m</strong>
          <small>Podría ser el mismo incidente (duplicado):</small>
          <div>
            {cercanos.map((c) => (
              <button key={c.id} type="button" className="enlace" onClick={() => onSeleccionar(c.id)}>#{c.id} (grupo {c.grupo})</button>
            ))}
          </div>
        </div>
      )}

      {/* ───── Acciones: solo el paso actual está activo ───── */}
      <h2 className="detalle__titulo-acciones">Acciones del operador</h2>

      <div className={`accion ${recibido ? 'is-actual' : ''}`}>
        <h3><span>1</span> Contactar y validar</h3>
        <p>Llama al ciudadano y confirma el caso. Puedes corregir el grupo.</p>
        <label className="etiqueta-mini" htmlFor="grupo-validar">Grupo del caso</label>
        <select id="grupo-validar" value={grupo} disabled={!recibido} onChange={(e) => setGrupo(Number(e.target.value))}>
          {GRUPOS.map((g) => <option key={g.codigo} value={g.codigo}>{g.codigo} · {g.nombre}</option>)}
        </select>
        <div className="botones">
          <button type="button" className="btn btn--ok" disabled={!recibido} onClick={() => validar(r.id, grupo)}>
            <Icono nombre="check" tam={18} /> Validado
          </button>
          <div className="botones__descartar">
            <select aria-label="Motivo del descarte" value={motivo} disabled={!recibido} onChange={(e) => setMotivo(e.target.value)}>
              {MOTIVOS_DESCARTE.map((m) => <option key={m}>{m}</option>)}
            </select>
            <button type="button" className="btn btn--descartar" disabled={!recibido} onClick={() => descartar(r.id, motivo)}>
              <Icono nombre="cerrar" tam={18} /> Descartado
            </button>
          </div>
        </div>
      </div>

      <div className={`accion ${validado ? 'is-actual' : ''}`}>
        <h3><span>2</span> Despachar</h3>
        {recibido
          ? <p className="accion__bloqueo"><Icono nombre="candado" tam={14} /> Se activa cuando el caso está validado.</p>
          : <p>Elige la unidad que sale hacia el lugar.</p>}
        <label className="etiqueta-mini" htmlFor="unidad">Unidad</label>
        <select id="unidad" value={unidad} disabled={!validado} onChange={(e) => setUnidad(e.target.value)}>
          <option value="">Elige la unidad…</option>
          {UNIDADES.map((u) => <option key={u}>{u}</option>)}
        </select>
        <button type="button" className="btn btn--principal btn--completo" disabled={!validado || !unidad} onClick={() => despachar(r.id, unidad)}>
          <Icono nombre="camion" tam={18} /> Despachar unidad
        </button>
      </div>

      <div className={`accion ${despachado ? 'is-actual' : ''}`}>
        <h3><span>3</span> Cerrar el caso</h3>
        <p>Cuando la unidad termine la atención.</p>
        <button type="button" className="btn btn--oscuro btn--completo" disabled={!despachado} onClick={() => cerrar(r.id)}>
          <Icono nombre="check" tam={18} /> Cerrar caso
        </button>
      </div>

      {/* Extra: pedir más información al ciudadano (se ve en su pantalla) */}
      {!finalizado && (
        <div className="accion accion--info">
          <h3><Icono nombre="info" tam={16} /> Pedir más datos al ciudadano</h3>
          <p>El ciudadano verá el aviso en su pantalla. Elige una pregunta o escribe la tuya.</p>
          {r.solicitud && <small className="detalle__nota">Último aviso ({formatoHora(r.solicitud.hora)}): «{r.solicitud.mensaje}»</small>}
          <label className="etiqueta-mini" htmlFor="pregunta">Mensaje</label>
          <select id="pregunta" value={pregunta} onChange={(e) => setPregunta(e.target.value)}>
            {PREGUNTAS.map((p) => <option key={p}>{p}</option>)}
            <option value={OTRA}>Otro mensaje…</option>
          </select>
          {pregunta === OTRA && (
            <textarea rows={2} aria-label="Escribe tu mensaje" placeholder="Escribe lo que necesitas saber" value={libre} onChange={(e) => setLibre(e.target.value)} />
          )}
          <button type="button" className="btn btn--oscuro btn--completo" disabled={!mensaje} onClick={pedirInfo}>
            <Icono nombre="info" tam={18} /> Solicitar más información
          </button>
          {enviado && <small className="detalle__ok" role="status"><Icono nombre="check" tam={14} /> Aviso enviado al ciudadano</small>}
        </div>
      )}

      <h3 className="detalle__sub">Historial</h3>
      <ol className="linea-tiempo">
        {r.historial.map((h, i) => (<li key={i}><BadgeEstado estado={h.estado} /> <time>{formatoHora(h.hora)}</time></li>))}
      </ol>
    </section>
  )
}

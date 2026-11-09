import { useMemo, useState } from 'react'
import Aparece from './Aparece.jsx'
import Campo from './Campo.jsx'
import Icono from './Icono.jsx'
import SelectorGrupo from './SelectorGrupo.jsx'
import SubidorMedios from './SubidorMedios.jsx'
import RecomendacionesMedios from './RecomendacionesMedios.jsx'
import MiniMapaSelector from './MiniMapaSelector.jsx'
import { grupoDe, colorDeGrupo } from '../data/grupos.js'
import { BARRIOS } from '../data/barrios.js'
import { CAMPOS_INICIALES, ETIQUETAS, validar } from '../utils/validacion.js'
import { ubicacionDeBarrio } from '../context/ReportesContext.jsx'
import { reducirImagen } from '../utils/imagenes.js'

// Campos obligatorios (para el contador de progreso). Los de continuación del
// grupo 300 solo cuentan cuando se elige ese grupo.
const OBLIGATORIOS = ['grupo', 'queVe', 'telefono', 'direccion', 'barrio', 'referencia', 'edificio', 'nombres', 'apellidos']
const CONTINUACION_300 = ['sexo', 'edad', 'consciente', 'respira']

// Formulario controlado. Sigue el orden del interrogatorio inicial del protocolo
// de despacho: cada pregunta del radio operador es una sección con sus campos.
export default function FormularioReporte({ onEnviar }) {
  const [v, setV] = useState(CAMPOS_INICIALES)
  const [tocados, setTocados] = useState({})
  const [medios, setMedios] = useState([])
  const [punto, setPunto] = useState(null) // punto exacto del mini mapa (extra)
  const [ayuda, setAyuda] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const errores = useMemo(() => validar(v), [v])
  const requeridos = v.grupo === '300' ? [...OBLIGATORIOS, ...CONTINUACION_300] : OBLIGATORIOS
  const faltan = requeridos.filter((c) => errores[c])
  const valido = Object.keys(errores).length === 0
  const completos = requeridos.length - faltan.length
  const avance = Math.round((completos / requeridos.length) * 100)

  const cambiar = (campo) => (e) => {
    let valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (campo === 'telefono') valor = valor.replace(/\D/g, '').slice(0, 10) // solo números, máx. 10
    setTocados((t) => ({ ...t, [campo]: true })) // el mensaje de error aparece apenas se escribe o elige
    if (campo === 'barrio') setPunto(null) // otro barrio: el punto marcado ya no aplica
    setV((prev) => {
      const sig = { ...prev, [campo]: valor }
      if (campo === 'edificioNoAplica') sig.edificio = valor ? '' : prev.edificio
      return sig
    })
  }
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const err = (campo) => (tocados[campo] ? errores[campo] : undefined)
  const mostrarFaltantes = () => setTocados(Object.fromEntries(Object.keys(errores).map((c) => [c, true])))

  const enviar = async (e) => {
    e.preventDefault()
    if (!valido) return mostrarFaltantes()
    setEnviando(true)
    // Las imágenes se guardan también como copia reducida (ver utils/imagenes.js).
    const fotos = await Promise.all(
      medios.map(async (m) => (m.tipo === 'imagen' ? { ...m, url: await reducirImagen(m.url) } : m)),
    )
    const ubic = punto ?? ubicacionDeBarrio(v.barrio)
    onEnviar({
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      telefono: v.telefono,
      grupo: Number(v.grupo),
      queVe: v.queVe.trim(),
      direccion: v.direccion.trim(),
      barrio: v.barrio,
      referencia: v.referencia.trim(),
      edificio: v.edificioNoAplica ? 'No aplica' : v.edificio.trim(),
      lat: ubic.lat,
      lng: ubic.lng,
      ubicacionExacta: !!punto,
      extra300:
        v.grupo === '300'
          ? { sexo: v.sexo, edad: Number(v.edad), consciente: v.consciente, respira: v.respira }
          : null,
      fotos,
    })
  }

  const colorGrupo = v.grupo ? colorDeGrupo(Number(v.grupo)) : '#C8102E'

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      {/* ───── Pregunta 1 ───── */}
      <Aparece como="section" una className="paso" aria-labelledby="p1">
        <header className="paso__cabeza">
          <span className="paso__n">1</span>
          <div>
            <h2 id="p1">«Línea 119 Bomberos Cali, ¿cuál es su emergencia?»</h2>
            <p>Elige el grupo que más se parece a lo que ocurre y cuéntanos qué ves.</p>
          </div>
        </header>
        <SelectorGrupo valor={v.grupo} onCambiar={cambiar('grupo')} onTocar={tocar('grupo')} error={err('grupo')} />
        <Campo id="queVe" etiqueta="¿Qué ve?" error={err('queVe')} ayuda="Describe lo que está pasando, con el mayor detalle posible.">
          {(p) => <textarea {...p} rows={3} value={v.queVe} onChange={cambiar('queVe')} onBlur={tocar('queVe')} />}
        </Campo>

        {v.grupo === '300' && (
          <div className="continuacion" role="group" aria-labelledby="cont300">
            <h3 id="cont300">
              <Icono nombre="info" tam={18} /> Preguntas de continuación del grupo {v.grupo} · {grupoDe(300).nombre}
            </h3>
            <p>Sobre la persona afectada. Si no estás seguro, elige «No sé».</p>
            <div className="fila fila--4">
              <Campo id="sexo" etiqueta="Sexo" error={err('sexo')}>
                {(p) => (
                  <select {...p} value={v.sexo} onChange={cambiar('sexo')} onBlur={tocar('sexo')}>
                    <option value="">Elige…</option><option>Mujer</option><option>Hombre</option><option>No sé</option>
                  </select>
                )}
              </Campo>
              <Campo id="edad" etiqueta="Edad (años)" error={err('edad')}>
                {(p) => <input {...p} type="number" inputMode="numeric" min="0" max="120" value={v.edad} onChange={cambiar('edad')} onBlur={tocar('edad')} />}
              </Campo>
              <Campo id="consciente" etiqueta="¿Está consciente?" error={err('consciente')}>
                {(p) => (
                  <select {...p} value={v.consciente} onChange={cambiar('consciente')} onBlur={tocar('consciente')}>
                    <option value="">Elige…</option><option>Sí</option><option>No</option><option>No sé</option>
                  </select>
                )}
              </Campo>
              <Campo id="respira" etiqueta="¿Respira?" error={err('respira')}>
                {(p) => (
                  <select {...p} value={v.respira} onChange={cambiar('respira')} onBlur={tocar('respira')}>
                    <option value="">Elige…</option><option>Sí</option><option>No</option><option>No sé</option>
                  </select>
                )}
              </Campo>
            </div>
          </div>
        )}
      </Aparece>

      {/* ───── Pregunta 2 ───── */}
      <Aparece como="section" una className="paso" aria-labelledby="p2">
        <header className="paso__cabeza">
          <span className="paso__n">2</span>
          <div>
            <h2 id="p2">«¿De qué número me llama?»</h2>
            <p>La central te llamará a este número para confirmar el reporte.</p>
          </div>
        </header>
        <Campo id="telefono" etiqueta="Teléfono" error={err('telefono')} ayuda="10 dígitos, solo números (ej. 3001234567).">
          {(p) => (
            <input {...p} type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="3001234567"
              value={v.telefono} onChange={cambiar('telefono')} onBlur={tocar('telefono')} />
          )}
        </Campo>
      </Aparece>

      {/* ───── Pregunta 3 ───── */}
      <Aparece como="section" una className="paso" aria-labelledby="p3">
        <header className="paso__cabeza">
          <span className="paso__n">3</span>
          <div>
            <h2 id="p3">«¿Dónde es su emergencia?»</h2>
            <p>Mientras más exacta la ubicación, más rápido llega la unidad.</p>
          </div>
        </header>
        <div className="fila">
          <Campo id="direccion" etiqueta="Dirección" error={err('direccion')}>
            {(p) => <input {...p} type="text" autoComplete="street-address" placeholder="Calle 5 # 38-20" value={v.direccion} onChange={cambiar('direccion')} onBlur={tocar('direccion')} />}
          </Campo>
          <Campo id="barrio" etiqueta="Barrio" error={err('barrio')}>
            {(p) => (
              <select {...p} value={v.barrio} onChange={cambiar('barrio')} onBlur={tocar('barrio')}>
                <option value="">Elige el barrio…</option>
                {BARRIOS.map((b) => <option key={b.nombre} value={b.nombre}>{b.nombre}</option>)}
              </select>
            )}
          </Campo>
        </div>
        <div className="fila">
          <Campo id="referencia" etiqueta="Punto de referencia" error={err('referencia')}>
            {(p) => <input {...p} type="text" placeholder="Frente al parque, junto a la droguería…" value={v.referencia} onChange={cambiar('referencia')} onBlur={tocar('referencia')} />}
          </Campo>
          <div>
            <Campo id="edificio" etiqueta="Nombre del edificio" error={err('edificio')}>
              {(p) => (
                <input {...p} type="text" disabled={v.edificioNoAplica}
                  placeholder={v.edificioNoAplica ? 'No aplica' : 'Edificio o conjunto'}
                  value={v.edificio} onChange={cambiar('edificio')} onBlur={tocar('edificio')} />
              )}
            </Campo>
            <label className="check">
              <input type="checkbox" checked={v.edificioNoAplica} onChange={cambiar('edificioNoAplica')} /> No aplica
            </label>
          </div>
        </div>
        <MiniMapaSelector barrio={v.barrio} punto={punto} onElegir={setPunto} color={colorGrupo} />
      </Aparece>

      {/* ───── Pregunta 4 ───── */}
      <Aparece como="section" una className="paso" aria-labelledby="p4">
        <header className="paso__cabeza">
          <span className="paso__n">4</span>
          <div>
            <h2 id="p4">«¿Cuál es su nombre?»</h2>
            <p>Para saber con quién habla el radio operador.</p>
          </div>
        </header>
        <div className="fila">
          <Campo id="nombres" etiqueta="Nombres" error={err('nombres')}>
            {(p) => <input {...p} type="text" autoComplete="given-name" value={v.nombres} onChange={cambiar('nombres')} onBlur={tocar('nombres')} />}
          </Campo>
          <Campo id="apellidos" etiqueta="Apellidos" error={err('apellidos')}>
            {(p) => <input {...p} type="text" autoComplete="family-name" value={v.apellidos} onChange={cambiar('apellidos')} onBlur={tocar('apellidos')} />}
          </Campo>
        </div>
      </Aparece>

      <SubidorMedios medios={medios} onCambiar={setMedios} onAbrirAyuda={() => setAyuda(true)} />
      <RecomendacionesMedios abierta={ayuda} onCerrar={() => setAyuda(false)} />

      {/* Barra de envío fija: siempre se ve cuánto falta */}
      <div className="barra-envio">
        <div className="barra-envio__progreso">
          <div className="barra-envio__texto">
            {valido ? (
              <strong><Icono nombre="check" tam={16} /> Todo listo para enviar</strong>
            ) : (
              <>
                <strong>{completos} de {requeridos.length} campos obligatorios</strong>
                <span>
                  Falta: {faltan.map((c) => ETIQUETAS[c]).join(', ')}.{' '}
                  <button type="button" className="enlace" onClick={mostrarFaltantes}>Marcar los campos que faltan</button>
                </span>
              </>
            )}
          </div>
          <div className="barra-envio__riel" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={avance} aria-label="Avance del formulario">
            <div style={{ width: `${avance}%` }} />
          </div>
        </div>
        <button type="submit" className="btn btn--principal btn--grande" disabled={!valido || enviando}>
          <Icono nombre="enviar" tam={18} />
          {enviando ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>
    </form>
  )
}

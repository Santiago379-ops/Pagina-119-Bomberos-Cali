import BadgeEstado from './BadgeEstado.jsx'
import EtiquetaGrupo from './EtiquetaGrupo.jsx'
import Icono from './Icono.jsx'
import Medios from './Medios.jsx'
import Seguimiento from './Seguimiento.jsx'
import { ESTADOS, MENSAJE_ESTADO } from '../data/estados.js'
import { formatoFechaHora, formatoHora } from '../utils/formato.js'

// Respuesta automática: radicado, hora y estado. Como lee el reporte del
// estado global, el estado cambia solo cuando el operador lo actualiza.
export default function Confirmacion({ reporte, onNuevo, onResponder }) {
  const activo = reporte.estado !== ESTADOS.CERRADO && reporte.estado !== ESTADOS.DESCARTADO

  return (
    <section className="confirmacion" aria-live="polite">
      {/* Aviso del operador: lo primero que se ve si pidió más información */}
      {reporte.solicitud && activo && (
        <div className="aviso-operador" role="alert">
          <Icono nombre="alerta" tam={26} />
          <div>
            <strong>El radio operador solicita más información</strong>
            <p>«{reporte.solicitud.mensaje}»</p>
            <small>Enviado a las {formatoHora(reporte.solicitud.hora)}, contesta la llamada de la central o sigue la indicación.</small>
          </div>
          <button type="button" className="btn btn--oscuro btn--mini" onClick={() => onResponder(reporte.id)}>Entendido</button>
        </div>
      )}

      <header className="confirmacion__cabeza">
        <span className="confirmacion__icono"><Icono nombre="check" tam={30} /></span>
        <div>
          <h2>Reporte recibido</h2>
          <p>Esta es tu respuesta automática. Guarda tu número de radicado.</p>
        </div>
      </header>

      <div className="confirmacion__radicado-caja">
        <span>Número de radicado</span>
        <strong className="confirmacion__radicado">{reporte.radicado}</strong>
      </div>

      <Seguimiento estado={reporte.estado} />
      <p className={`confirmacion__mensaje ${activo ? '' : 'is-fin'}`}>{MENSAJE_ESTADO[reporte.estado]}</p>

      <dl className="confirmacion__datos">
        <div><dt>Hora de recepción</dt><dd>{formatoFechaHora(reporte.creadoEn)}</dd></div>
        <div><dt>Estado actual</dt><dd><BadgeEstado estado={reporte.estado} />{reporte.unidad && <span> · {reporte.unidad}</span>}</dd></div>
        <div><dt>Grupo</dt><dd><EtiquetaGrupo codigo={reporte.grupo} conNombre /></dd></div>
        <div><dt>Lugar</dt><dd>{reporte.direccion}, {reporte.barrio}</dd></div>
      </dl>

      {reporte.fotos.length > 0 && (<><h3>Tus archivos</h3><Medios medios={reporte.fotos} /></>)}

      <button type="button" className="btn btn--oscuro" onClick={onNuevo}>Hacer otro reporte</button>
    </section>
  )
}

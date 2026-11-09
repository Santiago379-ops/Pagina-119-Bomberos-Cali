import { Link } from 'react-router-dom'
import Aparece, { TituloMascara } from '../components/Aparece.jsx'
import Icono from '../components/Icono.jsx'
import Logo from '../components/Logo.jsx'
import FormularioReporte from '../components/FormularioReporte.jsx'
import Confirmacion from '../components/Confirmacion.jsx'
import { useReportes } from '../context/ReportesContext.jsx'

// Pantalla 2 · /reportar. Si ya hay un reporte enviado, muestra la respuesta
// automática (con el estado en vivo); si no, el formulario.
export default function Reportar() {
  const { reportes, ultimoId, crearReporte, nuevoReporte, limpiarSolicitud } = useReportes()
  const reporte = reportes.find((r) => r.id === ultimoId)

  return (
    <div className="pagina-ciudadano">
      <header className="barra">
        <Logo claro />
        <Link to="/" className="barra__enlace"><Icono nombre="atras" tam={16} /> Volver al inicio</Link>
      </header>
      <main className="contenedor">
        {reporte ? (
          <Confirmacion reporte={reporte} onNuevo={nuevoReporte} onResponder={limpiarSolicitud} />
        ) : (
          <>
            <div className="contenedor__titulo">
              <TituloMascara como="h1" una lineas={['Reportar una', 'emergencia']} />
              <Aparece como="p" una className="lema lema--ancho" retraso={250}>
                Responde lo mismo que te preguntaría el radio operador en la línea 119
              </Aparece>
              <p className="alerta-119">
                <Icono nombre="telefono" tam={18} />
                Si hay peligro inmediato para la vida, llama al <a href="tel:119">119</a>.
              </p>
            </div>
            <FormularioReporte onEnviar={crearReporte} />
          </>
        )}
      </main>
    </div>
  )
}

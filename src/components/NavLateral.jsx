import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icono from './Icono.jsx'

// Menú lateral fijo (derecha alineada, en mayúsculas condensadas). El enlace de la
// sección que se está viendo se resalta; el botón redondo lo abre y lo cierra.
export default function NavLateral({ activo, enlaces }) {
  const [abierto, setAbierto] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1100 : true))

  // Al pasar a pantallas pequeñas el menú empieza cerrado
  useEffect(() => {
    const alCambiar = () => { if (window.innerWidth < 1100) setAbierto(false) }
    window.addEventListener('resize', alCambiar)
    return () => window.removeEventListener('resize', alCambiar)
  }, [])

  const alElegir = () => { if (window.innerWidth < 1100) setAbierto(false) }

  return (
    <>
      <button
        type="button"
        className="boton-menu"
        aria-expanded={abierto}
        aria-controls="menu-lateral"
        aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
        onClick={() => setAbierto((a) => !a)}
      >
        {abierto ? <Icono nombre="cerrar" tam={22} /> : <Icono nombre="lista" tam={22} />}
      </button>
      <nav id="menu-lateral" className={`nav-lateral ${abierto ? 'is-abierto' : ''}`} aria-label="Secciones de la página">
        <ul>
          {enlaces.map(([id, texto]) => (
            <li key={id}>
              <a href={`#${id}`} className={activo === id ? 'is-activo' : ''} aria-current={activo === id ? 'true' : undefined} onClick={alElegir}>
                {texto}
              </a>
            </li>
          ))}
          <li><Link to="/reportar" onClick={alElegir}>Reportar emergencia</Link></li>
          <li><a href="tel:119">Llamar al 119</a></li>
        </ul>
      </nav>
    </>
  )
}

// Sello de la marca arriba a la derecha (diseño propio de Bomberos Cali · Línea 119).
export function SelloLogo() {
  return (
    <Link to="/" className="sello" aria-label="Bomberos Cali, Línea 119: ir al inicio">
      <span className="sello__texto">Bomberos<br />Cali<br />Línea 119</span>
      <span className="sello__lineas" aria-hidden="true"><i /><i /><i /></span>
    </Link>
  )
}

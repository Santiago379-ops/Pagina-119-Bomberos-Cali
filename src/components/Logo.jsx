import { Link } from 'react-router-dom'

// Identidad de Bomberos Cali / Línea 119 (logo propio hecho con SVG).
export default function Logo({ claro = false }) {
  return (
    <Link to="/" className={`logo ${claro ? 'logo--claro' : ''}`} aria-label="Bomberos Cali, Línea 119: ir al inicio">
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#C8102E" />
        <path d="M16 5c.9 4.200 6.500 6.800 6.500 12.500a6.500 6.500 0 0 1-13 0c0-3 1.600-5 3.100-6.400.3 1.900 1.200 2.800 2.200 3.200C14.500 11 14.700 7.600 16 5z" fill="#fff" />
        <path d="M16 16.500c.6 2.200 2.800 3.300 2.800 5.600a2.800 2.800 0 0 1-5.600 0c0-1.600 1.200-2.300 1.700-3.400.4.700.9.800 1.100-.2z" fill="#FFC72C" />
      </svg>
      <span className="logo__texto">
        <strong>Bomberos Cali</strong>
        <small>Línea 119</small>
      </span>
    </Link>
  )
}

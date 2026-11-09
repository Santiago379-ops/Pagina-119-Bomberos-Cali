// Íconos de línea (SVG propio) para reemplazar los emojis de la primera versión.
const FORMAS = {
  telefono: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  sirena: <><path d="M7 18v-6a5 5 0 0 1 10 0v6" /><path d="M5 18h14v3H5z" /><path d="M12 3v2M4.500 6.500 6 8M19.500 6.500 18 8" /></>,
  camara: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.500" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
  ubicacion: <><path d="M12 21s7-6.200 7-11a7 7 0 1 0-14 0c0 4.800 7 11 7 11z" /><circle cx="12" cy="10" r="2.500" /></>,
  mapa: <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />,
  check: <path d="m4 12.500 5 5L20 6.500" />,
  alerta: <><path d="M12 3 22 21H2z" /><path d="M12 10v5M12 18h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  enviar: <path d="m4 12 16-8-6 16-3-7z" />,
  usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  candado: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  atras: <path d="m15 5-7 7 7 7" />,
  edificio: <path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M4 21h16" />,
  lista: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  gota: <path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z" />,
  fuego: <path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 .5 1.500 1.500 2 2 2 0-2-.5-4 1-7z" />,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  camion: <><path d="M2 16V6h11v10M13 9h4l4 4v3" /><circle cx="7" cy="17.500" r="2" /><circle cx="17" cy="17.500" r="2" /></>,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
}

export default function Icono({ nombre, tam = 20, className = '', ...resto }) {
  return (
    <svg
      className={`icono-svg ${className}`}
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {FORMAS[nombre]}
    </svg>
  )
}

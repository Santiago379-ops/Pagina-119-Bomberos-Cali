// Muestra fotos o videos de un reporte (URL de objectURL, solo en memoria).
export default function Medios({ medios = [], onQuitar }) {
  if (!medios.length) return null
  return (
    <ul className="medios">
      {medios.map((m) => (
        <li key={m.id} className="medios__item">
          {m.tipo === 'video' ? (
            <video src={m.url} controls muted preload="metadata" />
          ) : (
            <a href={m.url} target="_blank" rel="noreferrer" title={m.nombre}>
              <img src={m.url} alt={`Foto: ${m.nombre}`} />
            </a>
          )}
          {onQuitar && (
            <button type="button" className="medios__quitar" onClick={() => onQuitar(m.id)} aria-label={`Quitar ${m.nombre}`}>
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

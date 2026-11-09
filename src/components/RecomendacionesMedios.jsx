import Icono from './Icono.jsx'

// Extra: ventana flotante con recomendaciones para tomar fotos y videos.
export default function RecomendacionesMedios({ abierta, onCerrar }) {
  if (!abierta) return null
  return (
    <div className="flotante" role="dialog" aria-label="Recomendaciones para fotos y videos">
      <div className="flotante__cabeza">
        <strong><Icono nombre="camara" tam={18} /> Cómo tomar fotos y videos útiles</strong>
        <button type="button" onClick={onCerrar} aria-label="Cerrar recomendaciones"><Icono nombre="cerrar" tam={18} /></button>
      </div>
      <ul>
        <li><strong>Tu seguridad primero:</strong> no te acerques al fuego, al humo, al gas ni a cables caídos.</li>
        <li>Toma una <strong>foto general</strong> que muestre el lugar y otra más cercana de lo que ocurre.</li>
        <li>Si grabas, hazlo en <strong>horizontal</strong>, de 10 a 20 segundos y sin moverte demasiado.</li>
        <li>Incluye <strong>puntos de referencia</strong>: letreros, número de la puerta, fachada del edificio.</li>
        <li>No pongas a nadie en riesgo para obtener la imagen.</li>
      </ul>
    </div>
  )
}

import { useState } from 'react'
import Aparece from './Aparece.jsx'
import Icono from './Icono.jsx'
import Medios from './Medios.jsx'

const MAX = 3

// Hasta 3 fotos (extra: también videos) con miniaturas. Se previsualizan con
// URL.createObjectURL y NO se suben a ningún servidor.
export default function SubidorMedios({ medios, onCambiar, onAbrirAyuda }) {
  const [aviso, setAviso] = useState('')

  const agregar = (e) => {
    const nuevos = []
    let rechazados = 0
    for (const f of Array.from(e.target.files)) {
      const tipo = f.type.startsWith('image/') ? 'imagen' : f.type.startsWith('video/') ? 'video' : null
      if (!tipo) { rechazados++; continue }
      if (medios.length + nuevos.length >= MAX) { rechazados++; continue }
      nuevos.push({ id: crypto.randomUUID(), url: URL.createObjectURL(f), tipo, nombre: f.name })
    }
    onCambiar([...medios, ...nuevos])
    setAviso(rechazados ? `Solo puedes adjuntar hasta ${MAX} archivos (fotos o videos). Se omitieron ${rechazados}.` : '')
    e.target.value = '' // permite volver a elegir el mismo archivo
  }

  const quitar = (id) => {
    const m = medios.find((x) => x.id === id)
    if (m) URL.revokeObjectURL(m.url)
    onCambiar(medios.filter((x) => x.id !== id))
    setAviso('')
  }

  return (
    <Aparece como="section" una className="paso" aria-labelledby="p5">
      <header className="paso__cabeza">
        <span className="paso__n paso__n--opcional"><Icono nombre="camara" tam={18} /></span>
        <div>
          <h2 id="p5">Fotos o videos <small>(opcional)</small></h2>
          <p>
            Una imagen responde de inmediato muchas preguntas. Puedes adjuntar hasta {MAX}.{' '}
            <button type="button" className="enlace" onClick={onAbrirAyuda}>¿Cómo tomarlos bien?</button>
          </p>
        </div>
      </header>
      <input id="medios" type="file" multiple accept="image/*,video/*" onChange={agregar} disabled={medios.length >= MAX} className="sr-only" />
      <label htmlFor="medios" className={`subir ${medios.length >= MAX ? 'subir--lleno' : ''}`}>
        <Icono nombre="camara" tam={22} />
        <span>
          <strong>Agregar fotos o videos</strong>
          <small>{medios.length} de {MAX} adjuntos</small>
        </span>
      </label>
      {aviso && <small className="campo__error" role="alert">{aviso}</small>}
      <Medios medios={medios} onQuitar={quitar} />
    </Aparece>
  )
}

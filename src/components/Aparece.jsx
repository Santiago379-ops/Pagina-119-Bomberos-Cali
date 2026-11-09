import { useEffect, useRef, useState } from 'react'
import { reducirMovimiento } from '../utils/scroll.js'

// Revela su contenido al entrar en pantalla. Por defecto se repite: al
// salir de la pantalla vuelve a ocultarse, así la animación ocurre tanto
// al bajar como al subir. Con `una` solo se anima la primera vez.
//   variante: 'sube' | 'izq' | 'der' | 'mascara' | 'trazo'
export default function Aparece({ como: Etiqueta = 'div', variante = 'sube', retraso = 0, una = false, className = '', style, children, ...resto }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reducirMovimiento()) { setVisible(true); return undefined }
    const io = new IntersectionObserver(
      ([e]) => setVisible((prev) => (e.isIntersecting ? true : una ? prev : false)),
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [una])

  return (
    <Etiqueta
      ref={ref}
      className={`aparece aparece--${variante} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--retraso': `${retraso}ms`, ...style }}
      {...resto}
    >
      {children}
    </Etiqueta>
  )
}

// Titular que se revela línea por línea, subiendo desde una máscara.
export function TituloMascara({ como = 'h2', lineas, className = '', ...resto }) {
  return (
    <Aparece como={como} variante="mascara" className={`titulo-mascara ${className}`} aria-label={lineas.join(' ')} {...resto}>
      {lineas.map((l, i) => (
        <span className="mascara" key={i} aria-hidden="true">
          <span className="mascara__linea" style={{ '--i': i }}>{l}</span>
        </span>
      ))}
    </Aparece>
  )
}

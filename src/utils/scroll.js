import { useEffect, useRef, useState } from 'react'

// ───────────────────────────────────────────────────────────────
// Utilidades de animación con scroll. Todas respetan
// «prefers-reduced-motion» y funcionan al bajar Y al subir.
// ───────────────────────────────────────────────────────────────
const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const suavizar = (t) => { const x = limitar(t); return x * x * (3 - 2 * x) }
export const reducirMovimiento = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Escribe en <html> dos variables CSS que usan los estilos:
//   --scroll : avance de toda la página (0 – 1)     → barra de progreso
//   --hero   : avance de la primera pantalla (0 – 1) → parallax del héroe
// y devuelve un ref con el valor de --hero para la escena 3D del globo.
export function useScrollGlobal() {
  const hero = useRef(0)
  useEffect(() => {
    const raiz = document.documentElement
    let raf = 0
    const actualizar = () => {
      raf = 0
      const y = window.scrollY
      const max = raiz.scrollHeight - window.innerHeight
      hero.current = limitar(y / window.innerHeight)
      raiz.style.setProperty('--scroll', max > 0 ? (y / max).toFixed(4) : '0')
      raiz.style.setProperty('--hero', reducirMovimiento() ? '0' : hero.current.toFixed(4))
    }
    const alScroll = () => { if (!raf) raf = requestAnimationFrame(actualizar) }
    actualizar()
    window.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => {
      window.removeEventListener('scroll', alScroll)
      window.removeEventListener('resize', alScroll)
      cancelAnimationFrame(raf)
      raiz.style.removeProperty('--scroll')
      raiz.style.removeProperty('--hero')
    }
  }, [])
  return hero
}

// Sección «pegajosa» (sticky) alta: devuelve el progreso 0 – 1 mientras se
// recorre, y en qué paso (0 … n-1) va. Escribe también --p en el elemento.
export function useProgresoSticky(ref, pasos = 1) {
  const progreso = useRef(0)
  const [paso, setPaso] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    const actualizar = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? limitar(-r.top / total) : 0
      progreso.current = p
      el.style.setProperty('--p', p.toFixed(4))
      setPaso((prev) => { const i = Math.min(pasos - 1, Math.floor(p * pasos)); return prev === i ? prev : i })
    }
    const alScroll = () => { if (!raf) raf = requestAnimationFrame(actualizar) }
    actualizar()
    window.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => { window.removeEventListener('scroll', alScroll); window.removeEventListener('resize', alScroll); cancelAnimationFrame(raf) }
  }, [ref, pasos])
  return [progreso, paso]
}

// Elemento normal que se «dibuja» mientras cruza la pantalla: --p (0 – 1) y
// cuántos pasos de `pasos` ya se alcanzaron (la ruta «Cómo funciona»).
export function useProgresoVisible(ref, pasos = 1) {
  const [alcanzados, setAlcanzados] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    const actualizar = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = limitar((window.innerHeight * 0.82 - r.top) / (r.height + window.innerHeight * 0.1))
      el.style.setProperty('--p', p.toFixed(4))
      const n = Math.min(pasos, Math.floor(p * (pasos + 0.6)))
      setAlcanzados((prev) => (prev === n ? prev : n))
    }
    const alScroll = () => { if (!raf) raf = requestAnimationFrame(actualizar) }
    actualizar()
    window.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => { window.removeEventListener('scroll', alScroll); window.removeEventListener('resize', alScroll); cancelAnimationFrame(raf) }
  }, [ref, pasos])
  return alcanzados
}

// Qué sección está en el centro de la pantalla (menú lateral).
export function useScrollspy(ids) {
  const [activo, setActivo] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setActivo(e.target.id)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return activo
}

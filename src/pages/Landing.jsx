import { useRef } from 'react'
import { Link } from 'react-router-dom'
import EscenaLanding from '../three/EscenaLanding.jsx'
import GloboParticulas from '../three/GloboParticulas.jsx'
import Aparece, { TituloMascara } from '../components/Aparece.jsx'
import BadgeEstado from '../components/BadgeEstado.jsx'
import Icono from '../components/Icono.jsx'
import Logo from '../components/Logo.jsx'
import NavLateral, { SelloLogo } from '../components/NavLateral.jsx'
import { GRUPOS } from '../data/grupos.js'
import { ESTADOS } from '../data/estados.js'
import { useProgresoSticky, useProgresoVisible, useScrollGlobal, useScrollspy } from '../utils/scroll.js'

const SECCIONES = [
  ['inicio', 'Inicio'],
  ['historia', 'Así responde la central'],
  ['grupos', 'Tipos de emergencia'],
  ['como-funciona', 'Cómo funciona'],
  ['reportar', 'Reportar'],
]

// La historia del camión avanza con el scroll: cada paso es un estado real del reporte.
const BEATS = [
  { estado: ESTADOS.RECIBIDO, titulo: 'Llega un reporte', texto: 'Una persona avisa del incendio y comparte dónde está y una foto. En el mapa de la central aparece un punto.' },
  { estado: ESTADOS.DESPACHADO, titulo: 'Sale la unidad', texto: 'El radio operador valida el caso y despacha una máquina. La pantalla del ciudadano cambia de estado al instante.' },
  { estado: ESTADOS.CERRADO, titulo: 'Incendio controlado', texto: 'La unidad termina la atención y el caso se cierra. Sube de nuevo para volver a ver cómo empezó.' },
]

const BENEFICIOS = [
  ['ubicacion', 'La central ve dónde estás', 'Tu reporte aparece como un punto en el mapa del radio operador.'],
  ['camara', 'Una foto responde más que mil preguntas', 'Adjunta hasta 3 fotos o videos de lo que está pasando.'],
  ['check', 'Sabes que tu reporte llegó', 'Recibes un número de radicado y ves cómo avanza el caso.'],
]

const PASOS = [
  ['Reporta', 'Cuéntanos qué ves, dónde es y quién eres.'],
  ['Recibe tu radicado', 'Al enviar, ves el número y la hora de tu reporte.'],
  ['La central valida', 'Un radio operador revisa el reporte y puede llamarte.'],
  ['Sale la unidad', 'Tu pantalla cambia de estado cuando se despacha.'],
]

export default function Landing() {
  const heroProgreso = useScrollGlobal() // escribe --scroll y --hero en <html>
  const activo = useScrollspy(SECCIONES.map(([id]) => id))

  const historiaRef = useRef(null)
  const [historiaProgreso, beat] = useProgresoSticky(historiaRef, BEATS.length)

  const rutaRef = useRef(null)
  const pasosAlcanzados = useProgresoVisible(rutaRef, PASOS.length)

  return (
    <div className="landing">
      <div className="progreso-scroll" aria-hidden="true" />
      <NavLateral activo={activo} enlaces={SECCIONES} />
      <SelloLogo />

      <main>
        {/* ───────── Inicio: globo de partículas + titular gigante ───────── */}
        <section className="hero2" id="inicio" aria-labelledby="titulo-hero">
          <div className="hero2__globo" aria-hidden="true"><GloboParticulas scrollRef={heroProgreso} /></div>
          <div className="hero2__vineta" aria-hidden="true" />
          <div className="hero2__contenido">
            <h1 id="titulo-hero" className="titulo-gigante" aria-label="¿Tienes una emergencia?">
              <span aria-hidden="true" className="gigante__linea" style={{ '--i': 0 }}>¿Tienes </span>
              <span aria-hidden="true" className="gigante__linea" style={{ '--i': 1 }}>una </span>
              <span aria-hidden="true" className="gigante__linea" style={{ '--i': 2 }}>emergencia?</span>
            </h1>
            <p className="lema">Línea 119 de Bomberos Cali</p>
            <p className="hero2__sub">
              Reporta también desde la web: dinos dónde estás y qué ves, adjunta fotos, y la central lo recibe de inmediato.
            </p>
            <div className="hero2__botones">
              <Link to="/reportar" className="btn btn--principal btn--grande">
                <Icono nombre="sirena" tam={22} /> Reportar emergencia
              </Link>
              <a href="tel:119" className="btn btn--contorno btn--grande">
                <Icono nombre="telefono" tam={22} /> Llamar al 119
              </a>
            </div>
            <p className="hero2__aviso">Si hay riesgo inmediato para la vida, llama: es la vía más rápida.</p>
          </div>
          <a className="hero2__bajar" href="#historia" aria-label="Bajar a la siguiente sección"><span>Desplázate</span><i aria-hidden="true" /></a>
        </section>

        {/* ───────── Historia del camión, ligada al scroll ───────── */}
        <section className="historia" id="historia" ref={historiaRef} aria-label="Así responde la central">
          <div className="historia__marco">
            <div className="historia__escena"><EscenaLanding progresoRef={historiaProgreso} className="escena--historia" /></div>
            <div className="historia__texto">
              {BEATS.map((b, i) => (
                <article key={b.titulo} className={`beat ${i === beat ? 'is-activo' : i < beat ? 'is-pasado' : ''}`} aria-hidden={i !== beat}>
                  <BadgeEstado estado={b.estado} />
                  <h2>{b.titulo}</h2>
                  <p>{b.texto}</p>
                </article>
              ))}
              <ol className="historia__pasos" aria-label="Avance de la historia">
                {BEATS.map((b, i) => (
                  <li key={b.titulo} className={i <= beat ? 'is-hecho' : ''} style={{ '--i': i }}><span /></li>
                ))}
              </ol>
            </div>
            <p className="historia__pista">Desliza hacia abajo para apagar el fuego · hacia arriba para volver</p>
          </div>
        </section>

        {/* ───────── Beneficios ───────── */}
        <section className="beneficios" aria-label="Qué ofrece el canal digital">
          <ul>
            {BENEFICIOS.map(([icono, titulo, texto], i) => (
              <Aparece como="li" key={titulo} variante="sube" retraso={i * 120}>
                <span className="beneficios__icono"><Icono nombre={icono} tam={24} /></span>
                <div><strong>{titulo}</strong><p>{texto}</p></div>
              </Aparece>
            ))}
          </ul>
        </section>

        {/* ───────── Los siete grupos ───────── */}
        <section className="seccion" id="grupos" aria-labelledby="titulo-grupos">
          <TituloMascara id="titulo-grupos" lineas={['¿Qué tipo', 'de emergencia es?']} />
          <Aparece como="p" className="seccion__sub" retraso={200}>
            La central clasifica cada reporte en uno de estos siete grupos del protocolo de despacho.
          </Aparece>
          <ul className="placas">
            {GRUPOS.map((g, i) => (
              <Aparece como="li" key={g.codigo} variante={i % 2 ? 'der' : 'izq'} retraso={(i % 4) * 70} className="placa" style={{ '--c': g.color }}>
                <span className="placa__codigo">{g.codigo}</span>
                <div className="placa__texto">
                  <h3>{g.nombre}</h3>
                  <p>{g.ejemplos}</p>
                </div>
              </Aparece>
            ))}
          </ul>
        </section>

        {/* ───────── Cómo funciona: la línea se dibuja con el scroll ───────── */}
        <section className="seccion seccion--pasos" id="como-funciona" aria-labelledby="titulo-pasos">
          <TituloMascara id="titulo-pasos" lineas={['Cómo', 'funciona']} />
          <ol className="ruta" ref={rutaRef}>
            <span className="ruta__riel" aria-hidden="true"><span className="ruta__relleno" /></span>
            {PASOS.map(([titulo, texto], i) => (
              <li key={titulo} className={i < pasosAlcanzados ? 'is-alcanzado' : ''}>
                <span className="ruta__n">{i + 1}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ───────── Llamado final ───────── */}
        <section className="cierre" id="reportar" aria-labelledby="titulo-cierre">
          <TituloMascara como="h2" id="titulo-cierre" className="cierre__titulo" lineas={['Si lo ves,', 'repórtalo.']} />
          <Aparece className="cierre__acciones" retraso={250}>
            <Link to="/reportar" className="btn btn--principal btn--grande">
              <Icono nombre="sirena" tam={22} /> Reportar emergencia
            </Link>
            <a href="tel:119" className="btn btn--contorno btn--grande">
              <Icono nombre="telefono" tam={22} /> Llamar al 119
            </a>
          </Aparece>
        </section>
      </main>

      <footer className="pie">
        <Logo claro />
        <p>Prototipo académico con datos ficticios. En una emergencia real, llama al 119.</p>
        <Link to="/operador">Acceso radio operador</Link>
      </footer>
    </div>
  )
}

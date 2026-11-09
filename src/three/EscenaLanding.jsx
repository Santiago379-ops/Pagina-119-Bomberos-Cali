import { Component, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { colorDeGrupo } from '../data/grupos.js'
import { suavizar } from '../utils/scroll.js'

// Escena 3D de la landing: un camión de bomberos apaga con su manguera una casa en llamas.
// Todo está hecho con geometrías básicas (sin modelos externos, así no hay licencias que citar).
//   · useFrame: el agua es un sistema de partículas con gravedad que sale de la boquilla,
//     el fuego parpadea, las ruedas giran y las sirenas alternan rojo/azul.
//   · Mouse: al pasar el puntero por la escena sube la presión del agua (más chorro),
//     el fuego se achica y las sirenas se aceleran; al hacer clic se sube o baja la escalera.
// Los colores del fuego y de las sirenas son los de los grupos 100 (rojo) y 300 (azul).

const ROJO = colorDeGrupo(100)
const AZUL = colorDeGrupo(300)
const AGUA = '#8fd3ff'

// Posiciones clave (el camión mira hacia +z; el incendio está hacia +x)
const BOQUILLA = new THREE.Vector3(2.2, 0.38, 0.2) // base de la boquilla sobre el trípode
const ANGULO = 0.5 // inclinación de la boquilla (rad)
const LARGO_BOQUILLA = 0.36
const PUNTA = new THREE.Vector3(
  BOQUILLA.x + Math.cos(ANGULO) * LARGO_BOQUILLA,
  BOQUILLA.y + Math.sin(ANGULO) * LARGO_BOQUILLA,
  BOQUILLA.z,
)
const X_CASA = 4.3 // cara frontal de la casa: el agua "pega" aquí
const V_AGUA = 5.0 // velocidad inicial del chorro (calculada para llegar a la casa)
const N_GOTAS = 260

// ─────────────── Agua: partículas con gravedad ───────────────
function Chorro({ caudal }) {
  const malla = useRef()
  const d = useMemo(() => new THREE.Object3D(), [])
  const est = useMemo(
    () => ({
      p: new Float32Array(N_GOTAS * 3),
      v: new Float32Array(N_GOTAS * 3),
      edad: Float32Array.from({ length: N_GOTAS }, () => -Math.random() * 1.2),
      vivo: new Uint8Array(N_GOTAS),
      tam: Float32Array.from({ length: N_GOTAS }, () => 0.7 + Math.random() * 0.8),
      frac: 0.55,
    }),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    // El caudal (0 – 1) decide cuántas gotas están activas
    est.frac += (caudal.current - est.frac) * Math.min(1, dt * 3)
    const activas = Math.floor(N_GOTAS * est.frac)
    const abierto = 0.04 + 0.03 * caudal.current

    for (let i = 0; i < N_GOTAS; i++) {
      const k = i * 3
      const ocultar = () => {
        d.position.set(0, -10, 0)
        d.scale.setScalar(0)
        d.updateMatrix()
        malla.current.setMatrixAt(i, d.matrix)
      }
      if (i >= activas) { est.vivo[i] = 0; est.edad[i] = -0.2; ocultar(); continue }
      est.edad[i] += dt
      if (est.edad[i] < 0) { ocultar(); continue }

      if (!est.vivo[i]) {
        // nace en la punta de la boquilla con una pequeña dispersión
        const theta = ANGULO + (Math.random() - 0.5) * abierto
        const phi = (Math.random() - 0.5) * abierto * 1.4
        const v = V_AGUA + (Math.random() - 0.5) * 0.4
        est.p[k] = PUNTA.x; est.p[k + 1] = PUNTA.y; est.p[k + 2] = PUNTA.z
        est.v[k] = v * Math.cos(theta) * Math.cos(phi)
        est.v[k + 1] = v * Math.sin(theta)
        est.v[k + 2] = v * Math.cos(theta) * Math.sin(phi)
        est.vivo[i] = 1
      }

      est.v[k + 1] -= 9.8 * dt // gravedad
      est.p[k] += est.v[k] * dt
      est.p[k + 1] += est.v[k + 1] * dt
      est.p[k + 2] += est.v[k + 2] * dt

      // choca con la casa o el suelo: la gota "muere" y vuelve a nacer
      if (est.p[k + 1] < 0.03 || est.p[k] > X_CASA || est.edad[i] > 2.5) {
        est.vivo[i] = 0
        est.edad[i] = -Math.random() * 0.12
        ocultar()
        continue
      }
      d.position.set(est.p[k], est.p[k + 1], est.p[k + 2])
      d.scale.setScalar(est.tam[i])
      d.updateMatrix()
      malla.current.setMatrixAt(i, d.matrix)
    }
    malla.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={malla} args={[null, null, N_GOTAS]} frustumCulled={false}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={AGUA} emissive="#3b9be0" emissiveIntensity={0.5} transparent opacity={0.85} />
    </instancedMesh>
  )
}

// ─────────────── Manguera, trípode y boquilla ───────────────
function Manguera() {
  const geometria = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.8, 0.85, -0.6),
      new THREE.Vector3(1.4, 0.45, -0.85),
      new THREE.Vector3(1.95, 0.1, -0.45),
      new THREE.Vector3(2.05, 0.1, 0.05),
      new THREE.Vector3(BOQUILLA.x - 0.05, BOQUILLA.y - 0.02, BOQUILLA.z),
    ])
    return new THREE.TubeGeometry(curva, 48, 0.07, 10, false)
  }, [])
  return (
    <group>
      <mesh geometry={geometria}>
        <meshStandardMaterial color="#eab308" roughness={0.6} />
      </mesh>
      {/* toma lateral del camión */}
      <mesh position={[0.78, 0.85, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.12, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* trípode */}
      <mesh position={[BOQUILLA.x, 0.17, BOQUILLA.z]}>
        <cylinderGeometry args={[0.04, 0.12, 0.34, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* boquilla */}
      <group position={BOQUILLA.toArray()} rotation={[0, 0, ANGULO]}>
        <mesh position={[LARGO_BOQUILLA / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.09, LARGO_BOQUILLA, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  )
}

// ─────────────── Casa en llamas ───────────────
function CasaEnLlamas({ fuego }) {
  const llamas = useRef([])
  const luz = useRef()
  const CONFIG = [
    [-0.7, 0.55, 0.42], [-0.35, 0.7, 0.55], [0.0, 0.55, 0.62], [0.35, 0.7, 0.5], [0.7, 0.55, 0.42], [-0.15, 1.15, 0.4], [0.3, 1.2, 0.36],
  ]

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const f = fuego.current
    llamas.current.forEach((m, i) => {
      if (!m) return
      const parpadeo = 0.8 + 0.3 * Math.sin(t * 9 + i * 1.7) + 0.1 * Math.sin(t * 23 + i)
      m.scale.set(f * (0.9 + 0.1 * Math.sin(t * 7 + i)), Math.max(0.02, f * parpadeo), f)
    })
    if (luz.current) luz.current.intensity = f * (3 + Math.sin(t * 12) * 0.8)
  })

  return (
    <group position={[X_CASA + 0.8, 0, 0.2]}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.6, 1.5, 1.9]} />
        <meshStandardMaterial color="#8394ab" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.8, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.5, 0.7, 4]} />
        <meshStandardMaterial color="#5b6b82" roughness={0.85} />
      </mesh>
      {/* ventanas encendidas por el fuego */}
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} position={[-0.801, 0.85, z]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 0.45]} />
          <meshStandardMaterial color="#ff8a1f" emissive="#ff6a00" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {/* llamas (conos) frente a la casa */}
      <group position={[-0.95, 0.15, 0]}>
        {CONFIG.map(([z, y, r], i) => (
          <mesh key={i} ref={(el) => (llamas.current[i] = el)} position={[0, y, z]}>
            <coneGeometry args={[r * 0.6, 1.25, 10]} />
            <meshStandardMaterial
              color={i % 2 ? '#ffb020' : '#ff5a1f'}
              emissive={i % 2 ? '#ff9a00' : '#ff3d00'}
              emissiveIntensity={1.8}
              transparent
              opacity={0.92}
            />
          </mesh>
        ))}
      </group>
      <pointLight ref={luz} position={[-1.2, 1.1, 0]} color="#ff7a1a" distance={5} intensity={3} />
    </group>
  )
}

// ─────────────── Camión ───────────────
function Rueda({ posicion, refRueda }) {
  return (
    <group position={posicion}>
      <mesh ref={refRueda} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 0.3, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[posicion[0] > 0 ? 0.16 : -0.16, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Camion({ presion, caudal, escaleraArriba }) {
  const grupo = useRef()
  const ruedas = useRef([])
  const luzRoja = useRef()
  const luzAzul = useRef()
  const escalera = useRef()
  const carroceria = useRef()

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    grupo.current.position.y = Math.sin(t * 2.4) * 0.012 // vibra por la bomba de agua
    // las ruedas están quietas (el camión está estacionado y bombeando)
    const a = Math.sin(t * (caudal.current > 0.6 ? 14 : 5)) > 0
    luzRoja.current.material.emissiveIntensity = a ? 2.5 : 0.15
    luzAzul.current.material.emissiveIntensity = a ? 0.15 : 2.5
    const objetivo = escaleraArriba.current ? -0.75 : 0
    escalera.current.rotation.z += (objetivo - escalera.current.rotation.z) * Math.min(1, delta * 4)
    const e = carroceria.current.material
    e.emissiveIntensity += ((presion.current ? 0.35 : 0) - e.emissiveIntensity) * Math.min(1, delta * 8)
  })

  return (
    <group ref={grupo}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 0.2, 3.9]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh ref={carroceria} position={[0, 1.15, -0.5]}>
        <boxGeometry args={[1.5, 1.1, 2.7]} />
        <meshStandardMaterial color={ROJO} emissive={ROJO} emissiveIntensity={0} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.1, -0.5]}>
        <boxGeometry args={[1.52, 0.14, 2.72]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.05, 1.35]}>
        <boxGeometry args={[1.5, 1.0, 1.15]} />
        <meshStandardMaterial color={ROJO} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.4, 1.93]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[1.3, 0.45, 0.04]} />
        <meshStandardMaterial color="#7dd3fc" metalness={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.62, 2.0]}>
        <boxGeometry args={[1.6, 0.18, 0.15]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.9, 1.95]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.2} />
        </mesh>
      ))}
      <mesh position={[0, 1.62, 1.35]}>
        <boxGeometry args={[1.1, 0.08, 0.3]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh ref={luzRoja} position={[-0.38, 1.74, 1.35]}>
        <boxGeometry args={[0.32, 0.16, 0.26]} />
        <meshStandardMaterial color={ROJO} emissive={ROJO} emissiveIntensity={2} />
      </mesh>
      <mesh ref={luzAzul} position={[0.38, 1.74, 1.35]}>
        <boxGeometry args={[0.32, 0.16, 0.26]} />
        <meshStandardMaterial color={AZUL} emissive={AZUL} emissiveIntensity={0.2} />
      </mesh>
      <group position={[0, 1.78, -1.7]}>
        <group ref={escalera}>
          {[-0.2, 0.2].map((x) => (
            <mesh key={x} position={[x, 0, 1.35]}>
              <boxGeometry args={[0.07, 0.07, 2.9]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
            </mesh>
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, 0, 0.2 + i * 0.3]}>
              <boxGeometry args={[0.4, 0.05, 0.05]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </group>
      {[[-0.78, 0.38, 1.3], [0.78, 0.38, 1.3], [-0.78, 0.38, -1.1], [0.78, 0.38, -1.1]].map((p, i) => (
        <Rueda key={i} posicion={p} refRueda={(el) => (ruedas.current[i] = el)} />
      ))}
      <pointLight position={[0, 2.2, 1.35]} intensity={2.5} color={ROJO} distance={5} />
    </group>
  )
}

// ─────────────── Escena completa ───────────────
// Un solo grupo escucha el mouse: así el camión, la manguera y la casa reaccionan igual.
// Si recibe `progresoRef` (0 – 1, del scroll), la historia avanza sola:
//   0 – 0.2 el fuego crece · 0.2 – 0.45 sale el agua · 0.45 – 0.85 el fuego se apaga.
// Al subir de nuevo, todo vuelve atrás.
function Mundo({ progresoRef }) {
  const presion = useRef(false) // ¿mouse encima? (ref: no vuelve a renderizar)
  const caudal = useRef(progresoRef ? 0 : 0.55) // caudal de agua (0 – 1)
  const fuego = useRef(1) // intensidad del fuego (0.04 – 1)
  const escaleraArriba = useRef(false)

  useFrame((_, delta) => {
    const p = progresoRef ? progresoRef.current : null
    const base = p == null ? 0.55 : suavizar((p - 0.18) / 0.25)
    caudal.current = presion.current ? 1 : base
    const fuegoBase = p == null ? 1 : Math.max(0.04, 1 - suavizar((p - 0.4) / 0.45))
    const objetivo = presion.current ? Math.min(0.18, fuegoBase) : fuegoBase
    fuego.current += (objetivo - fuego.current) * Math.min(1, delta * (presion.current ? 1.6 : 2))
  })

  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); presion.current = true; document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { presion.current = false; document.body.style.cursor = '' }}
      onClick={(e) => { e.stopPropagation(); escaleraArriba.current = !escaleraArriba.current }}
    >
      <Camion presion={presion} caudal={caudal} escaleraArriba={escaleraArriba} />
      <Manguera />
      <Chorro caudal={caudal} />
      <CasaEnLlamas fuego={fuego} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, 0.005, 0]}>
        <circleGeometry args={[6.2, 64]} />
        <meshStandardMaterial color="#1b1b1b" />
      </mesh>
    </group>
  )
}

// Cámara que orbita despacio alrededor de la escena conforme avanza el scroll.
const OBJETIVO = new THREE.Vector3(2.5, 0.9, 0.1)
function Camara({ progresoRef }) {
  useFrame(({ camera, size }) => {
    const p = progresoRef ? progresoRef.current : 0.5
    const ang = 0.31 + (p - 0.5) * 0.8
    const aspecto = size.width / size.height
    const R = aspecto > 1.2 ? 10 : 10 + (1.2 - aspecto) * 9 // en pantallas altas se aleja
    camera.position.set(OBJETIVO.x + Math.sin(ang) * R, 3.1 + (1 - p) * 0.5, OBJETIVO.z + Math.cos(ang) * R)
    camera.lookAt(OBJETIVO)
  })
  return null
}

// Si el navegador no soporta WebGL, la landing sigue funcionando.
class Seguro extends Component {
  state = { fallo: false }
  static getDerivedStateFromError() { return { fallo: true } }
  render() {
    return this.state.fallo
      ? <div className="escena__fallo" role="img" aria-label="Camión de bomberos">Camión de bomberos</div>
      : this.props.children
  }
}

export default function EscenaLanding({ progresoRef = null, pista = true, className = '' }) {
  const [listo, setListo] = useState(false)
  return (
    <div className={`escena ${className}`}>
      <Seguro>
        <Canvas camera={{ position: [5.6, 3.1, 9.6], fov: 38 }} dpr={[1, 1.75]} onCreated={() => setListo(true)}>
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 12, 26]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 7, 5]} intensity={1.3} />
          <directionalLight position={[-5, 3, -3]} intensity={0.45} color={AZUL} />
          <Camara progresoRef={progresoRef} />
          <Mundo progresoRef={progresoRef} />
          <ContactShadows position={[2.6, 0.02, 0]} opacity={0.5} scale={15} blur={2.5} far={3} />
        </Canvas>
      </Seguro>
      {pista && (
        <p className={`escena__pista ${listo ? 'escena__pista--visible' : ''}`}>
          Pasa el mouse para subir la presión del agua · haz clic para subir la escalera
        </p>
      )}
    </div>
  )
}

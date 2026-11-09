import { Component, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Globo de partículas incandescentes del héroe (R3F).
//   · Miles de puntos sobre una esfera (retícula de Fibonacci), densos donde hay
//     «continentes» y dispersos en el resto, en tonos brasa → ámbar.
//   · Está orientado hacia Cali, que late con un anillo.
//   · useFrame: rota despacio, sigue un poco al mouse y reacciona al scroll
//     (gira y crece conforme se baja la primera pantalla).
const CALI = { lat: 3.4372, lng: -76.5225 }
const RADIO = 1.75

const aVector = (lat, lng, r = 1) => {
  const f = (lat * Math.PI) / 180
  const l = (lng * Math.PI) / 180
  return new THREE.Vector3(Math.cos(f) * Math.sin(l) * r, Math.sin(f) * r, Math.cos(f) * Math.cos(l) * r)
}

function generar(n) {
  const base = [new THREE.Color('#a82405'), new THREE.Color('#ff6a13'), new THREE.Color('#ffb54a')]
  const aureo = Math.PI * (3 - Math.sqrt(5))
  const pos = []; const col = []; const brillo = []
  const c = new THREE.Color()
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(1 - y * y)
    const th = i * aureo
    const x = Math.cos(th) * r
    const z = Math.sin(th) * r
    // «Tierra» aproximada con ruido suave: más puntos donde el valor es alto
    const ruido = Math.sin(2.1 * x + 1.7) * Math.cos(2.6 * y - 0.8) + 0.8 * Math.sin(3.3 * z + 0.4) * Math.cos(2.2 * x + 2.9) + 0.35 * Math.sin(5 * y + 4 * z)
    const azar = Math.random()
    if (ruido < 0.1) { if (azar > 0.05) continue } else if (ruido < 0.6 && azar > 0.55) continue
    const t = Math.random() ** 1.6
    c.copy(base[0]).lerp(base[1], Math.min(1, t * 2)).lerp(base[2], Math.max(0, t * 2 - 1))
    c.multiplyScalar(0.55 + Math.random() * 0.5)
    pos.push(x * RADIO, y * RADIO, z * RADIO)
    col.push(c.r, c.g, c.b)
    if (Math.random() < 0.025) brillo.push(x * RADIO * 1.002, y * RADIO * 1.002, z * RADIO * 1.002)
  }
  return { pos: new Float32Array(pos), col: new Float32Array(col), brillo: new Float32Array(brillo) }
}

function Globo({ scrollRef }) {
  const grupo = useRef()
  const anillo = useRef()
  const datos = useMemo(() => generar(30000), [])
  const cali = useMemo(() => aVector(CALI.lat, CALI.lng, RADIO * 1.01), [])
  const lat = (CALI.lat * Math.PI) / 180
  const lng = (CALI.lng * Math.PI) / 180

  useFrame(({ clock, pointer, size }, delta) => {
    const t = clock.elapsedTime
    const h = scrollRef.current
    const g = grupo.current
    const d = Math.min(1, delta * 2)
    // de frente a Cali, con una oscilación lenta + el scroll + el mouse
    const objetivoY = -lng + Math.sin(t * 0.14) * 0.32 + h * 1.9 + pointer.x * 0.2
    const objetivoX = lat * 0.55 + pointer.y * -0.1 + h * 0.2
    g.rotation.y += (objetivoY - g.rotation.y) * d
    g.rotation.x += (objetivoX - g.rotation.x) * d
    g.scale.setScalar(1 + h * 0.55)
    g.position.x += ((size.width > 760 ? 1.25 : 0) - g.position.x) * d
    // anillo de Cali: crece y se desvanece en bucle
    const fase = (t * 0.7) % 1
    anillo.current.scale.setScalar(0.4 + fase * 2.4)
    anillo.current.material.opacity = (1 - fase) * 0.85
  })

  return (
    <group ref={grupo} rotation={[lat * 0.55, -lng, 0]}>
      {/* esfera negra: oculta los puntos del lado opuesto */}
      <mesh><sphereGeometry args={[RADIO * 0.985, 48, 48]} /><meshBasicMaterial color="#000" /></mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={datos.pos.length / 3} array={datos.pos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={datos.col.length / 3} array={datos.col} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.017} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      {/* «ciudades»: puntos más grandes y brillantes */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={datos.brillo.length / 3} array={datos.brillo} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#ffe3a6" transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      {/* Cali */}
      <group position={cali.toArray()} onUpdate={(g) => g.lookAt(cali.clone().multiplyScalar(2))}>
        <mesh><sphereGeometry args={[0.035, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh ref={anillo}>
          <ringGeometry args={[0.06, 0.075, 48]} />
          <meshBasicMaterial color="#ffb347" transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

class Seguro extends Component {
  state = { fallo: false }
  static getDerivedStateFromError() { return { fallo: true } }
  render() { return this.state.fallo ? null : this.props.children }
}

export default function GloboParticulas({ scrollRef }) {
  return (
    <Seguro>
      <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }} dpr={[1, 1.6]} gl={{ antialias: false, alpha: true }}>
        <Globo scrollRef={scrollRef} />
      </Canvas>
    </Seguro>
  )
}

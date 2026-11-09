// Grupos de emergencia del protocolo de despacho de Bomberos Cali.
// Los colores son una propuesta: el equipo puede cambiarlos, pero deben ser
// los mismos en toda la app y en el mapa 3D.
// `ejemplos` sale tal cual de la tabla «Clasificación de grupos de emergencia»
// del enunciado y se usa en la landing, el formulario y el tablero del operador.
export const GRUPOS = [
  { codigo: 100, nombre: 'Incendios', color: '#dc2626', ejemplos: 'Edificación, vehículo, vegetación, basuras' },
  { codigo: 200, nombre: 'Explosión o ruptura sin incendio', color: '#ea580c', ejemplos: 'Explosión, ruptura de equipos' },
  { codigo: 300, nombre: 'Rescates y emergencias médicas', color: '#2563eb', ejemplos: 'Accidente de tránsito, personas en ascensor, caída en río' },
  { codigo: 400, nombre: 'Condiciones peligrosas sin incendio', color: '#ca8a04', ejemplos: 'Fuga u olor a gas, línea eléctrica caída, HazMat' },
  { codigo: 500, nombre: 'Llamadas de servicio', color: '#16a34a', ejemplos: 'Solicitudes que no son emergencia inmediata' },
  { codigo: 800, nombre: 'Clima severo y desastres naturales', color: '#0891b2', ejemplos: 'Inundación, vendaval, sismo' },
  { codigo: 900, nombre: 'Tipo de incidente especial, no clasificado', color: '#7c3aed', ejemplos: 'Lo que no encaja en los demás' },
]

export const colorDeGrupo = (codigo) =>
  GRUPOS.find((g) => g.codigo === codigo)?.color ?? '#6b7280'

export const grupoDe = (codigo) => GRUPOS.find((g) => g.codigo === codigo)

// Validación del formulario de reporte (sección 3 del enunciado).
const SOLO_LETRAS = /^[\p{L}][\p{L}\s'.-]*$/u

export const CAMPOS_INICIALES = {
  nombres: '',
  apellidos: '',
  telefono: '',
  grupo: '', // código como texto; se convierte a número al enviar
  queVe: '',
  direccion: '',
  barrio: '',
  referencia: '',
  edificio: '',
  edificioNoAplica: false,
  // Grupo 300 (extra): preguntas de continuación
  sexo: '',
  edad: '',
  consciente: '',
  respira: '',
}

// Devuelve { campo: 'mensaje' } solo con los campos que tienen error.
export function validar(v) {
  const e = {}
  const t = (s) => s.trim()

  if (t(v.nombres).length < 2) e.nombres = 'Escribe tus nombres (mínimo 2 letras).'
  else if (!SOLO_LETRAS.test(t(v.nombres))) e.nombres = 'Los nombres solo pueden tener letras.'

  if (t(v.apellidos).length < 2) e.apellidos = 'Escribe tus apellidos (mínimo 2 letras).'
  else if (!SOLO_LETRAS.test(t(v.apellidos))) e.apellidos = 'Los apellidos solo pueden tener letras.'

  if (!v.telefono) e.telefono = 'El teléfono es obligatorio.'
  else if (!/^\d{10}$/.test(v.telefono)) e.telefono = 'Debe tener exactamente 10 dígitos, solo números.'

  if (!v.grupo) e.grupo = 'Elige el grupo de emergencia.'

  if (t(v.queVe).length < 10) e.queVe = 'Cuéntanos qué ves (mínimo 10 caracteres).'

  if (t(v.direccion).length < 5) e.direccion = 'Escribe la dirección (mínimo 5 caracteres).'

  if (!v.barrio) e.barrio = 'Elige el barrio de la lista.'

  if (t(v.referencia).length < 3) e.referencia = 'Indica un punto de referencia (ej. «frente al parque»).'

  if (!v.edificioNoAplica && t(v.edificio).length < 2) {
    e.edificio = 'Escribe el nombre del edificio o marca «No aplica».'
  }

  if (v.grupo === '300') {
    if (!v.sexo) e.sexo = 'Indica el sexo de la persona afectada.'
    const edad = Number(v.edad)
    if (v.edad === '' || !Number.isInteger(edad) || edad < 0 || edad > 120) e.edad = 'Escribe una edad entre 0 y 120.'
    if (!v.consciente) e.consciente = 'Indica si está consciente.'
    if (!v.respira) e.respira = 'Indica si respira.'
  }
  return e
}

export const ETIQUETAS = {
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  telefono: 'Teléfono',
  grupo: 'Grupo de emergencia',
  queVe: '¿Qué ve?',
  direccion: 'Dirección',
  barrio: 'Barrio',
  referencia: 'Punto de referencia',
  edificio: 'Nombre del edificio',
  sexo: 'Sexo',
  edad: 'Edad',
  consciente: '¿Consciente?',
  respira: '¿Respira?',
}

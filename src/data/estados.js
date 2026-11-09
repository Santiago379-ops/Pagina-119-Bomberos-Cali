// Estados del reporte y unidades de despacho.
// Flujo: Recibido → Validado → Unidad despachada → Cerrado (o Descartado).
export const ESTADOS = {
  RECIBIDO: 'Recibido',
  VALIDADO: 'Validado',
  DESPACHADO: 'Unidad despachada',
  CERRADO: 'Cerrado',
  DESCARTADO: 'Descartado',
}

export const COLOR_ESTADO = {
  [ESTADOS.RECIBIDO]: '#f59e0b',
  [ESTADOS.VALIDADO]: '#0ea5e9',
  [ESTADOS.DESPACHADO]: '#8b5cf6',
  [ESTADOS.CERRADO]: '#64748b',
  [ESTADOS.DESCARTADO]: '#94a3b8',
}

// Explicación mostrada al ciudadano según el estado de su reporte.
export const MENSAJE_ESTADO = {
  [ESTADOS.RECIBIDO]: 'Tu reporte llegó a la central. Un radio operador lo revisará y podría llamarte.',
  [ESTADOS.VALIDADO]: 'El radio operador validó tu reporte. Estamos preparando el despacho.',
  [ESTADOS.DESPACHADO]: 'Hay una unidad en camino. Mantén tu teléfono cerca y sigue las indicaciones.',
  [ESTADOS.CERRADO]: 'El caso fue atendido y cerrado. Gracias por reportar.',
  [ESTADOS.DESCARTADO]: 'El reporte fue descartado por la central (falso o duplicado).',
}

// Estados "inactivos": el pin del mapa se apaga.
export const ESTADOS_INACTIVOS = [ESTADOS.CERRADO, ESTADOS.DESCARTADO]

export const UNIDADES = ['Máquina', 'Rescate', 'Ambulancia', 'HazMat']

export const MOTIVOS_DESCARTE = ['Falso', 'Duplicado']

// Reduce una imagen (URL de objectURL) a una miniatura JPEG en data URL.
// Se usa al enviar el reporte: la foto se previsualiza con URL.createObjectURL,
// pero una copia pequeña se guarda en localStorage para que el operador la vea
// aunque abra /operador en otra pestaña o recargue la página. No se sube a ningún servidor.
export function reducirImagen(url, maxLado = 720, calidad = 0.72) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, maxLado / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(img.width * k))
      c.height = Math.max(1, Math.round(img.height * k))
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', calidad))
    }
    img.onerror = () => resolve(url) // si falla, se queda con el objectURL (solo en memoria)
    img.src = url
  })
}

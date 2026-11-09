// Envoltorio de un campo del formulario: etiqueta + control + mensaje de error.
// `children` es una función que recibe las props de accesibilidad del control.
export default function Campo({ id, etiqueta, error, ayuda, children }) {
  const idError = `${id}-error`
  return (
    <div className={`campo ${error ? 'campo--error' : ''}`}>
      <label htmlFor={id}>{etiqueta} <span className="campo__req" aria-hidden="true">*</span></label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': error ? idError : undefined })}
      {ayuda && !error && <small className="campo__ayuda">{ayuda}</small>}
      {error && <small id={idError} className="campo__error" role="alert">{error}</small>}
    </div>
  )
}

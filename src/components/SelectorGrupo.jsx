import { GRUPOS } from '../data/grupos.js'

// Elección del grupo de emergencia con tarjetas: código, nombre y los ejemplos
// del protocolo, para que la persona reconozca su caso sin conocer los códigos.
export default function SelectorGrupo({ valor, onCambiar, onTocar, error }) {
  return (
    <fieldset className={`selector-grupo ${error ? 'selector-grupo--error' : ''}`} aria-describedby={error ? 'grupo-error' : undefined}>
      <legend className="sr-only">Grupo de emergencia (obligatorio)</legend>
      <div className="selector-grupo__lista" role="radiogroup" aria-label="Grupo de emergencia">
        {GRUPOS.map((g) => {
          const marcado = valor === String(g.codigo)
          return (
            <label key={g.codigo} className={`opcion-grupo ${marcado ? 'is-marcado' : ''}`} style={{ '--c': g.color }}>
              <input
                type="radio"
                name="grupo"
                id={`grupo-${g.codigo}`}
                value={g.codigo}
                checked={marcado}
                onChange={onCambiar}
                onBlur={onTocar}
              />
              <span className="opcion-grupo__codigo">{g.codigo}</span>
              <span className="opcion-grupo__texto">
                <strong>{g.nombre}</strong>
                <small>{g.ejemplos}</small>
              </span>
            </label>
          )
        })}
      </div>
      {error && <small id="grupo-error" className="campo__error" role="alert">{error}</small>}
    </fieldset>
  )
}

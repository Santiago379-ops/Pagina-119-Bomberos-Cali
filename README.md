# Línea 119 · Bomberos Cali — Prototipo web

Parcial de Desarrollo Web (Ingeniería Multimedia, Universidad de San Buenaventura) · 2026-2.
Canal digital para la línea 119 del Benemérito Cuerpo de Bomberos Voluntarios de Cali: el ciudadano reporta, el radio operador valida y despacha, y el ciudadano ve el estado de su reporte.

- **Sitio desplegado:** _pegar aquí el enlace de Vercel/Netlify_
- **Repositorio:** _pegar aquí el enlace de GitHub_

## Integrantes

| Nombre | Código |
| --- | --- |
| Santiago Giraldo Sánchez | 129737 |
| Felipe Gallo Mazuera | 129068 |

## Cómo correr el proyecto

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # prueba la versión de producción
```

Para probar el flujo completo: abrir `/reportar`, enviar un reporte y luego abrir `/operador` (en la misma pestaña o en otra: se sincronizan). El mapa usa OpenStreetMap, no necesita API key, solo internet.

## Las tres pantallas

| Ruta | Pantalla | Qué hace |
| --- | --- | --- |
| `/` | Landing | Encabezado, escena 3D (camión apagando un incendio), «Reportar emergencia», «Llamar al 119» (`tel:119`), tarjetas de los 7 grupos y enlace «Acceso radio operador» en el pie. |
| `/reportar` | Ciudadano | Formulario con el interrogatorio inicial, validación, hasta 3 fotos con miniaturas y respuesta automática (radicado, hora, estado en vivo). |
| `/operador` | Radio operador | Mapa real, lista, detalle, llamar, validar/descartar, despachar y cerrar. |

Estados: `Recibido → Validado → Unidad despachada → Cerrado` (o `Descartado`). **Cada estado se ve en el pin del mapa:** Recibido pulsa, Validado lleva un aro azul fijo, Unidad despachada un aro morado discontinuo que gira, y Cerrado/Descartado se apaga en gris; además el punto central del pin toma el color del estado. El reducer del estado global **rechaza** transiciones inválidas (por ejemplo, despachar sin validar), no solo la interfaz.

## Interfaz

Diseño oscuro a pantalla completa: fondo negro, **globo de partículas ámbar** en 3D (con Cali marcada), titulares gigantes en mayúsculas condensadas (League Gothic), líneas finas con una frase en serif, menú lateral discreto con indicador de sección activa y un sello arriba a la derecha. Tipografías incluidas con `@fontsource` (sin depender de internet). Los grupos de emergencia son placas con el código en grande y sus ejemplos del protocolo. Íconos SVG propios, seguimiento por pasos, barra de progreso del formulario y diseño responsive (celular, tableta, escritorio).

**Animaciones con el scroll (suben y bajan):** barra de progreso superior; el globo se acerca, rota y se desvanece al bajar; el titular se desplaza con parallax; la escena del camión es una sección fija cuyo scroll controla la historia (reporte recibido → unidad despachada → caso cerrado): el camión orbita, el chorro de la manguera aumenta y el fuego se apaga, y al subir se revierte; los textos aparecen con máscaras y deslizamientos laterales, y la línea de «Cómo funciona» se dibuja según se avanza. Se respeta `prefers-reduced-motion`.

## El formulario sigue el protocolo

`/reportar` está organizado por las cuatro preguntas del interrogatorio inicial, escritas tal cual: «Línea 119 Bomberos Cali, ¿cuál es su emergencia?» (grupo + ¿qué ve?), «¿De qué número me llama?» (teléfono), «¿Dónde es su emergencia?» (dirección, barrio, punto de referencia, nombre del edificio) y «¿Cuál es su nombre?» (nombres y apellidos). El grupo se elige con tarjetas que muestran los ejemplos de la tabla de clasificación (definidos una sola vez en `data/grupos.js`).

## Estructura

```
src/
  context/ReportesContext.jsx   Estado global: reducer + localStorage + evento "storage"
  data/                         grupos.js, barrios.js (base) y estados.js (estados, unidades)
  utils/                        validacion.js (reglas del formulario), formato.js (hora, distancia, Google Maps)
  components/                   Campo, FormularioReporte, SubidorMedios, Confirmacion, ListaReportes,
                                DetalleReporte, BadgeEstado, EtiquetaGrupo, Medios, MiniMapaSelector, Logo…
  mapa/                         MapaOperador (react-leaflet), iconos.js, mapa.css
  three/EscenaLanding.jsx       Escena R3F de la landing
  pages/                        Landing, Reportar, Operador
```

**Estado global:** vive en un único `ReportesProvider` (Context + `useReducer`). `/reportar` solo llama `crearReporte`; `/operador` solo lee la lista y llama `validar`, `despachar`, etc. No hay estado duplicado entre pantallas. Se guarda en `localStorage` y el evento `storage` sincroniza dos pestañas abiertas. Las fotos se previsualizan con `URL.createObjectURL`; al enviar, una copia reducida (JPEG de máx. 720 px) se guarda en `localStorage` para que el operador la vea aunque abra `/operador` escribiendo la URL o en otra pestaña. No se suben a ningún servidor. Los videos pesan demasiado para `localStorage`: solo viven en la pestaña que los subió.

## Escena 3D (React Three Fiber)

Un **camión de bomberos que apaga con su manguera una casa en llamas**, hecho solo con geometrías básicas (no se usan modelos `.glb`, así que no hay licencias que citar).
- **Canvas, luces y cámara:** luz ambiental, dos direccionales, luces puntuales de sirena y de fuego; `OrbitControls` con ángulos limitados.
- **`useFrame`:** el agua es un sistema de partículas (260 gotas en un `instancedMesh`) con gravedad que sale de la boquilla y choca con la casa; el fuego parpadea; las sirenas alternan rojo/azul; el camión vibra por la bomba y la escalera se mueve suavemente.
- **Manguera:** un `TubeGeometry` sobre una curva `CatmullRomCurve3` que va de la toma del camión a la boquilla sobre un trípode.
- **Mouse:** `onPointerOver` sube la presión del agua (más caudal), achica el fuego, acelera las sirenas e ilumina la carrocería; `onClick` sube o baja la escalera.
- Los colores del fuego y de las sirenas salen de `data/grupos.js` (grupos 100 y 300), los mismos de las placas y del mapa.

## Mapa: los TODO del código base

1. `Operador.jsx` ya no usa `REPORTES_DEMO`: el mapa recibe los reportes del estado global.
2. Clase `pin--pulso` para los reportes **Recibido** y nueva clase `pin--apagado` (gris, tenue, sin pulso) para **Cerrado/Descartado** (`mapa.css` + `PinReporte` en `MapaOperador.jsx`).
3. Popup completo: grupo, nombre, qué ve, barrio, estado y unidad.

Además: al hacer clic en la lista el mapa se centra en el reporte (también si ya estaba seleccionado) y se abre su popup.

## Extras opcionales implementados

- **Videos además de fotos** y **ventana flotante** con recomendaciones para tomarlos.
- **Botón «Solicitar más información»:** en el detalle del operador (visible mientras el caso está activo). Elige una pregunta rápida o escribe la suya, y el aviso aparece destacado arriba en la pantalla del ciudadano, con un botón «Entendido».
- **Modo emergencia masiva:** «Simular 50 reportes» (datos ficticios), filtros por grupo y estado, y **agrupación de reportes cercanos**: los pines próximos se agrupan en un círculo con el conteo (`react-leaflet-cluster`, se puede apagar con la casilla «Agrupar pines cercanos»; a partir del zoom 17 ya no se agrupa) y además hay un aviso «⚠ N cercanos» en la lista y el detalle para reportes activos a menos de 250 m.
- **Preguntas de continuación del grupo 300:** sexo, edad, ¿consciente?, ¿respira? Aparecen en el formulario al elegir el grupo 300 (son obligatorias solo en ese caso) y se muestran en el detalle del operador.
- **Mini mapa en `/reportar`** para tocar el punto exacto (`useMapEvents`); si no se marca, se usa el centro del barrio con un pequeño desplazamiento (~100 m) para que dos reportes del mismo barrio no queden uno encima del otro.
- **Sincronización de pestañas** con el evento `storage`.

## Respuestas a las 5 preguntas de Bomberos

**1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?**
*Qué se hizo:* cada reporte guarda `lat/lng` y aparece como pin de color en el mapa real de Cali; el detalle muestra las coordenadas y el enlace «Ver en Google Maps». Las coordenadas salen del barrio elegido o, si el ciudadano la marca, del punto exacto en el mini mapa.
*Qué faltaría para producción:* usar la geolocalización del dispositivo (GPS) con permiso del usuario, validar la precisión, y geocodificar la dirección escrita; hoy el centro del barrio es solo una aproximación.

**2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?**
*Qué se hizo:* al enviar, se muestra una pantalla con número de radicado (`B119-AAAA-NNNNN`), hora y estado, que cambia en vivo cuando el operador valida, despacha o cierra.
*Qué faltaría:* enviar la confirmación también por SMS o correo, y consultar el estado desde un servidor (hoy se comparte vía `localStorage`).

**3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?**
*Qué se hizo:* el botón «Simular 50 reportes» prueba el tablero; hay filtros por grupo y estado, el conteo por grupo en la leyenda del mapa, el pulso para lo que está sin atender, la agrupación de pines en el mapa y la alerta de reportes cercanos para detectar posibles duplicados.
*Qué faltaría:* backend con cola y base de datos, priorización automática, límites contra spam/falsos reportes y pruebas de carga.

**4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?**
*Qué se hizo:* está fuera del alcance del parcial. Se dejó el botón «Llamar» (`tel:`) y «Solicitar más información», que muestra un aviso al ciudadano.
*Qué faltaría:* WebRTC con un servidor de señalización (o un servicio como Twilio/Daily), con consentimiento del ciudadano y activación solo cuando el operador lo decida.

**5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?**
*Qué se hizo:* hasta 3 archivos (fotos o videos) con miniaturas y botón para quitarlos, y una ventana flotante con recomendaciones de seguridad y de encuadre.
*Qué faltaría:* subirlos a un almacenamiento real (hoy las fotos son miniaturas en `localStorage` y los videos solo viven en la pestaña), comprimirlos y limitar peso/duración, y revisar su contenido antes de mostrarlos al operador.

## Pregunta de diseño: ¿qué preguntas del protocolo se pueden omitir con foto, video o videollamada?

1. **«¿Dónde es su emergencia?» (barrio, punto de referencia, nombre del edificio):** una foto o un video muestran la fachada, los letreros y el entorno, y junto con las coordenadas permiten ubicar el sitio sin interrogar al ciudadano.
2. **«¿Cuál es su emergencia?» / ¿qué ve?:** una foto o un video muestran de inmediato si hay fuego, humo, un vehículo volcado o una inundación, sin que el ciudadano tenga que describirlo (y el operador puede reclasificar el grupo al validar).
3. **Preguntas de continuación del grupo 300** (¿consciente?, ¿respira?, edad y sexo aproximados): un video o una videollamada permiten ver a la persona afectada y evaluar su estado.

Nota: el **teléfono** no se puede omitir, porque el operador lo necesita para llamar y validar.

## Fuera de alcance (trabajo futuro)

App móvil, SMS, videollamada, base de datos y autenticación del operador. Hoy cualquiera puede abrir `/operador`; en producción debería estar protegido por login.

## Despliegue

- **Vercel:** importar el repositorio desde GitHub (el `vercel.json` ya incluye la regla para que las rutas `/reportar` y `/operador` funcionen al recargar).
- **Netlify:** el archivo `public/_redirects` cumple esa misma función. Comando de build `npm run build`, carpeta `dist`.

## Datos de prueba

Todos los nombres y teléfonos son ficticios. Los reportes simulados usan teléfonos que empiezan por `300` y no corresponden a personas reales.

import { Routes, Route, Link } from 'react-router-dom'
import { ReportesProvider } from './context/ReportesContext.jsx'
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'

// Las tres pantallas del parcial. Todas comparten la lista de reportes a través
// de <ReportesProvider>: /reportar agrega reportes y /operador los lee y actualiza.
export default function App() {
  return (
    <ReportesProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reportar" element={<Reportar />} />
        <Route path="/operador" element={<Operador />} />
        <Route
          path="*"
          element={
            <p style={{ padding: 24 }}>
              Página no encontrada. <Link to="/">Volver</Link>
            </p>
          }
        />
      </Routes>
    </ReportesProvider>
  )
}

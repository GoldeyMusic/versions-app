import { createRoot } from 'react-dom/client'
// Polyfill drag-drop HTML5 pour mobile/tactile. Synthetise les events
// dragstart/dragover/drop à partir des touch events, sans lequel le
// drag-and-drop natif (ex: réordonner les titres d'un projet) ne marche
// pas sur smartphones — la page scrolle au lieu de lancer un drag.
import 'drag-drop-touch'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)

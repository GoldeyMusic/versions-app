import { createRoot } from 'react-dom/client'
// Polyfill drag-drop HTML5 pour mobile/tactile. Synthetise les events
// dragstart/dragover/drop à partir des touch events, sans lequel le
// drag-and-drop natif (ex: réordonner les titres d'un projet) ne marche
// pas sur smartphones — la page scrolle au lieu de lancer un drag.
import 'drag-drop-touch'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'

// Le footer SEO statique de index.html doit rester dans le DOM même
// après l'hydratation : les crawlers JS-aware (potentiellement le
// validateur OAuth Google) parsent la DOM finale. On se contente de le
// rendre invisible (z-index négatif + opacity 0) pour qu'il n'interfère
// pas avec l'UI applicative, mais qu'il reste lisible par les crawlers.
const seoFooter = document.getElementById('seo-static-footer')
if (seoFooter) {
  seoFooter.style.zIndex = '-1'
  seoFooter.style.opacity = '0'
  seoFooter.style.pointerEvents = 'none'
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)

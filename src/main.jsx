import React from 'react'
import { createRoot } from 'react-dom/client'
import { installCrashReporter, reportClientError } from './lib/crashReporter.js'
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

// Télémétrie d'erreurs (2026-07-21) : capture les erreurs JS globales et
// les envoie au backend (table client_errors + Railway logs + notif ops).
// Posée AVANT le render pour attraper aussi un crash au premier paint.
// Contexte : page blanche non diagnosticable chez un utilisateur Windows.
installCrashReporter()

// ErrorBoundary racine : si React crashe, on affiche un écran sombre avec
// un bouton recharger AU LIEU d'une page blanche muette, et on rapporte
// l'erreur. Class component minimal (les hooks ne peuvent pas attraper les
// erreurs de rendu).
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { crashed: false }
  }
  static getDerivedStateFromError() {
    return { crashed: true }
  }
  componentDidCatch(error, info) {
    reportClientError(error?.message, (error?.stack || '') + '\n--- component stack ---' + (info?.componentStack || ''), 'react-boundary')
    // Auto-réparation : un crash de render peut venir d'un cache local de
    // forme invalide, rendu AVANT le fetch réseau. Comme le crash empêche le
    // refresh d'écraser ce cache, la panne s'auto-entretient et survit aux
    // déploiements. On purge donc les caches applicatifs dès le premier crash
    // pour que le rechargement reparte propre. La session Supabase (clé sb-*)
    // est PRÉSERVÉE : inutile de déconnecter quelqu'un qui subit déjà un bug.
    try {
      const doomed = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('versions_') && k !== 'versions_lang') doomed.push(k)
      }
      doomed.forEach((k) => localStorage.removeItem(k))
    } catch { /* mode privé / quota : on ignore */ }
  }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0b14', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.04em' }}>
            VER<span style={{ color: '#f5a623' }}>Si</span>ONS
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 420, lineHeight: 1.5 }}>
            Une erreur est survenue pendant l'affichage. Recharge la page — si ça se reproduit, écris-nous à contact@versions.studio.
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: '#f5a623', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Recharger la page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <RootErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </RootErrorBoundary>
)

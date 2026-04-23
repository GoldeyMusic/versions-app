import { useState, useEffect } from "react";

// On considère "mobile" soit un écran étroit (portrait/mobile classique)
// soit un écran bas de plafond (mobile en paysage : iPhone 14 Pro Max
// landscape = 932×430, donc width > 768 mais height 430). Dans les deux
// cas on veut le layout mobile (sidebar cachée, etc.).
const QUERY = "(max-width: 768px), (max-height: 500px)";

const useMobile = () => {
  // Lazy initializer : évalué une seule fois, synchrone, identique au CSS
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const fn = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", fn);
    return () => mql.removeEventListener("change", fn);
  }, []);

  return isMobile;
};

export default useMobile;

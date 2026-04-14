import { useState, useEffect } from "react";

// Desktop = viewport ≥ 1024px.
// Pensé pour Versions: UX desktop = user avec DAW ouvert à côté,
// donc on bascule en split 2 colonnes (cf. useMobile qui reste à 768px
// pour les bascules mobile/tablet déjà en place).
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return isDesktop;
};

export default useIsDesktop;

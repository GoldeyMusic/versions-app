import { useState, useEffect } from "react";

/**
 * Retourne true quand la fenêtre est plus étroite que `breakpoint` (par défaut 1200px),
 * même si on n'est pas en mode mobile (< 768). Utilisé pour basculer certains composants
 * desktop (ex : chat ancré) en version compacte drawer/FAB quand la place manque.
 */
const useNarrowDesktop = (breakpoint = 1200) => {
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const fn = () => setIsNarrow(window.innerWidth < breakpoint);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [breakpoint]);

  return isNarrow;
};

export default useNarrowDesktop;

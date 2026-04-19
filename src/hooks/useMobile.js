import { useState, useEffect } from "react";

const QUERY = "(max-width: 768px)";

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

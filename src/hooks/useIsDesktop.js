import { useState, useEffect } from "react";

// Desktop = viewport ≥ 1024px ET hauteur > 500px (pour exclure les mobiles
// en paysage, typiquement 800-932 × 375-430, qui seraient détectés comme
// desktop par la seule width alors qu'on veut y garder le layout mobile).
const isDesktopSize = () =>
  typeof window !== "undefined" &&
  window.innerWidth >= 1024 &&
  window.innerHeight > 500;

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(isDesktopSize);

  useEffect(() => {
    const fn = () => setIsDesktop(isDesktopSize());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return isDesktop;
};

export default useIsDesktop;

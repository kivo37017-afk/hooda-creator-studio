import { useEffect, useState } from "react";
import { SplashScreen, SPLASH_EXIT_MS } from "./SplashScreen";

/**
 * Mostrado pelo router sempre que um beforeLoad/loader está em curso.
 * Usa o estado `leaving` para um exit suave em vez de desaparecer abruptamente.
 */
export function RouterPending() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Quando o componente desmonta (router terminou), dispara o exit
    return () => {
      setLeaving(true);
    };
  }, []);

  return <SplashScreen leaving={leaving} />;
}

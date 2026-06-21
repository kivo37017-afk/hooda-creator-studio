import { SplashScreen } from "./SplashScreen";

/**
 * Mostrado pelo router sempre que uma rota tem beforeLoad/loader em curso
 * (ex: verificação de sessão, verificação se o canal existe). Substitui o
 * que seria uma tela branca vazia por um instante.
 */
export function RouterPending() {
  return <SplashScreen />;
}

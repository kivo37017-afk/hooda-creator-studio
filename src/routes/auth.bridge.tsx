import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoodaLogo } from "@/components/HoodaLogo";
import { Loader2 } from "lucide-react";

// Rota-ponte: o Hooda principal abre este URL com os tokens de sessão
// já existentes (mesmo projeto Supabase dos dois). Aqui estabelecemos
// essa sessão no Studio e seguimos direto para /studio — nunca mostra
// o ecrã de login.
export const Route = createFileRoute("/auth/bridge")({
  ssr: false,
  component: AuthBridge,
});

function AuthBridge() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        setFailed(true);
        return;
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token });

      // Limpa os tokens do URL imediatamente — nunca devem ficar visíveis
      // no histórico do browser nem em logs de partilha de ecrã.
      window.history.replaceState({}, "", "/auth/bridge");

      if (error) {
        setFailed(true);
        return;
      }

      // Navegação completa (não SPA) para garantir que o TanStack Start
      // corre o beforeLoad já com a sessão gravada no localStorage pelo
      // setSession() acima. Com navigate() SPA o router pode correr o
      // beforeLoad no servidor antes de o cliente ter a sessão disponível.
      window.location.replace("/studio");
    })();
  }, []);

  return (
    <div className="min-h-screen bg-studio-bg flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5">
        <HoodaLogo size="md" animate />
        {failed ? (
          <>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Não foi possível entrar automaticamente. Tenta abrir o Studio outra vez a partir do Hooda.
            </p>
            <button
              onClick={() => window.location.replace("/auth")}
              className="text-sm font-medium text-brand underline underline-offset-4"
            >
              Ir para o ecrã de entrada
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            A entrar no Studio…
          </div>
        )}
      </div>
    </div>
  );
}

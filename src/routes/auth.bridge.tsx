import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoodaLogo } from "@/components/HoodaLogo";
import { Loader2 } from "lucide-react";

// Os tokens chegam no #hash — o servidor NUNCA vê o hash, só o browser.
// Isso evita que o SSR intercepte e redirecione para /auth antes do JS carregar.
export const Route = createFileRoute("/auth/bridge")({
  ssr: false,
  component: AuthBridge,
});

function AuthBridge() {
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      // Lê do hash (#access_token=...&refresh_token=...)
      const hash = window.location.hash.slice(1); // remove o #
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      // Limpa o hash imediatamente
      window.history.replaceState({}, "", "/auth/bridge");

      if (!access_token || !refresh_token) {
        setErrorMsg("Tokens em falta.");
        setFailed(true);
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data.session) {
        setErrorMsg(error?.message ?? "setSession falhou.");
        setFailed(true);
        return;
      }

      // Navegação completa — localStorage já tem a sessão
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
              Não foi possível entrar automaticamente.
              {errorMsg ? ` (${errorMsg})` : ""}
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

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoodaLogo } from "@/components/HoodaLogo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/bridge")({
  ssr: false,
  component: AuthBridge,
});

function AuthBridge() {
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      // Limpa tokens do URL imediatamente
      window.history.replaceState({}, "", "/auth/bridge");

      if (!access_token || !refresh_token) {
        setErrorMsg("Tokens em falta no URL.");
        setFailed(true);
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data.session) {
        setErrorMsg(error?.message ?? "setSession não devolveu sessão.");
        setFailed(true);
        return;
      }

      // Confirma que a sessão ficou mesmo gravada antes de navegar
      const { data: check } = await supabase.auth.getSession();
      if (!check.session) {
        setErrorMsg("Sessão não persiste após setSession.");
        setFailed(true);
        return;
      }

      // Navegação completa — o cliente já tem o token no localStorage
      // antes de o servidor processar o próximo pedido
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

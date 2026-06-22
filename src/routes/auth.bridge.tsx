import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoodaLogo } from "@/components/HoodaLogo";

export const Route = createFileRoute("/auth/bridge")({
  ssr: false,
  component: AuthBridge,
});

function AuthBridge() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("A iniciar sessão...");

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      window.history.replaceState({}, "", "/auth/bridge");

      if (!access_token || !refresh_token) {
        window.location.replace("/auth");
        return;
      }

      setMsg("A verificar credenciais...");

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data.session) {
        setStatus("error");
        setMsg("Falha na autenticação. A redirecionar...");
        setTimeout(() => window.location.replace("/auth"), 2000);
        return;
      }

      setMsg("Sessão iniciada! A entrar no Studio...");
      setStatus("ok");

      // Aguarda o Supabase guardar a sessão no storage antes de navegar
      await new Promise((r) => setTimeout(r, 300));
      window.location.replace("/studio");
    })();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      fontFamily: "sans-serif",
    }}>
      <HoodaLogo size="sm" animate={false} />
      <p style={{
        fontSize: 14,
        color: status === "error" ? "red" : "#666",
        marginTop: 12,
      }}>
        {msg}
      </p>
    </div>
  );
}

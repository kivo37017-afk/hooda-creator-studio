import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoodaLogo } from "@/components/HoodaLogo";

export const Route = createFileRoute("/auth/bridge")({
  ssr: false,
  component: AuthBridge,
});

function AuthBridge() {
  const [logs, setLogs] = useState<{ msg: string; ok: boolean }[]>([]);

  const log = (msg: string, ok = true) => {
    console.log("[bridge]", msg);
    setLogs((prev) => [...prev, { msg, ok }]);
  };

  useEffect(() => {
    (async () => {
      log("bridge iniciada");

      // Ler tokens ANTES de limpar o URL
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      log("access_token: " + (access_token ? "✓ presente (" + access_token.slice(0, 20) + "...)" : "✗ em falta"), !!access_token);
      log("refresh_token: " + (refresh_token ? "✓ presente" : "✗ em falta"), !!refresh_token);

      // Só limpa o URL depois de ler os tokens
      window.history.replaceState({}, "", "/auth/bridge");

      if (!access_token || !refresh_token) {
        log("ERRO: tokens em falta — a ir para login", false);
        setTimeout(() => window.location.replace("/auth"), 3000);
        return;
      }

      log("a chamar setSession...");
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

      if (error) {
        log("ERRO setSession: " + error.message, false);
        setTimeout(() => window.location.replace("/auth"), 3000);
        return;
      }

      log("setSession ok — user: " + (data.session?.user?.email ?? "sem email"));

      const { data: check } = await supabase.auth.getSession();
      log("getSession após setSession: " + (check.session ? "✓ sessão ok" : "✗ sessão null!"), !!check.session);

      if (!check.session) {
        log("ERRO: sessão não persistida no storage", false);
        setTimeout(() => window.location.replace("/auth"), 3000);
        return;
      }

      log("✓ tudo ok — a entrar no Studio em 1s...");
      setTimeout(() => window.location.replace("/studio"), 1000);
    })();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "monospace",
      fontSize: 13,
    }}>
      <HoodaLogo size="sm" animate={false} />
      <h2 style={{ marginTop: 16, marginBottom: 12, fontSize: 15 }}>A entrar no Studio...</h2>
      <div style={{
        background: "#f5f5f5",
        borderRadius: 8,
        padding: 16,
        width: "100%",
        maxWidth: 500,
      }}>
        {logs.length === 0
          ? <p style={{ color: "#999" }}>A carregar...</p>
          : logs.map((l, i) => (
            <div key={i} style={{ color: l.ok ? "#333" : "red", marginBottom: 4 }}>
              {l.msg}
            </div>
          ))
        }
      </div>
    </div>
  );
}

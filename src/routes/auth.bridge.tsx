import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoodaLogo } from "@/components/HoodaLogo";

export const Route = createFileRoute("/auth/bridge")({
  ssr: false,
  component: AuthBridge,
});

function AuthBridge() {
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log("[bridge]", msg);
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11,23)} ${msg}`]);
  };

  useEffect(() => {
    (async () => {
      log("bridge iniciada");
      log("hash: " + window.location.hash.slice(0, 40));
      log("search: " + window.location.search.slice(0, 40));

      const params = new URLSearchParams(window.location.search);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      log("access_token presente: " + !!access_token);
      log("refresh_token presente: " + !!refresh_token);

      if (!access_token || !refresh_token) {
        log("ERRO: tokens em falta — a parar");
        return;
      }

      window.history.replaceState({}, "", "/auth/bridge");

      log("a chamar setSession...");
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
      log("setSession resultado — error: " + (error?.message ?? "nenhum"));
      log("setSession resultado — session: " + (data.session ? "ok user=" + data.session.user.email : "null"));

      if (error || !data.session) {
        log("ERRO: setSession falhou");
        return;
      }

      log("a verificar getSession...");
      const { data: check } = await supabase.auth.getSession();
      log("getSession após setSession: " + (check.session ? "ok" : "null!!"));

      if (!check.session) {
        log("ERRO: sessão não persistida");
        return;
      }
      log("a navegar para /studio...");
      window.location.replace("/studio");
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "monospace", fontSize: 13 }}>
      <HoodaLogo size="sm" animate={false} />
      <h2 style={{ marginTop: 16 }}>Bridge — diagnóstico</h2>
      <div style={{ marginTop: 12, background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
        {logs.length === 0 ? <p>A carregar...</p> : logs.map((l, i) => (
          <div key={i} style={{ color: l.includes("ERRO") ? "red" : "#333" }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

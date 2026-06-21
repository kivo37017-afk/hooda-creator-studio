import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession verifica o localStorage e faz refresh automático do token
    // se necessário — sem rejeitar tokens expirados como getUser() faz.
    // getUser() faz uma chamada de rede e falha se o access_token expirou
    // antes de o cliente Supabase ter tido tempo de o renovar (race condition
    // que causava redirect para /auth logo após a bridge definir a sessão).
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    return { user: data.session.user };
  },
  component: () => <Outlet />,
});

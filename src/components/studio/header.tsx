import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Video, Bell, Menu, LogOut, User, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HoodaLogo } from "@/components/HoodaLogo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { myChannelQuery } from "@/lib/channel-queries";
import { supabase } from "@/integrations/supabase/client";

export function StudioHeader() {
  const { data: channel } = useQuery(myChannelQuery());
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function backToHooda() {
    // Força refresh do token para garantir que access_token não expirou
    // antes de o passar na query string ao Hooda.
    const { data } = await supabase.auth.refreshSession();
    const access_token = data.session?.access_token;
    const refresh_token = data.session?.refresh_token;
    const base = "https://hooda.lovable.app";
    const url = access_token && refresh_token
      ? `${base}/auth/bridge?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}`
      : base;
    window.location.href = url;
  }

  return (
    <header className="h-14 bg-studio-surface border-b border-border sticky top-0 z-30 flex items-center px-4 gap-4">
      <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-accent">
        <Menu className="h-5 w-5" />
      </button>
      <Link to="/studio" className="flex items-center gap-2 shrink-0">
        <HoodaLogo size="sm" animate={false} />
        <span className="text-lg font-medium tracking-tight hidden sm:inline text-muted-foreground">
          Studio
        </span>
      </Link>

      <div className="flex-1 max-w-2xl mx-auto hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar no teu canal" className="pl-10 h-10 rounded-full bg-background" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={backToHooda}
          className="rounded-full h-9 gap-1.5 text-muted-foreground hidden sm:flex" title="Voltar ao Hooda">
          <ArrowLeft className="h-4 w-4" /> Hooda
        </Button>
        <Button variant="ghost" size="icon" onClick={backToHooda} className="rounded-full sm:hidden" aria-label="Voltar ao Hooda">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {channel && (
          <Button
            asChild
            className="rounded-full h-9 text-white px-4 gap-2 border-0 transition-transform hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg,#5B3FCF,#8B5CF6)" }}
          >
            <Link to="/studio/upload">
              <Video className="h-4 w-4" /> Criar
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-9 w-9 rounded-full p-[2px] shrink-0 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#5B3FCF 0%,#E94B8A 50%,#FFC93C 100%)" }}
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-muted overflow-hidden text-sm font-semibold">
                {channel?.avatar_url ? (
                  <img src={channel.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (channel?.name?.[0] ?? "?").toUpperCase()
                )}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium truncate">{channel?.name ?? "Sem canal"}</div>
              {channel?.handle && <div className="text-xs text-muted-foreground">@{channel.handle}</div>}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled><User className="h-4 w-4 mr-2" /> Definições do canal</DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}><LogOut className="h-4 w-4 mr-2" /> Terminar sessão</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

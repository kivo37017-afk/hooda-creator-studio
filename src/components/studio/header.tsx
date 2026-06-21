import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Video, Bell, Menu, LogOut, User } from "lucide-react";
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
        {channel && (
          <Button asChild className="rounded-full h-9 bg-brand text-brand-foreground hover:bg-brand/90 px-4 gap-2">
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
            <button className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-medium">
              {channel?.avatar_url ? (
                <img src={channel.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (channel?.name?.[0] ?? "?").toUpperCase()
              )}
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

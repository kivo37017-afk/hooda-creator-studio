import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Video, MessageSquare, BarChart3, Palette, Music2, Copyright, Settings, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { myChannelQuery } from "@/lib/channel-queries";

type NavItem = { to: string; label: string; icon: any; exact?: boolean; disabled?: boolean };

const items: NavItem[] = [
  { to: "/studio", label: "Painel", icon: LayoutDashboard, exact: true },
  { to: "/studio/content", label: "Conteúdo", icon: Video },
  { to: "/studio/comments", label: "Comentários", icon: MessageSquare, disabled: true },
  { to: "/studio/analytics", label: "Análises", icon: BarChart3, disabled: true },
  { to: "/studio/customisation", label: "Personalização", icon: Palette, disabled: true },
  { to: "/studio/audio", label: "Biblioteca de áudio", icon: Music2, disabled: true },
  { to: "/studio/copyright", label: "Direitos de autor", icon: Copyright, disabled: true },
];

const bottom: NavItem[] = [
  { to: "/studio/settings", label: "Definições", icon: Settings, disabled: true },
  { to: "/studio/help", label: "Ajuda", icon: HelpCircle, disabled: true },
];

export function StudioSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: channel } = useQuery(myChannelQuery());

  const isActive = (to: string, exact?: boolean) => (exact ? path === to : path.startsWith(to));

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-studio-sidebar h-[calc(100vh-56px)] sticky top-14">
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center border-b border-border">
        <div className="rounded-full p-[3px]" style={{ background: "linear-gradient(135deg,#5B3FCF 0%,#E94B8A 50%,#FFC93C 100%)" }}>
          <div className="h-20 w-20 rounded-full p-[3px] bg-studio-sidebar">
            <div className="h-full w-full rounded-full bg-muted overflow-hidden flex items-center justify-center text-2xl font-semibold text-muted-foreground">
              {channel?.avatar_url ? (
                <img src={channel.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (channel?.name?.[0] ?? "?").toUpperCase()
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">O teu canal</div>
        <div className="text-sm font-medium truncate w-full">{channel?.name ?? "Sem canal"}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((it) => {
          const active = !it.disabled && isActive(it.to, it.exact);
          const Icon = it.icon;
          const cls = `flex items-center gap-5 pl-6 pr-3 py-2.5 text-sm transition-all duration-200 ${
            active ? "bg-studio-active font-semibold border-l-[3px] border-brand pl-[21px]" : "border-l-[3px] border-transparent"
          } ${it.disabled ? "text-muted-foreground/60 cursor-not-allowed" : "hover:bg-accent hover:pl-7"}`;
          if (it.disabled) {
            return (
              <div key={it.to} className={cls}>
                <Icon className="h-5 w-5" />
                <span>{it.label}</span>
              </div>
            );
          }
          return (
            <Link key={it.to} to={it.to as any} className={cls}>
              <Icon className="h-5 w-5" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border py-2">
        {bottom.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.to} className="flex items-center gap-5 pl-6 pr-3 py-2.5 text-sm text-muted-foreground/60 cursor-not-allowed">
              <Icon className="h-5 w-5" />
              <span>{it.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

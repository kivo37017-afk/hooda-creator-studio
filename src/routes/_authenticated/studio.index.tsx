import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { myChannelQuery, channelStatsQuery, myVideosQuery } from "@/lib/channel-queries";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, Video as VideoIcon, Globe, Activity, Upload, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/studio/")({
  head: () => ({ meta: [{ title: "Painel — Hooda Studio" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: channel } = useQuery(myChannelQuery());
  const { data: stats, isLoading } = useQuery(channelStatsQuery(channel?.id));
  const { data: videos } = useQuery(myVideosQuery(channel?.id));

  const recent = (videos ?? []).slice(0, 5);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium">Painel do canal</h1>
          <p className="text-sm text-muted-foreground mt-1">Bem-vindo de volta ao {channel?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="hooda-enter" style={{ "--enter-delay": "0ms" } as CSSProperties}>
              <StatCard label="Visualizações" value={stats?.views ?? 0} icon={Eye} loading={isLoading} />
            </div>
            <div className="hooda-enter" style={{ "--enter-delay": "60ms" } as CSSProperties}>
              <StatCard label="Vídeos" value={stats?.total ?? 0} icon={VideoIcon} loading={isLoading} />
            </div>
            <div className="hooda-enter" style={{ "--enter-delay": "120ms" } as CSSProperties}>
              <StatCard label="Publicados" value={stats?.published ?? 0} icon={Globe} loading={isLoading} />
            </div>
            <div className="hooda-enter" style={{ "--enter-delay": "180ms" } as CSSProperties}>
              <StatCard
                label="Última atividade"
                value={stats?.lastActivity ? formatDistanceToNow(new Date(stats.lastActivity), { locale: pt, addSuffix: false }) : "—"}
                icon={Activity}
                loading={isLoading}
                isText
              />
            </div>
          </div>

          {/* Recent videos */}
          <Card className="p-0 overflow-hidden hooda-enter" style={{ "--enter-delay": "220ms" } as CSSProperties}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-medium">Últimos vídeos</h2>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/studio/content">Ver tudo <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            {!videos ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="p-10 text-center">
                <VideoIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Ainda não há vídeos no teu canal.</p>
                <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link to="/studio/upload"><Upload className="h-4 w-4 mr-2" /> Enviar vídeo</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((v) => (
                  <li key={v.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="h-12 w-20 rounded bg-muted overflow-hidden shrink-0">
                      {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{v.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.status === "processing" ? "A processar" : v.visibility} · {Number(v.views_count)} visualizações
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Side card */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-medium mb-2">Cresce o teu canal</h3>
            <p className="text-xs text-muted-foreground mb-4">Envia regularmente, escreve títulos claros e adiciona miniaturas chamativas.</p>
            <Button asChild className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/studio/upload"><Upload className="h-4 w-4 mr-2" /> Enviar vídeo</Link>
            </Button>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-medium mb-3">O teu canal</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center text-base font-medium">
                {channel?.avatar_url ? <img src={channel.avatar_url} className="h-full w-full object-cover" alt="" /> : (channel?.name?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{channel?.name}</div>
                <div className="text-xs text-muted-foreground">hooda.com/@{channel?.handle}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, loading, isText }: { label: string; value: number | string; icon: any; loading?: boolean; isText?: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <div className={isText ? "text-lg font-medium" : "text-2xl font-medium"}>{typeof value === "number" ? value.toLocaleString("pt-PT") : value}</div>
      )}
    </Card>
  );
}

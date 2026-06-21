import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myChannelQuery, myVideosQuery } from "@/lib/channel-queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Upload, MoreVertical, Trash2, Globe, Lock, Link as LinkIcon, Video as VideoIcon } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/studio/content")({
  head: () => ({ meta: [{ title: "Conteúdo — Hooda Studio" }] }),
  component: ContentPage,
});

const visIcon = { public: Globe, private: Lock, unlisted: LinkIcon } as const;
const visLabel = { public: "Público", private: "Privado", unlisted: "Não listado" } as const;
const statusLabel = { processing: "A processar", published: "Publicado", failed: "Falhou" } as const;

function ContentPage() {
  const qc = useQueryClient();
  const { data: channel } = useQuery(myChannelQuery());
  const { data: videos, isLoading } = useQuery(myVideosQuery(channel?.id));

  const updateVis = useMutation({
    mutationFn: async ({ id, visibility }: { id: string; visibility: "public" | "private" | "unlisted" }) => {
      const { error } = await supabase
        .from("videos")
        .update({ visibility, published_at: visibility === "public" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-videos"] }); toast.success("Visibilidade atualizada"); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (v: { id: string; video_path: string | null; thumbnail_url: string | null }) => {
      if (v.video_path) await supabase.storage.from("videos").remove([v.video_path]);
      const { error } = await supabase.from("videos").delete().eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-videos"] }); qc.invalidateQueries({ queryKey: ["channel-stats"] }); toast.success("Vídeo eliminado"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium">Conteúdo do canal</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere todos os vídeos publicados no teu canal</p>
        </div>
        <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Link to="/studio/upload"><Upload className="h-4 w-4 mr-2" /> Enviar vídeo</Link>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_140px_120px_40px] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div>Vídeo</div>
          <div>Visibilidade</div>
          <div>Data</div>
          <div className="text-right">Visualizações</div>
          <div />
        </div>

        {isLoading ? (
          <div className="p-5 space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : !videos || videos.length === 0 ? (
          <div className="p-16 text-center">
            <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base font-medium mb-1">Ainda sem vídeos</h3>
            <p className="text-sm text-muted-foreground mb-6">Envia o teu primeiro vídeo para começar.</p>
            <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/studio/upload"><Upload className="h-4 w-4 mr-2" /> Enviar vídeo</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {videos.map((v) => {
              const VIcon = visIcon[v.visibility];
              return (
                <li key={v.id} className="grid grid-cols-[1fr_120px_140px_120px_40px] gap-4 px-5 py-4 items-center hover:bg-accent/30">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-16 w-28 rounded bg-muted overflow-hidden shrink-0 relative">
                      {v.thumbnail_url ? (
                        <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><VideoIcon className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{v.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{v.description ?? "Sem descrição"}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {v.status !== "published" && <span className="text-amber-600">{statusLabel[v.status]}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Select
                      value={v.visibility}
                      onValueChange={(value) => updateVis.mutate({ id: v.id, visibility: value as any })}
                      disabled={v.status !== "published"}
                    >
                      <SelectTrigger className="h-8 text-xs border-0 bg-transparent shadow-none hover:bg-accent px-2">
                        <div className="flex items-center gap-1.5"><VIcon className="h-3.5 w-3.5" /><SelectValue /></div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="unlisted">Não listado</SelectItem>
                        <SelectItem value="public">Público</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-muted-foreground">{format(new Date(v.created_at), "d MMM yyyy", { locale: pt })}</div>
                  <div className="text-right text-sm tabular-nums">{Number(v.views_count).toLocaleString("pt-PT")}</div>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { if (confirm("Eliminar este vídeo?")) remove.mutate({ id: v.id, video_path: v.video_path, thumbnail_url: v.thumbnail_url }); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

const _vis = visLabel; // keep label const in tree

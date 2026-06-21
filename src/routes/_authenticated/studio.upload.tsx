import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { myChannelQuery } from "@/lib/channel-queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video as VideoIcon, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/studio/upload")({
  head: () => ({ meta: [{ title: "Enviar vídeo — Hooda Studio" }] }),
  component: UploadPage,
});

const ACCEPT = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE = 1024 * 1024 * 1024; // 1GB

function UploadPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: channel } = useQuery(myChannelQuery());
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("private");
  const [category, setCategory] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | null) {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) { toast.error("Formato não suportado. Usa MP4, MOV ou WEBM."); return; }
    if (f.size > MAX_SIZE) { toast.error("Ficheiro maior que 1 GB"); return; }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function handleUpload() {
    if (!file || !channel || !title.trim()) return;
    setUploading(true); setProgress(5);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const ext = file.name.split(".").pop();
      const videoId = crypto.randomUUID();
      const path = `${uid}/${videoId}.${ext}`;

      setProgress(15);
      const { error: upErr } = await supabase.storage.from("videos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      setProgress(85);

      const { error: insErr } = await supabase.from("videos").insert({
        id: videoId,
        channel_id: channel.id,
        owner_id: uid,
        title: title.trim(),
        description: description.trim() || null,
        video_path: path,
        status: "published",
        visibility,
        category: category || null,
        published_at: visibility === "public" ? new Date().toISOString() : null,
      });
      if (insErr) throw insErr;
      setProgress(100);
      qc.invalidateQueries({ queryKey: ["my-videos"] });
      qc.invalidateQueries({ queryKey: ["channel-stats"] });
      toast.success("Vídeo enviado");
      navigate({ to: "/studio/content" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
      setUploading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Enviar vídeo</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/studio/content" })}><X className="h-5 w-5" /></Button>
      </div>

      {!file ? (
        <Card
          className={`border-2 border-dashed ${dragging ? "border-brand bg-brand/5" : "border-border"} rounded-2xl p-16 text-center transition-colors`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
        >
          <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">Arrasta e larga ficheiros de vídeo</h2>
          <p className="text-sm text-muted-foreground mb-6">Os teus vídeos ficam privados até os publicares.</p>
          <input ref={inputRef} type="file" accept={ACCEPT.join(",")} className="hidden" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          <Button onClick={() => inputRef.current?.click()} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90 px-6">
            Selecionar ficheiros
          </Button>
          <p className="text-xs text-muted-foreground mt-6">MP4 · MOV · WEBM · Até 1 GB</p>
        </Card>
      ) : (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <VideoIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
            </div>
            {!uploading && <Button variant="ghost" size="icon" onClick={() => setFile(null)}><X className="h-4 w-4" /></Button>}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} disabled={uploading} />
              <p className="text-xs text-muted-foreground">{title.length}/120</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} disabled={uploading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory} disabled={uploading}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {["Música", "Jogos", "Educação", "Notícias", "Desporto", "Tecnologia", "Estilo de vida", "Entretenimento", "Outro"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibilidade</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as any)} disabled={uploading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Privado</SelectItem>
                    <SelectItem value="unlisted">Não listado</SelectItem>
                    <SelectItem value="public">Público</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">A enviar… {progress}%</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" onClick={() => navigate({ to: "/studio/content" })} disabled={uploading}>Cancelar</Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
              className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90 px-6"
            >
              {uploading ? "A enviar…" : "Publicar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

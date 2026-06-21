import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Play, Check, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/studio/onboarding")({
  head: () => ({ meta: [{ title: "Criar canal — Hooda Studio" }] }),
  component: OnboardingPage,
});

const CATEGORIES = ["Música", "Jogos", "Educação", "Notícias", "Desporto", "Tecnologia", "Estilo de vida", "Entretenimento", "Outro"];
const COUNTRIES = ["Angola", "Brasil", "Portugal", "Moçambique", "Cabo Verde", "São Tomé e Príncipe", "Guiné-Bissau", "Timor-Leste", "Outro"];

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [saving, setSaving] = useState(false);

  // Live handle check
  useEffect(() => {
    if (!handle) { setHandleStatus("idle"); return; }
    if (!/^[a-z0-9_]{3,30}$/.test(handle)) { setHandleStatus("invalid"); return; }
    setHandleStatus("checking");
    const t = setTimeout(async () => {
      const { data } = await supabase.from("channels").select("id").eq("handle", handle).maybeSingle();
      setHandleStatus(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(t);
  }, [handle]);

  async function handleSubmit() {
    if (handleStatus !== "available" || !name.trim()) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("channels").insert({
        owner_id: userData.user!.id,
        name: name.trim(),
        handle,
        description: description.trim() || null,
        category: category || null,
        country: country || null,
      });
      if (error) throw error;
      toast.success("Canal criado!");
      await qc.invalidateQueries({ queryKey: ["my-channel"] });
      navigate({ to: "/studio" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar canal");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-studio-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center">
            <Play className="h-5 w-5 text-brand-foreground fill-current" />
          </div>
          <span className="text-2xl font-medium tracking-tight">Hooda <span className="text-muted-foreground">Studio</span></span>
        </div>

        <Card className="p-8">
          <h1 className="text-xl font-medium mb-1">Cria o teu canal</h1>
          <p className="text-sm text-muted-foreground mb-6">Precisas de um canal para começar a publicar vídeos no Hooda.</p>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do canal <span className="text-destructive">*</span></Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tech Angola" maxLength={60} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">URL personalizada <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <span className="px-3 text-sm text-muted-foreground">hooda.com/@</span>
                  <input
                    id="handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    className="flex-1 bg-transparent py-2 text-sm outline-none"
                    placeholder="techangola"
                    maxLength={30}
                  />
                  <div className="pr-3">
                    {handleStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {handleStatus === "available" && <Check className="h-4 w-4 text-green-600" />}
                    {(handleStatus === "taken" || handleStatus === "invalid") && <X className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
              </div>
              {handleStatus === "taken" && <p className="text-xs text-destructive">Esta URL já está em uso.</p>}
              {handleStatus === "invalid" && <p className="text-xs text-destructive">Usa 3-30 letras minúsculas, números ou underscore.</p>}
              {handleStatus === "available" && <p className="text-xs text-green-600">URL disponível!</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sobre o que é o teu canal?" maxLength={500} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving || handleStatus !== "available" || !name.trim()}
              className="w-full h-11 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saving ? "A criar…" : "Criar canal"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoodaLogo } from "@/components/HoodaLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Hooda Studio" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/studio" });
    });
  }, [navigate]);

  async function handleEmail(mode: "in" | "up") {
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/studio` },
        });
        if (error) throw error;
        toast.success("Conta criada. Já podes entrar.");
      }
      navigate({ to: "/studio" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/studio" });
    if (result.error) {
      toast.error("Falha no Google: " + (result.error.message ?? "tenta novamente"));
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/studio" });
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — identidade Hooda, gradiente vivo, escondido em mobile */}
      <div className="hidden lg:flex lg:w-[46%] relative items-center justify-center overflow-hidden hooda-aurora">
        <div className="relative z-10 flex flex-col items-center gap-6 px-10 text-center">
          <HoodaLogo size="xl" animate />
          <p className="text-white/90 text-lg font-medium max-w-xs">
            O teu canal, a tua audiência, geridos num só lugar.
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-studio-bg">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <HoodaLogo size="md" animate={false} />
            <span className="text-2xl font-medium tracking-tight text-muted-foreground">Studio</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h1 className="text-xl font-medium text-center mb-1">Entrar no Studio</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Usa a mesma conta da Hooda para gerir o teu canal
            </p>

            <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full h-11 rounded-full gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Continuar com Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou com email</span></div>
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              {(["signin", "signup"] as const).map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${tab}-email`}>Email</Label>
                    <Input id={`${tab}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${tab}-pwd`}>Palavra-passe</Label>
                    <Input id={`${tab}-pwd`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                  </div>
                  <Button
                    onClick={() => handleEmail(tab === "signin" ? "in" : "up")}
                    disabled={loading || !email || password.length < 6}
                    className="w-full h-11 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    {tab === "signin" ? "Entrar" : "Criar conta"}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Ao continuar aceitas os termos do Hooda.
          </p>
        </div>
      </div>
    </div>
  );
}

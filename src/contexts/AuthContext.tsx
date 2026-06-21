import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  /** "loading" até a primeira verificação de sessão terminar. */
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** Verdadeiro só na primeira verificação no arranque (controla o splash). */
  initializing: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Tempo mínimo que o splash fica visível, em milissegundos. Evita que o
 * logo apareça e desapareça tão depressa que pareça um glitch — mesmo
 * padrão usado no app principal do Hooda.
 */
const MIN_SPLASH_MS = 1200; // tempo suficiente para as letras animarem

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [initializing, setInitializing] = useState(true);
  const hasResolvedOnce = useRef(false);
  const bootStartedAt = useRef(Date.now());

  useEffect(() => {
    let mounted = true;
    let minSplashTimer: ReturnType<typeof setTimeout> | undefined;

    function finishInitializing() {
      if (!mounted) return;
      const elapsed = Date.now() - bootStartedAt.current;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      minSplashTimer = setTimeout(() => {
        if (mounted) setInitializing(false);
      }, remaining);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");
      hasResolvedOnce.current = true;
      finishInitializing();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setStatus(newSession ? "authenticated" : "unauthenticated");
      if (!hasResolvedOnce.current) {
        hasResolvedOnce.current = true;
        finishInitializing();
      }
    });

    return () => {
      mounted = false;
      if (minSplashTimer) clearTimeout(minSplashTimer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ status, session, user: session?.user ?? null, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

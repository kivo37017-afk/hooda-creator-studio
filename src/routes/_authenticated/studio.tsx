import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { StudioSidebar } from "@/components/studio/sidebar";
import { StudioHeader } from "@/components/studio/header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/studio")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase
      .from("channels")
      .select("id")
      .maybeSingle();
    const hasChannel = !!data;
    const onOnboarding = location.pathname.startsWith("/studio/onboarding");
    if (!hasChannel && !onOnboarding) throw redirect({ to: "/studio/onboarding" });
    if (hasChannel && onOnboarding) throw redirect({ to: "/studio" });
  },
  component: StudioLayout,
});

function StudioLayout() {
  return (
    <div className="min-h-screen bg-studio-bg">
      <StudioHeader />
      <div className="flex">
        <StudioSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

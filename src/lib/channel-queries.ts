import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myChannelQuery = () =>
  queryOptions({
    queryKey: ["my-channel"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const myVideosQuery = (channelId: string | undefined) =>
  queryOptions({
    queryKey: ["my-videos", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!channelId,
  });

export const channelStatsQuery = (channelId: string | undefined) =>
  queryOptions({
    queryKey: ["channel-stats", channelId],
    queryFn: async () => {
      if (!channelId) return { total: 0, published: 0, views: 0, lastActivity: null as string | null };
      const { data, error } = await supabase
        .from("videos")
        .select("status, visibility, views_count, created_at")
        .eq("channel_id", channelId);
      if (error) throw error;
      const rows = data ?? [];
      return {
        total: rows.length,
        published: rows.filter((r) => r.status === "published").length,
        views: rows.reduce((acc, r) => acc + Number(r.views_count ?? 0), 0),
        lastActivity: rows[0]?.created_at ?? null,
      };
    },
    enabled: !!channelId,
  });

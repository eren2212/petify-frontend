import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Conversation } from "@/types/type";
import { useEffect } from "react";

/**
 * Kullanıcının tüm konuşmalarını getir ve real-time güncellemeleri dinle
 */
export function useConversations(currentUserRoleId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", currentUserRoleId],
    queryFn: async () => {
      if (!currentUserRoleId) return [];

      // 1. Kullanıcının katıldığı conversation'ları bul
      const { data: participantData, error: participantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("participant_role_id", currentUserRoleId);

      if (
        participantError ||
        !participantData ||
        participantData.length === 0
      ) {
        return [];
      }

      const conversationIds = participantData.map((p) => p.conversation_id);

      // 2. Conversation detaylarını getir
      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("conversations")
          .select("*")
          .in("id", conversationIds)
          .eq("is_active", true)
          .order("updated_at", { ascending: false });

      if (conversationsError || !conversationsData) {
        return [];
      }

      // 3. Her conversation için diğer participant'ı bul
      const conversationsWithParticipants = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherRoleId =
            conv.participant_1_role_id === currentUserRoleId
              ? conv.participant_2_role_id
              : conv.participant_1_role_id;

          const { data: roleData } = await supabase
            .from("user_roles")
            .select(
              `
              id,
              user_profiles (
                full_name,
                avatar_url
              )
            `,
            )
            .eq("id", otherRoleId)
            .single();

          return {
            ...conv,
            other_participant: roleData,
          } as Conversation;
        }),
      );

      return conversationsWithParticipants;
    },
    enabled: !!currentUserRoleId,
    staleTime: 1000 * 30, // 30 saniye - conversation listesi sık değişmez
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Real-time subscription - conversation güncellemelerini dinle
  useEffect(() => {
    if (!currentUserRoleId) return;

    // Conversations tablosundaki güncellemeleri dinle
    const conversationsChannel = supabase
      .channel("conversations_updates")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          console.log("🔄 Conversation updated:", payload);
          // Query'yi invalidate et ve yeniden fetch et
          queryClient.invalidateQueries({
            queryKey: ["conversations", currentUserRoleId],
          });
        },
      )
      .subscribe();

    // Messages tablosundaki yeni mesajları dinle (son mesaj güncellemesi için)
    const messagesChannel = supabase
      .channel("messages_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("💬 New message received:", payload);
          // Yeni mesaj geldiğinde conversation listesini güncelle
          queryClient.invalidateQueries({
            queryKey: ["conversations", currentUserRoleId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUserRoleId, queryClient]);

  return {
    ...query,
    currentUserRoleId, // Return this so the component can check message sender
  };
}

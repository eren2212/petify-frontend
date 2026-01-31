import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Conversation, UserRole } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  // Load User Data
  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // We need the role ID.
        // Assuming the stored user object has the role ID via a previous login response logic
        // If not, we might need to fetch it. For now, let's assume 'id' in user_roles context creates a mapping.
        // Actually, let's fetch the user_role_id from Supabase to be safe if it's missing.

        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (roleData) {
          setCurrentUserData({ ...user, role_id: roleData.id });
        } else {
          console.error("User role not found");
        }
      }
    } catch (e) {
      console.error("Error loading user:", e);
    }
  };

  const fetchConversations = async () => {
    if (!currentUserData?.role_id) return;

    try {
      // 1. Get my conversation participations
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation:conversations (
            *,
            conversation_participants (
              participant_role_id,
              user_roles (
                id,
                user_profiles (
                  full_name,
                  avatar_url
                )
              )
            )
          )
        `,
        )
        .eq("participant_role_id", currentUserData.role_id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false }); // Ideally order by conversation.last_message_at

      if (error) throw error;

      // 2. Transform data
      const formattedConversations: Conversation[] = data.map((item: any) => {
        const convo = item.conversation;
        // Find the "other" participant
        const otherParticipant = convo.conversation_participants.find(
          (p: any) => p.participant_role_id !== currentUserData.role_id,
        )?.user_roles;

        return {
          ...convo,
          other_participant: otherParticipant,
        };
      });

      // Sort by last message time locally since Supabase join sorting is tricky
      formattedConversations.sort((a, b) => {
        const timeA = a.last_message_at
          ? new Date(a.last_message_at).getTime()
          : 0;
        const timeB = b.last_message_at
          ? new Date(b.last_message_at).getTime()
          : 0;
        return timeB - timeA;
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUserData?.role_id) {
      fetchConversations();

      // Realtime subscription for list updates (optional but good)
      // For simplicity in this step, we rely on focus effect or pull to refresh
    }
  }, [currentUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [currentUserData]);

  const getAvatarUrl = (filename: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/profile/avatar/${filename}`;
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const otherUser = item.other_participant;
    const profile = otherUser?.user_profiles;

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-gray-300 m-2 rounded-xl bg-card"
        onPress={() => router.push(`/(protected)/chat/${item.id}`)}
      >
        {/* Avatar */}
        <View className="relative">
          <Image
            source={{
              uri:
                getAvatarUrl(profile?.avatar_url || "") ||
                "https://ui-avatars.com/api/?name=" +
                  (profile?.full_name || "User"),
            }}
            className="w-14 h-14 rounded-full bg-gray-200"
          />
          {item.is_active && (
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-base font-bold text-gray-900">
              {profile?.full_name || "Pet Lover"}
            </Text>
            <Text className="text-xs text-gray-400">
              {item.last_message_at
                ? dayjs(item.last_message_at).fromNow()
                : ""}
            </Text>
          </View>

          <Text
            className="text-sm text-gray-500"
            numberOfLines={1}
            style={{
              fontWeight:
                item.last_message_sender_role_id !== currentUserData?.role_id
                  ? "normal"
                  : "normal",
            }}
            // Add bold logic if 'is_read' was tracked per participant in the list query
          >
            {item.last_message_sender_role_id === currentUserData?.role_id
              ? "Siz: "
              : ""}
            {item.last_message_content || "Sohbete başlayın 👋"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Mesajlar</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 px-10">
              <Ionicons name="chatbubbles-outline" size={64} color="#E5E7EB" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                Henüz hiç mesajınız yok.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

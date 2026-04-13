import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
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
import { useConversations } from "@/hooks/useConversations";
import { PetifySpinner } from "@/components/PetifySpinner";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function MessagesScreen() {
  const router = useRouter();
  const [currentUserRoleId, setCurrentUserRoleId] = useState<string | null>(
    null,
  );

  // TanStack Query hook - otomatik real-time güncellemeler
  const {
    data: conversations = [],
    isLoading,
    refetch,
    isRefetching,
    currentUserRoleId: myRoleId, // Get current user's role ID for comparison
  } = useConversations(currentUserRoleId);

  // Load User Data
  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);

        // Get the user's role_id from user_roles table
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (roleData) {
          setCurrentUserRoleId(roleData.id);
        }
      }
    };
    loadUser();
  }, []);

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

          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {item.last_message_sender_role_id === myRoleId ? "Siz: " : ""}
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

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <PetifySpinner size={180} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#6366F1" />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color="#D1D5DB"
                />
                <Text className="text-gray-400 text-base mt-4">
                  Henüz mesajınız yok
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { Message, UserRole } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { instance } from "@/lib/api"; // Re-using axios instance
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams(); // Conversation ID
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);

  // Load User & Setup
  useEffect(() => {
    const init = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Get Role ID (Same logic as list screen, ideally centralized)
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (roleData) {
          const userDataWithRole = { ...user, role_id: roleData.id };
          setCurrentUserData(userDataWithRole);
          fetchOtherParticipant(userDataWithRole.role_id);
        }
      }
    };
    init();
  }, [id]);

  const fetchOtherParticipant = async (myRoleId: string) => {
    // Fetch conversation participants to find the other person
    const { data } = await supabase
      .from("conversation_participants")
      .select(
        `
            participant_role_id,
            user_roles (
                id,
                user_profiles (full_name, avatar_url)
            )
        `,
      )
      .eq("conversation_id", id);

    if (data) {
      const other = data.find((p: any) => p.participant_role_id !== myRoleId);
      if (other) {
        setOtherParticipant(other.user_roles);
      }
    }
  };

  // Fetch Messages & Subscribe
  useEffect(() => {
    if (!id) return;

    // 1. Initial Fetch
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }); // Oldest first for chat UI

      if (data) setMessages(data);
    };

    fetchMessages();

    // 2. Realtime Subscription
    const channel = supabase
      .channel(`chat_room_${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          // Scroll to bottom on new message
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUserData?.role_id) return;

    setSending(true);
    const contentToSend = inputText.trim();
    setInputText(""); // Optimistic clear

    try {
      // Use Backend API for sending
      await instance.post("/messages/send", {
        conversation_id: id,
        sender_role_id: currentUserData.role_id,
        content: contentToSend,
      });
      // Note: The realtime subscription will add the message to the list automatically
    } catch (error) {
      console.error("Error sending message:", error);
      // Determine if we should restore input text on failure?
    } finally {
      setSending(false);
    }
  };

  const getAvatarUrl = (filename: string) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    return `${baseUrl}/profile/avatar/${filename}`;
  };

  // Render Header
  const renderHeader = () => (
    <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="mr-3">
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>

      <Image
        source={{
          uri:
            getAvatarUrl(otherParticipant?.user_profiles?.avatar_url) ||
            "https://ui-avatars.com/api/?name=User",
        }}
        className="w-10 h-10 rounded-full bg-gray-200"
      />
      <View className="ml-3">
        <Text className="font-bold text-gray-900 text-base">
          {otherParticipant?.user_profiles?.full_name || "Pet Friend"}
        </Text>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_role_id === currentUserData?.role_id;

    return (
      <View
        className={`flex-row mb-3 px-4 ${isMe ? "justify-end" : "justify-start"}`}
      >
        {!isMe && (
          // Show tiny avatar for received messages could be nice, currently skipped for simplicity
          <View className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden items-center justify-center">
            <Text className="text-xs">
              {otherParticipant?.user_profiles?.full_name?.charAt(0)}
            </Text>
          </View>
        )}

        <View
          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
            isMe ? "bg-primary rounded-br-none" : "bg-gray-100 rounded-bl-none"
          }`}
        >
          {/* Image Support Placeholder */}
          {item.message_type === "image" && (
            <Text
              className={`italic mb-1 ${isMe ? "text-white/80" : "text-gray-500"}`}
            >
              [Görsel]
            </Text>
          )}

          <Text
            className={`text-[15px] ${isMe ? "text-white" : "text-gray-800"}`}
          >
            {item.content}
          </Text>
          <Text
            className={`text-[10px] mt-1 text-right ${
              isMe ? "text-white/70" : "text-gray-400"
            }`}
          >
            {dayjs(item.created_at).format("HH:mm")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1">
        {renderHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 20 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View className="p-3 bg-white border-t border-gray-100 flex-row items-end pb-8">
            <TouchableOpacity className="p-2 mr-2">
              <Ionicons name="add-circle-outline" size={28} color="#9CA3AF" />
            </TouchableOpacity>

            <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 min-h-[44px] flex-row items-center border border-gray-200 justify-center">
              <TextInput
                className="flex-1 text-base items-center justify-center text-gray-800 max-h-32"
                placeholder="Mesaj yazın..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={inputText}
                onChangeText={setInputText}
              />
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              disabled={sending || !inputText.trim()}
              className={`ml-3 p-3 rounded-full ${inputText.trim() ? "bg-primary" : "bg-gray-300"}`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

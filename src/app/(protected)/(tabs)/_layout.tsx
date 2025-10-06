import { Tabs } from "expo-router";
import { useAuthStore } from "../../../stores";

export default function TabsLayout() {
  const { user } = useAuthStore();
  const roleType = user?.role_type;

  switch (roleType) {
    case "pet_owner":
      return (
        <Tabs>
          <Tabs.Screen name="index" options={{ headerShown: false }} />
        </Tabs>
      );
  }

  // return (
  //   <Tabs>
  //     <Tabs.Screen name="index" options={{ headerShown: false }} />
  //   </Tabs>
  // );
}

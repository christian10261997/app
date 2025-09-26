import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Stack } from "expo-router/stack";
import { Image, TouchableOpacity } from "react-native";

export default function HomeFLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "green",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerTitle: () => <Image source={require("../../assets/images/kitchenpalLogo.png")} style={{ width: 130, height: 40, resizeMode: "contain" }} />,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/home/help")} style={{ padding: 8, marginRight: 8 }}>
              <Ionicons name="help-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

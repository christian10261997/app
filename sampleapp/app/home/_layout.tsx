import { Ionicons } from "@expo/vector-icons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Image } from "react-native";

export default function HomeFLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerPosition: "right",
        headerStyle: {
          backgroundColor: "green",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => <DrawerToggleButton tintColor="white" />,
        headerLeft: () => null,
      }}>
      <Drawer.Screen name="subscription" options={{ title: "Subscription", drawerIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="profile" options={{ title: "Profile", drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />

      <Drawer.Screen name="logout" options={{ title: "Logout", drawerIcon: ({ color, size }) => <Ionicons name="log-out" size={size} color={color} /> }} />

      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Home",
          headerTitle: () => <Image source={require("../../assets/images/kitchenpalLogo.png")} style={{ width: 130, height: 40, resizeMode: "contain" }} />,
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}

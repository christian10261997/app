import { Tabs } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    
    <Tabs
      screenOptions={{
        headerShown: false,
        
        tabBarStyle: {
          backgroundColor: 'green',
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: '#cfcfcf',
      }}
    >
      <Tabs.Screen
        name="recipe"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="save" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="firebase"
        options={{
          title: 'Firebase',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


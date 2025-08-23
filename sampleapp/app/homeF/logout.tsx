import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';

export default function Logout() {
  const { logout } = useAuthContext();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } finally {
        router.replace('/login');
      }
    };
    performLogout();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="green" />
    </View>
  );
}
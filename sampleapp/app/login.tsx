import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 state for show/hide
  const { signIn } = useAuthContext();

  // Temporary Admin Account
  const ADMIN_EMAIL = "admin";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      Alert.alert('Welcome Admin!', 'Login successful!');
      router.push('/admin/dashboard'); 
      return;
    }

    const result = await signIn(email.trim(), password.trim());
    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      router.push('/homeF/home');
    } else {
      Alert.alert('Login failed', result.error || 'Please try again.');
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgotPassword');
  };  

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <ImageBackground 
      source={require('../assets/images/front1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/kitchenpalLogo.png')} 
            style={{width: 250, height: 250, alignSelf: 'center'}}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Password Input with Show/Hide Toggle */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // 👈 toggle here
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="gray"
                style={{ marginLeft: -40, marginTop: 15 }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.buttonText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUp} onPress={handleSignUp}>
            <Text style={styles.signUpText}>Sign up?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: 'lightgreen',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 0,
    marginRight: 1,
  },
  signUp: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

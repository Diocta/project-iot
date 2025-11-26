import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

// Prop untuk onLogin (ketika tombol Login ditekan) dan onGoBack (jika ada navigasi kembali)
interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: () => void;
  onGoBack?: () => void;
}

export default function LoginScreen({
  onLogin,
  onSignUp,
  onGoBack,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Animasi untuk konten utama
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animasi masuk (Fade In dan Slide Up)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    // Panggil fungsi onLogin dengan nilai email dan password
    onLogin(email, password);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      <LinearGradient
        colors={["#2563EB", "#3B82F6", "#60A5FA"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Circles (mengambil dari WelcomeScreen) */}
        <View style={styles.circleContainer}>
          <Animated.View style={[styles.circle1, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.circle2, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.circle3, { opacity: fadeAnim }]} />
        </View>

        {onGoBack && (
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your smart home devices.
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={20}
                color="rgba(255, 255, 255, 0.7)"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color="rgba(255, 255, 255, 0.7)"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button (menggunakan gaya yang sama dengan Continue Button) */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={!email || !password}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F0F9FF"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.loginText}>Log In</Text>
                <Ionicons name="log-in" size={24} color="#3B82F6" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onSignUp}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  gradient: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 10 : 60, // Sesuaikan dengan StatusBar
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -100,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    bottom: 100,
    left: -50,
  },
  circle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: height / 2,
    right: 20,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 50, // Tambahkan padding vertikal
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
    paddingVertical: 5,
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  loginButton: {
    width: "100%",
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

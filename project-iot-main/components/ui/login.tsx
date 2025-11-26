import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles/login.styles";

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
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
    if (email && password) {
      onLogin(email, password);
    }
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient
        colors={["#7C3AED", "#8B5CF6", "#A78BFA"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Circles */}
        <View style={styles.circleContainer}>
          <Animated.View style={[styles.circle1, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.circle2, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.circle3, { opacity: fadeAnim }]} />
        </View>

        {/* Back Button */}
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue managing your smart home
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="rgba(255, 255, 255, 0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="rgba(255, 255, 255, 0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, !isFormValid && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={!isFormValid}
            >
              <LinearGradient
                colors={isFormValid ? ["#FFFFFF", "#FAFAFA"] : ["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.5)"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.loginText, !isFormValid && styles.loginTextDisabled]}>
                  Sign In
                </Text>
                <Ionicons name="arrow-forward" size={24} color={isFormValid ? "#7C3AED" : "#A78BFA"} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

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
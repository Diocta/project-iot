import React, { useRef, useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/register.styles';

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string) => void;
  onSignIn: () => void;
}

export default function RegisterScreen({ onRegister, onSignIn }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleRegister = () => {
    if (name && email && password) {
      onRegister(name, email, password);
    }
  };

  const isFormValid = name.trim() && email.trim() && password.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient
        colors={['#7C3AED', '#8B5CF6', '#A78BFA']}
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
        <TouchableOpacity style={styles.backButton} onPress={onSignIn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join us and start managing your smart home today
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
              
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
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
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
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

              {/* Password Hint */}
              <Text style={styles.passwordHint}>
                Password must be at least 6 characters
              </Text>
            </View>
            
            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, !isFormValid && styles.registerButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.9}
              disabled={!isFormValid}
            >
              <LinearGradient
                colors={isFormValid ? ['#FFFFFF', '#FAFAFA'] : ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.registerTextButton, !isFormValid && styles.registerTextDisabled]}>
                  Create Account
                </Text>
                <Ionicons name="arrow-forward" size={24} color={isFormValid ? "#7C3AED" : "#A78BFA"} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={onSignIn}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up, you agree to our{'\n'}
              <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
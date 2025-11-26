import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles/welcome.styles';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F3FF']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="home" size={60} color="#7C3AED" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Sweet Home</Text>
          <Text style={styles.subtitle}>
            Control your home with ease. Experience smart living at your fingertips with intelligent automation
          </Text>

          {/* Feature Pills */}
          <View style={styles.features}>
            <View style={styles.featurePill}>
              <Ionicons name="bulb-outline" size={18} color="#FFA726" />
              <Text style={styles.featureText}>Smart Lighting</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="thermometer-outline" size={18} color="#42A5F5" />
              <Text style={styles.featureText}>Climate</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#66BB6A" />
              <Text style={styles.featureText}>Security</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="videocam-outline" size={18} color="#EC407A" />
              <Text style={styles.featureText}>Cameras</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>12+</Text>
              <Text style={styles.statLabel}>Devices</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Rooms</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Control</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={onContinue}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FAFAFA']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.continueText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={24} color="#7C3AED" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={onContinue}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}
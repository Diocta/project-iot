import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/SecurityCamera.styles';

// Configuration
const SERVER_URL = 'http://10.218.21.141:5000'; // Ganti dengan IP server Anda

interface ThreatInfo {
  level: string;
  score: number;
  reasons: string[];
  authorized_count: number;
  unauthorized_count: number;
}

interface DetectionResult {
  timestamp: string;
  threat: ThreatInfo;
  faces: any[];
  people_count: number;
  intruder_count: number;
  stealing_count: number;
}

interface SystemStatus {
  is_armed: boolean;
  last_update: string;
  fps: number;
  total_events: number;
  current_detection: DetectionResult;
}

interface Statistics {
  total_events: number;
  threat_distribution: { [key: string]: number };
  recent_24h: number;
  authorized_detections: number;
  unauthorized_detections: number;
}

const SecurityCameraScreen: React.FC = () => {
  // State
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isArmed, setIsArmed] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refs
  const socketRef = useRef<Socket | null>(null);

  // Initialize
  useEffect(() => {
    initializeConnection();
    fetchStatus();
    fetchStatistics();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // WebSocket Connection
  const initializeConnection = () => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setStreamUrl(`${SERVER_URL}/api/video_feed?t=${Date.now()}`);
      socket.emit('request_status');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('detection_update', (data: DetectionResult) => {
      setDetection(data);
      setIsLoading(false);
    });

    socket.on('connected', () => {
      setIsConnected(true);
    });

    socketRef.current = socket;
  };

  // Fetch Status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/status`);
      const data: SystemStatus = await response.json();
      setStatus(data);
      setIsArmed(data.is_armed);
      if (data.current_detection) {
        setDetection(data.current_detection);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setIsLoading(false);
    }
  };

  // Fetch Statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/statistics`);
      const data: Statistics = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Toggle Armed Status
  const toggleArmed = async (value: boolean) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/arm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ armed: value }),
      });

      if (response.ok) {
        setIsArmed(value);
        Alert.alert(
          'Success',
          value ? 'System is now armed' : 'System is now disarmed'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update armed status');
    }
  };

  // Refresh Handler
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchStatistics()]);
    setRefreshing(false);
  };

  // Get Threat Color
  const getThreatColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
      CRITICAL: '#dc2626',
    };
    return colors[level] || '#6b7280';
  };

  // Get Threat Icon
  const getThreatIcon = (level: string): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      LOW: 'shield-checkmark',
      MEDIUM: 'warning',
      HIGH: 'alert',
      CRITICAL: 'alert-circle',
    };
    return icons[level] || 'help-circle';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="videocam" size={28} color="#fff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Security Camera</Text>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isConnected ? '#10b981' : '#ef4444' },
                  ]}
                />
                <Text style={styles.statusText}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.armedLabel}>Armed</Text>
            <Switch
              value={isArmed}
              onValueChange={toggleArmed}
              trackColor={{ false: '#64748b', true: '#10b981' }}
              thumbColor={isArmed ? '#fff' : '#f1f5f9'}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Video Stream */}
        <View style={styles.streamContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Connecting to camera...</Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: streamUrl }}
                style={styles.streamImage}
                resizeMode="contain"
              />
              {!isConnected && (
                <View style={styles.disconnectedOverlay}>
                  <Ionicons name="videocam-off" size={48} color="#ef4444" />
                  <Text style={styles.disconnectedText}>Camera Offline</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Threat Level Card */}
        {detection && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name={getThreatIcon(detection.threat.level)}
                size={24}
                color={getThreatColor(detection.threat.level)}
              />
              <Text style={styles.cardTitle}>Threat Level</Text>
            </View>

            <View
              style={[
                styles.threatBadge,
                { backgroundColor: getThreatColor(detection.threat.level) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.threatLevel,
                  { color: getThreatColor(detection.threat.level) },
                ]}
              >
                {detection.threat.level}
              </Text>
              <Text style={styles.threatScore}>
                Score: {detection.threat.score}
              </Text>
            </View>

            {detection.threat.reasons.length > 0 && (
              <View style={styles.reasonsList}>
                {detection.threat.reasons.map((reason, index) => (
                  <Text key={index} style={styles.reasonText}>
                    • {reason}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Detection Stats Card */}
        {detection && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={24} color="#3b82f6" />
              <Text style={styles.cardTitle}>Current Detections</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="person" size={32} color="#10b981" />
                <Text style={styles.statValue}>{detection.people_count}</Text>
                <Text style={styles.statLabel}>People</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark" size={32} color="#3b82f6" />
                <Text style={styles.statValue}>
                  {detection.threat.authorized_count}
                </Text>
                <Text style={styles.statLabel}>Authorized</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="warning" size={32} color="#f59e0b" />
                <Text style={styles.statValue}>
                  {detection.threat.unauthorized_count}
                </Text>
                <Text style={styles.statLabel}>Unknown</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="alert-circle" size={32} color="#ef4444" />
                <Text style={styles.statValue}>{detection.intruder_count}</Text>
                <Text style={styles.statLabel}>Intruders</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recognized Faces Card */}
        {detection && detection.faces.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="body" size={24} color="#8b5cf6" />
              <Text style={styles.cardTitle}>Recognized Faces</Text>
            </View>

            {detection.faces.map((face, index) => (
              <View key={index} style={styles.faceItem}>
                <View
                  style={[
                    styles.faceStatusDot,
                    {
                      backgroundColor:
                        face.status === 'AUTHORIZED' ? '#10b981' : '#ef4444',
                    },
                  ]}
                />
                <View style={styles.faceInfo}>
                  <Text style={styles.faceName}>{face.name}</Text>
                  <Text style={styles.faceRole}>{face.role}</Text>
                </View>
                <Text style={styles.faceConfidence}>
                  {(face.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Statistics Card */}
        {statistics && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={24} color="#06b6d4" />
              <Text style={styles.cardTitle}>Statistics</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>
                  {statistics.total_events}
                </Text>
                <Text style={styles.statBoxLabel}>Total Events</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{statistics.recent_24h}</Text>
                <Text style={styles.statBoxLabel}>Last 24h</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statBoxValue, { color: '#10b981' }]}>
                  {statistics.authorized_detections}
                </Text>
                <Text style={styles.statBoxLabel}>Authorized</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statBoxValue, { color: '#ef4444' }]}>
                  {statistics.unauthorized_detections}
                </Text>
                <Text style={styles.statBoxLabel}>Unauthorized</Text>
              </View>
            </View>
          </View>
        )}

        {/* System Info Card */}
        {status && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#64748b" />
              <Text style={styles.cardTitle}>System Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>FPS:</Text>
              <Text style={styles.infoValue}>{status.fps.toFixed(1)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Update:</Text>
              <Text style={styles.infoValue}>
                {new Date(status.last_update).toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Events:</Text>
              <Text style={styles.infoValue}>{status.total_events}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SecurityCameraScreen;
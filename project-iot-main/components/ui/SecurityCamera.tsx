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
  TouchableOpacity,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/SecurityCamera.styles';

const SERVER_URL = 'http://10.218.21.141:5000';

interface ThreatInfo {
  level: string;
  score: number;
  reasons: string[];
  authorized_count: number;
  unauthorized_count: number;
  has_intruder: boolean;
  has_stealing: boolean;
}

interface FaceInfo {
  person_id: string;
  name: string;
  role: string;
  confidence: number;
  status: string;
}

interface DetectionResult {
  timestamp: string;
  threat: ThreatInfo;
  faces: FaceInfo[];
  people_count: number;
  intruder_count: number;
  stealing_count: number;
  fps: number;
  process_time: number;
}

interface SystemStatus {
  is_armed: boolean;
  last_update: string;
  fps: number;
  total_events: number;
  current_detection: DetectionResult;
  frames_received: number;
}

interface Statistics {
  total_events: number;
  threat_distribution: { [key: string]: number };
  recent_24h: number;
  authorized_detections: number;
  unauthorized_detections: number;
}

const SecurityCameraScreen: React.FC = () => {
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isArmed, setIsArmed] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const socketRef = useRef<Socket | null>(null);

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

  const initializeConnection = () => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✓ Connected to server');
      setIsConnected(true);
      setStreamUrl(`${SERVER_URL}/api/video_feed?t=${Date.now()}`);
      socket.emit('request_status');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('detection_update', (data: DetectionResult) => {
      console.log('📊 Detection update:', data);
      setDetection(data);
      setIsLoading(false);
    });

    socketRef.current = socket;
  };

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

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/statistics`);
      const data: Statistics = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

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
          value ? 'System Armed 🛡️' : 'System Disarmed'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update armed status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchStatistics()]);
    setRefreshing(false);
  };

  const getThreatColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
      CRITICAL: '#dc2626',
    };
    return colors[level] || '#6b7280';
  };

  const getThreatIcon = (level: string): keyof typeof Ionicons.glyphMap => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      LOW: 'shield-checkmark',
      MEDIUM: 'warning',
      HIGH: 'alert',
      CRITICAL: 'alert-circle',
    };
    return icons[level] || 'help-circle';
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.compactHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={styles.headerTitle}>Security Monitor</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusDot, { 
              backgroundColor: isConnected ? '#10b981' : '#ef4444' 
            }]} />
            <Switch
              value={isArmed}
              onValueChange={toggleArmed}
              trackColor={{ false: '#475569', true: '#10b981' }}
              thumbColor="#fff"
              style={styles.switch}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Live Stream Card */}
        <View style={styles.streamCard}>
          {isLoading ? (
            <View style={styles.loadingView}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Connecting...</Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: streamUrl }}
                style={styles.streamImage}
                resizeMode="cover"
              />
              {!isConnected && (
                <View style={styles.offlineOverlay}>
                  <Ionicons name="videocam-off" size={40} color="#ef4444" />
                  <Text style={styles.offlineText}>Camera Offline</Text>
                </View>
              )}
              {detection && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveRedDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                  <Text style={styles.fpsText}>{detection.fps} FPS</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Threat Status Card */}
        {detection && (
          <View style={styles.modernCard}>
            <View style={styles.threatHeader}>
              <View style={styles.threatHeaderLeft}>
                <Ionicons
                  name={getThreatIcon(detection.threat.level)}
                  size={28}
                  color={getThreatColor(detection.threat.level)}
                />
                <View style={styles.threatHeaderText}>
                  <Text style={styles.cardLabel}>Security Status</Text>
                  <Text style={[
                    styles.threatLevelText,
                    { color: getThreatColor(detection.threat.level) }
                  ]}>
                    {detection.threat.level}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.scoreBadge,
                { backgroundColor: getThreatColor(detection.threat.level) + '20' }
              ]}>
                <Text style={[
                  styles.scoreText,
                  { color: getThreatColor(detection.threat.level) }
                ]}>
                  {detection.threat.score}
                </Text>
              </View>
            </View>

            {detection.threat.reasons.length > 0 && (
              <View style={styles.reasonsContainer}>
                {detection.threat.reasons.map((reason, index) => (
                  <View key={index} style={styles.reasonItem}>
                    <Ionicons 
                      name={reason.includes('✓') ? 'checkmark-circle' : 'information-circle'} 
                      size={16} 
                      color={reason.includes('✓') ? '#10b981' : '#64748b'} 
                    />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quick Stats Grid */}
        {detection && (
          <View style={styles.statsGrid}>
            <View style={[styles.quickStatCard, { borderLeftColor: '#10b981' }]}>
              <Ionicons name="people" size={24} color="#10b981" />
              <Text style={styles.quickStatValue}>{detection.people_count}</Text>
              <Text style={styles.quickStatLabel}>People</Text>
            </View>

            <View style={[styles.quickStatCard, { borderLeftColor: '#3b82f6' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
              <Text style={styles.quickStatValue}>{detection.threat.authorized_count}</Text>
              <Text style={styles.quickStatLabel}>Authorized</Text>
            </View>

            <View style={[styles.quickStatCard, { borderLeftColor: '#f59e0b' }]}>
              <Ionicons name="person" size={24} color="#f59e0b" />
              <Text style={styles.quickStatValue}>{detection.threat.unauthorized_count}</Text>
              <Text style={styles.quickStatLabel}>Unknown</Text>
            </View>

            <View style={[styles.quickStatCard, { borderLeftColor: '#ef4444' }]}>
              <Ionicons name="warning" size={24} color="#ef4444" />
              <Text style={styles.quickStatValue}>{detection.intruder_count}</Text>
              <Text style={styles.quickStatLabel}>Intruders</Text>
            </View>
          </View>
        )}

        {/* Detection Details Card */}
        {detection && (
          <View style={styles.modernCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={20} color="#64748b" />
              <Text style={styles.cardTitle}>Detection Details</Text>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Stealing Activity</Text>
                <View style={styles.detailValue}>
                  <Ionicons 
                    name={detection.threat.has_stealing ? 'close-circle' : 'checkmark-circle'} 
                    size={20} 
                    color={detection.threat.has_stealing ? '#ef4444' : '#10b981'} 
                  />
                  <Text style={[
                    styles.detailText,
                    { color: detection.threat.has_stealing ? '#ef4444' : '#10b981' }
                  ]}>
                    {detection.threat.has_stealing ? 'Detected' : 'None'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Masked Person</Text>
                <View style={styles.detailValue}>
                  <Ionicons 
                    name={detection.threat.has_intruder ? 'close-circle' : 'checkmark-circle'} 
                    size={20} 
                    color={detection.threat.has_intruder ? '#ef4444' : '#10b981'} 
                  />
                  <Text style={[
                    styles.detailText,
                    { color: detection.threat.has_intruder ? '#ef4444' : '#10b981' }
                  ]}>
                    {detection.threat.has_intruder ? 'Detected' : 'None'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Process Time</Text>
                <View style={styles.detailValue}>
                  <Ionicons name="time" size={20} color="#64748b" />
                  <Text style={styles.detailText}>{detection.process_time}s</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Last Update</Text>
                <View style={styles.detailValue}>
                  <Ionicons name="time-outline" size={20} color="#64748b" />
                  <Text style={styles.detailText}>{formatTimestamp(detection.timestamp)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recognized Faces Card */}
        {detection && detection.faces.length > 0 && (
          <View style={styles.modernCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={20} color="#8b5cf6" />
              <Text style={styles.cardTitle}>Recognized People</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{detection.faces.length}</Text>
              </View>
            </View>

            {detection.faces.map((face, index) => (
              <View key={index} style={styles.faceCard}>
                <View style={[
                  styles.faceStatusIndicator,
                  { backgroundColor: face.status === 'AUTHORIZED' ? '#10b981' : '#ef4444' }
                ]} />
                <View style={styles.faceContent}>
                  <View style={styles.faceInfo}>
                    <Text style={styles.faceName}>{face.name}</Text>
                    <Text style={styles.faceRole}>{face.role}</Text>
                  </View>
                  <View style={styles.faceConfidenceContainer}>
                    <Text style={[
                      styles.faceConfidence,
                      { color: face.status === 'AUTHORIZED' ? '#10b981' : '#ef4444' }
                    ]}>
                      {(face.confidence * 100).toFixed(0)}%
                    </Text>
                    <Text style={styles.faceStatus}>{face.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Statistics Card */}
        {statistics && (
          <View style={styles.modernCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={20} color="#06b6d4" />
              <Text style={styles.cardTitle}>Event Statistics</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{statistics.total_events}</Text>
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

        {/* System Info Footer */}
        {status && (
          <View style={styles.footerCard}>
            <Ionicons name="server" size={16} color="#64748b" />
            <Text style={styles.footerText}>
              System Active • {status.total_events} Total Events • {status.frames_received} Frames
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default SecurityCameraScreen;
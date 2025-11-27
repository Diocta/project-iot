import BottomNav from "@/components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles as styles } from "../styles";

interface ProfileScreenProps {
  onLogout?: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => onLogout?.(),
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Edit profile feature coming soon!");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER WITH GRADIENT */}
        <LinearGradient
          colors={["#7C3AED", "#8B5CF6", "#A78BFA"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require("@/assets/images/splash-icon.png")}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatarBtn}>
                  <Ionicons name="camera" size={16} color="#7C3AED" />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Diocta</Text>
                <Text style={styles.profileEmail}>diocta@smarthome.com</Text>

                <TouchableOpacity
                  style={styles.editProfileBtn}
                  onPress={handleEditProfile}
                >
                  <Ionicons name="create-outline" size={16} color="#7C3AED" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* STATS SECTION */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#EDE9FE" }]}
            >
              <Ionicons name="home" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>

          <View style={styles.statBox}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#FFF3E0" }]}
            >
              <Ionicons name="hardware-chip" size={24} color="#FFA726" />
            </View>
            <Text style={styles.statNumber}>32</Text>
            <Text style={styles.statLabel}>Devices</Text>
          </View>

          <View style={styles.statBox}>
            <View
              style={[styles.statIconContainer, { backgroundColor: "#E8F5E9" }]}
            >
              <Ionicons name="flash" size={24} color="#66BB6A" />
            </View>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#EDE9FE" }]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#7C3AED"
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>
                    Receive alerts and updates
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={notificationsEnabled ? "#7C3AED" : "#f4f3f4"}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#E3F2FD" }]}
                >
                  <Ionicons name="moon-outline" size={22} color="#42A5F5" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingSubtitle}>
                    Switch to dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={darkModeEnabled ? "#7C3AED" : "#f4f3f4"}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#FCE4EC" }]}
                >
                  <Ionicons name="mic-outline" size={22} color="#EC407A" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Voice Control</Text>
                  <Text style={styles.settingSubtitle}>
                    Enable voice commands
                  </Text>
                </View>
              </View>
              <Switch
                value={voiceControlEnabled}
                onValueChange={setVoiceControlEnabled}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={voiceControlEnabled ? "#7C3AED" : "#f4f3f4"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* GENERAL SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#FFF3E0" }]}
                >
                  <Ionicons name="person-outline" size={22} color="#FFA726" />
                </View>
                <Text style={styles.menuTitle}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#E8F5E9" }]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color="#66BB6A"
                  />
                </View>
                <Text style={styles.menuTitle}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#E3F2FD" }]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color="#42A5F5"
                  />
                </View>
                <Text style={styles.menuTitle}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[styles.settingIcon, { backgroundColor: "#FFF9C4" }]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#FDD835"
                  />
                </View>
                <Text style={styles.menuTitle}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* APP VERSION */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        <View style={{ height: 90 }} />
      </ScrollView>
      {/* Shared Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

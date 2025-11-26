import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },

  // Header with Gradient
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 100,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerContent: {
    paddingHorizontal: 25,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 30,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
  },

  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F5F3FF",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },

  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-start",
  },

  editProfileText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7C3AED",
  },

  // Stats Section
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 25,
    marginTop: -50,
    marginBottom: 25,
    gap: 12,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Section
  section: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 15,
  },

  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },

  settingSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginHorizontal: 25,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 20,
  },
});

// refreshed
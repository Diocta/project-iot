import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    paddingTop: 50,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 25,
    marginBottom: 20,
  },

  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 5,
  },

  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },

  temp: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
  },

  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },

  profileBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  // Sweet Home Section
  sweetHomeSection: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },

  sweetHomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 15,
  },

  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quickAccessItem: {
    alignItems: "center",
    width: "23%",
  },

  quickAccessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  quickAccessText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },

  quickAccessStatus: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // Rooms Section
  roomsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  seeAllText: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
  },

  roomsGrid: {
    paddingHorizontal: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  roomCard: {
    width: "48%",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    minHeight: 120,
  },

  roomCardSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  roomName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },

  roomDevices: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },

  // Devices Section
  devicesHeader: {
    paddingHorizontal: 25,
    marginBottom: 15,
  },

  grid: {
    paddingHorizontal: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  deviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },

  cardStatus: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },

  modalText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
    color: "#1F2937",
  },

  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 10,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  micBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#7C3AED",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
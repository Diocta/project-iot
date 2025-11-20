import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F3FA",
    paddingTop: 50,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
  },

  name: {
    fontSize: 32,
    fontWeight: "800",
  },

  bellBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#0066FF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionTitle: {
    marginTop: 15,
    marginLeft: 25,
    fontSize: 18,
    fontWeight: "700",
  },

  infoRow: {
    marginTop: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  weatherBox: {
    alignItems: "center",
  },

  weatherIcon: {
    width: 50,
    height: 50,
  },

  weatherText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
  },

  tempCenter: {
    alignItems: "center",
  },

  tempNumber: {
    fontSize: 28,
    fontWeight: "800",
  },

  tempLabel: {
    fontSize: 14,
    opacity: 0.7,
  },

  tempRight: {
    alignItems: "center",
  },

  roomTabRow: {
    marginTop: 20,
    paddingLeft: 20,
  },

  roomBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#DCE7F3",
    borderRadius: 20,
    marginRight: 10,
  },

  roomBtnActive: {
    backgroundColor: "#fff",
  },

  roomBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },

  roomBtnTextActive: {
    color: "#000",
  },

  grid: {
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
  },

  cardIcon: {
    width: 45,
    height: 45,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  cardSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 10,
  },

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
    borderColor: "#ddd",
  },

  navItem: {
    alignItems: "center",
  },

  navLabel: {
    fontSize: 12,
    opacity: 0.5,
  },

  navLabelActive: {
    fontSize: 12,
    color: "#0066FF",
    fontWeight: "700",
  },

  micBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#0066FF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    elevation: 5,
  },
});

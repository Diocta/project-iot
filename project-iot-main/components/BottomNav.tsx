import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  onMicPress?: () => void;
};

export default function BottomNav({ onMicPress }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/")}
        accessibilityLabel="Home"
      >
        <Ionicons
          name="home"
          size={26}
          color={pathname === "/" ? "#7C3AED" : "#9CA3AF"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/security")}
        accessibilityLabel="Security"
      >
        <Ionicons
          name="videocam"
          size={26}
          color={pathname === "/security" ? "#7C3AED" : "#9CA3AF"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.micBtn}
        onPress={onMicPress ? onMicPress : () => router.push("/")}
        accessibilityLabel="Mic"
      >
        <Ionicons name="mic" size={32} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/graphchart")}
        accessibilityLabel="Graph"
      >
        <Ionicons
          name="stats-chart"
          size={26}
          color={pathname === "/graphchart" ? "#7C3AED" : "#9CA3AF"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/profile")}
        accessibilityLabel="Profile"
      >
        <Ionicons
          name="person"
          size={26}
          color={pathname === "/profile" ? "#7C3AED" : "#9CA3AF"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
});

// components/ui/HomeScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  MQTT_TOPICS,
  mqttService,
  SensorData,
} from "../../services/mqttService";
import { styles } from "../styles/home.styles";

// Device state yang persisten (tidak reset saat ganti room)
interface DeviceStates {
  lamp1: boolean; // Living Room
  lamp2: boolean; // Bed Room 1
  lamp3: boolean; // Bed Room 2
  lamp4: boolean; // Garage
  garage: boolean; // false = open, true = closed
  clothesline: boolean; // false = inside, true = outside
}

const rooms = [
  {
    name: "Lamp Rooms",
    devices: 4,
    color: "#7C3AED",
    icon: "bulb-outline",
  },
  {
    name: "Garage",
    devices: 2,
    color: "#FFA726",
    icon: "car-sport-outline",
  },
  {
    name: "Clothesline",
    devices: 1,
    color: "#A8E6CF",
    icon: "shirt-outline",
  },
  {
    name: "Sensors",
    devices: 4,
    color: "#81D4FA",
    icon: "analytics-outline",
  },
];

export default function HomeScreen() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  // MQTT State
  const [mqttConnected, setMqttConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    rain: 1,
    light: 0,
    lastUpdate: new Date(),
  });

  // Device States (Persistent)
  const [deviceStates, setDeviceStates] = useState<DeviceStates>({
    lamp1: false,
    lamp2: false,
    lamp3: false,
    lamp4: false,
    garage: false,
    clothesline: false,
  });

  // Connect to MQTT on mount
  useEffect(() => {
    console.log("🚀 Starting MQTT connection...");

    mqttService.connect(
      () => {
        console.log("✅ Connected successfully!");
        setMqttConnected(true);
        Alert.alert("✅ Connected", "MQTT connected successfully!");
      },
      (error) => {
        console.error("❌ Connection error:", error);
        setMqttConnected(false);
        Alert.alert(
          "❌ Connection Failed",
          `${error.message}\n\nMake sure:\n• Mosquitto is running\n• WebSocket port 9001 is open\n• Same WiFi network`
        );
      }
    );

    // Subscribe to messages
    const unsubscribe = mqttService.onMessage((topic, message) => {
      // Update sensor data
      setSensorData((prev) => {
        const newData = { ...prev, lastUpdate: new Date() };

        switch (topic) {
          case MQTT_TOPICS.TEMP:
            newData.temperature = parseFloat(message) || 0;
            break;
          case MQTT_TOPICS.HUM:
            newData.humidity = parseFloat(message) || 0;
            break;
          case MQTT_TOPICS.RAIN:
            newData.rain = parseInt(message) || 1;
            break;
          case MQTT_TOPICS.LIGHT:
            newData.light = parseInt(message) || 0;
            break;
        }

        return newData;
      });

      // Handle device state feedback from IoT devices
      if (topic === MQTT_TOPICS.FEEDBACK_LAMP && message) {
        // Format: "lampNumber:state" (e.g., "1:1", "2:0")
        const parts = message.split(":");
        if (parts.length === 2) {
          const lampNumber = parseInt(parts[0]) as 1 | 2 | 3 | 4;
          const state = parts[1] === "1";
          setDeviceStates((prev) => ({
            ...prev,
            [`lamp${lampNumber}`]: state,
          }));
          console.log(
            `💡 Lamp ${lampNumber} feedback: ${state ? "ON" : "OFF"}`
          );
        }
      }

      if (topic === MQTT_TOPICS.FEEDBACK_GARASI) {
        // Mapping: 1 = open, 0 = closed (matches MQTT payloads)
        const isClosed = message === "0";
        setDeviceStates((prev) => ({
          ...prev,
          garage: isClosed,
        }));
        console.log(`🚗 Garage feedback: ${isClosed ? "CLOSED" : "OPEN"}`);
      }

      if (topic === MQTT_TOPICS.FEEDBACK_JEMURAN) {
        // Mapping: 1 = outside, 0 = inside
        const isOutside = message === "1";
        setDeviceStates((prev) => ({
          ...prev,
          clothesline: isOutside,
        }));
        console.log(
          `👕 Clothesline feedback: ${isOutside ? "OUTSIDE" : "INSIDE"}`
        );
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
      mqttService.disconnect();
    };
  }, []);

  const handleRoomSelect = (room: (typeof rooms)[0]) => {
    setSelectedRoom(room);
  };

  // Control individual lamp
  const toggleLamp = (lampNumber: 1 | 2 | 3 | 4) => {
    if (!mqttConnected) {
      Alert.alert("❌ Not Connected", "Please wait for MQTT connection");
      return;
    }

    const lampKey = `lamp${lampNumber}` as keyof DeviceStates;
    const newState = !deviceStates[lampKey];

    // Update local state immediately
    setDeviceStates((prev) => ({
      ...prev,
      [lampKey]: newState,
    }));

    // Send MQTT command (sesuai dengan pin ESP32)
    mqttService.publishLampControl(lampNumber, newState ? "on" : "off");
    console.log(`💡 Lamp ${lampNumber}: ${newState ? "ON" : "OFF"}`);
  };

  // Control garage
  const toggleGarage = () => {
    if (!mqttConnected) {
      Alert.alert("❌ Not Connected", "Please wait for MQTT connection");
      return;
    }

    const newState = !deviceStates.garage;

    setDeviceStates((prev) => ({
      ...prev,
      garage: newState,
    }));

    // false = open, true = closed
    mqttService.publishGarageControl(newState ? "close" : "open");
    console.log(`🚗 Garage: ${newState ? "CLOSED" : "OPEN"}`);
  };

  // Control clothesline
  const toggleClothesline = () => {
    if (!mqttConnected) {
      Alert.alert("❌ Not Connected", "Please wait for MQTT connection");
      return;
    }

    const newState = !deviceStates.clothesline;

    setDeviceStates((prev) => ({
      ...prev,
      clothesline: newState,
    }));

    // false = inside, true = outside
    mqttService.publishClotheslineControl(newState ? "open" : "close");
    console.log(`👕 Clothesline: ${newState ? "OUTSIDE" : "INSIDE"}`);
  };

  const handleMicPress = async () => {
    setModalVisible(true);
    setTranscript("Mendengar...");
    setLoading(true);

    try {
      const response = await fetch("http://10.203.142.56:5000/record");
      const data = await response.json();

      setTranscript(`Kamu bilang: ${data.heard || "Tidak terdengar"}`);
      setLoading(false);

      // Play the voice response if audio is provided
      if (data.audio) {
        try {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

          // Convert base64 to a Data URL
          const audioDataUrl = `data:audio/mp3;base64,${data.audio}`;

          const { sound } = await Audio.Sound.createAsync(
            { uri: audioDataUrl },
            { shouldPlay: true }
          );

          console.log("🔊 Playing voice response...");
          await sound.playAsync();

          // Wait for audio to finish before closing modal
          await new Promise((resolve) => {
            const interval = setInterval(async () => {
              const status = await sound.getStatusAsync();
              if (!status.isLoaded || status.didJustFinish) {
                clearInterval(interval);
                await sound.unloadAsync();
                resolve(null);
              }
            }, 100);
          });
        } catch (audioErr) {
          console.log("⚠️ Error playing audio:", audioErr);
        }
      }

      setTimeout(() => {
        Alert.alert(
          "Voice Command",
          `Action: ${data.action || "-"}\nDevice: ${
            data.device || "-"
          }\nResponse: ${data.response || ""}`
        );
        setModalVisible(false);
      }, 500);
    } catch (err) {
      console.log("Error:", err);
      setTranscript("Tidak dapat menghubungi server");
      setLoading(false);
      setTimeout(() => setModalVisible(false), 2000);
    }
  };

  const renderDevicesByRoom = () => {
    switch (selectedRoom.name) {
      case "Lamp Rooms":
        return (
          <>
            {/* Lamp 1 - Living Room */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons name="bulb" size={28} color="#FFA726" />
              </View>
              <Text style={styles.cardTitle}>Living Room</Text>
              <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
                {deviceStates.lamp1 ? "💡 On" : "⚫ Off"}
              </Text>
              <Switch
                value={deviceStates.lamp1}
                onValueChange={() => toggleLamp(1)}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={deviceStates.lamp1 ? "#7C3AED" : "#f4f3f4"}
              />
            </View>

            {/* Lamp 2 - Bed Room 1 */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#E1F5FE" },
                ]}
              >
                <Ionicons name="bulb" size={28} color="#42A5F5" />
              </View>
              <Text style={styles.cardTitle}>Bed Room 1</Text>
              <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
                {deviceStates.lamp2 ? "💡 On" : "⚫ Off"}
              </Text>
              <Switch
                value={deviceStates.lamp2}
                onValueChange={() => toggleLamp(2)}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={deviceStates.lamp2 ? "#7C3AED" : "#f4f3f4"}
              />
            </View>

            {/* Lamp 3 - Bed Room 2 */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#E0F2F1" },
                ]}
              >
                <Ionicons name="bulb" size={28} color="#26A69A" />
              </View>
              <Text style={styles.cardTitle}>Bed Room 2</Text>
              <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
                {deviceStates.lamp3 ? "💡 On" : "⚫ Off"}
              </Text>
              <Switch
                value={deviceStates.lamp3}
                onValueChange={() => toggleLamp(3)}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={deviceStates.lamp3 ? "#7C3AED" : "#f4f3f4"}
              />
            </View>

            {/* Lamp 4 - Garage */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#F3E5F5" },
                ]}
              >
                <Ionicons name="bulb" size={28} color="#AB47BC" />
              </View>
              <Text style={styles.cardTitle}>Garage</Text>
              <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
                {deviceStates.lamp4 ? "💡 On" : "⚫ Off"}
              </Text>
              <Switch
                value={deviceStates.lamp4}
                onValueChange={() => toggleLamp(4)}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={deviceStates.lamp4 ? "#7C3AED" : "#f4f3f4"}
              />
            </View>
          </>
        );

      case "Garage":
        return (
          <>
            {/* Garage Gate */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <Ionicons
                  name={
                    deviceStates.garage ? "lock-closed" : "lock-open-outline"
                  }
                  size={28}
                  color="#42A5F5"
                />
              </View>
              <Text style={styles.cardTitle}>Garage Gate</Text>
              <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
                {deviceStates.garage ? "🔒 Closed" : "🔓 Open"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: deviceStates.garage
                      ? "#10B981"
                      : "#EF4444",
                  },
                ]}
                onPress={toggleGarage}
              >
                <Ionicons
                  name={deviceStates.garage ? "arrow-up" : "arrow-down"}
                  size={20}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionButtonText}>
                  {deviceStates.garage ? "Buka" : "Tutup"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lamp Garage */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#F3E5F5" },
                ]}
              >
                <Ionicons name="bulb" size={28} color="#AB47BC" />
              </View>
              <Text style={styles.cardTitle}>Lamp Garage</Text>
              <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
                {deviceStates.lamp4 ? "💡 On" : "⚫ Off"}
              </Text>
              <Switch
                value={deviceStates.lamp4}
                onValueChange={() => toggleLamp(4)}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={deviceStates.lamp4 ? "#7C3AED" : "#f4f3f4"}
              />
            </View>
          </>
        );

      case "Clothesline":
        return (
          <View style={styles.card}>
            <View
              style={[
                styles.deviceIconContainer,
                { backgroundColor: "#F3E5F5" },
              ]}
            >
              <Ionicons
                name={
                  deviceStates.clothesline
                    ? "arrow-back-circle"
                    : "arrow-forward-circle"
                }
                size={28}
                color="#AB47BC"
              />
            </View>
            <Text style={styles.cardTitle}>Clothesline</Text>
            <Text style={[styles.cardStatus, { fontWeight: "600" }]}>
              {deviceStates.clothesline ? "⬅️ Outside" : "➡️ Inside"}
            </Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: deviceStates.clothesline
                    ? "#8B5CF6"
                    : "#F59E0B",
                },
              ]}
              onPress={toggleClothesline}
            >
              <Ionicons
                name={deviceStates.clothesline ? "arrow-forward" : "arrow-back"}
                size={20}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>
                {deviceStates.clothesline ? "Masukkan" : "Keluarkan"}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "Sensors":
        return (
          <>
            {/* Temperature */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#FFEBEE" },
                ]}
              >
                <Ionicons name="thermometer" size={28} color="#EF5350" />
              </View>
              <Text style={styles.cardTitle}>Temperature</Text>
              <Text
                style={[
                  styles.cardStatus,
                  { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
                ]}
              >
                {sensorData.temperature.toFixed(1)}
              </Text>
              <Text style={styles.cardStatus}>°C</Text>
            </View>

            {/* Humidity */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#E1F5FE" },
                ]}
              >
                <Ionicons name="water" size={28} color="#42A5F5" />
              </View>
              <Text style={styles.cardTitle}>Humidity</Text>
              <Text
                style={[
                  styles.cardStatus,
                  { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
                ]}
              >
                {sensorData.humidity.toFixed(0)}
              </Text>
              <Text style={styles.cardStatus}>%</Text>
            </View>

            {/* Rain Sensor */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="rainy" size={28} color="#66BB6A" />
              </View>
              <Text style={styles.cardTitle}>Rain Sensor</Text>
              <Text
                style={[
                  styles.cardStatus,
                  { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
                ]}
              >
                {sensorData.rain === 0 ? "🌧️ Rain" : "☀️ Dry"}
              </Text>
            </View>

            {/* Light Sensor */}
            <View style={styles.card}>
              <View
                style={[
                  styles.deviceIconContainer,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons name="sunny" size={28} color="#FFA726" />
              </View>
              <Text style={styles.cardTitle}>Light Sensor</Text>
              <Text
                style={[
                  styles.cardStatus,
                  { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
                ]}
              >
                {sensorData.light}
              </Text>
              <Text style={styles.cardStatus}>lux</Text>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Smart Home</Text>
            <View style={styles.weatherRow}>
              <Ionicons
                name={sensorData.rain === 0 ? "rainy" : "sunny"}
                size={20}
                color="#7C3AED"
              />
              <Text style={styles.temp}>
                {sensorData.temperature.toFixed(1)}°C
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <View
                style={[
                  { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
                  { backgroundColor: mqttConnected ? "#10B981" : "#EF4444" },
                ]}
              />
              <Text style={styles.subtitle}>
                {mqttConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileBtn}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* SENSOR OVERVIEW */}
        <View style={styles.sweetHomeSection}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={styles.sweetHomeTitle}>Sensor Status</Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              {formatTime(sensorData.lastUpdate)}
            </Text>
          </View>
          <View style={styles.quickAccessRow}>
            <View style={styles.quickAccessItem}>
              <View
                style={[styles.quickAccessIcon, { backgroundColor: "#FFEBEE" }]}
              >
                <Ionicons name="thermometer" size={24} color="#EF5350" />
              </View>
              <Text style={styles.quickAccessText}>Temp</Text>
              <Text style={styles.quickAccessStatus}>
                {sensorData.temperature.toFixed(1)}°C
              </Text>
            </View>

            <View style={styles.quickAccessItem}>
              <View
                style={[styles.quickAccessIcon, { backgroundColor: "#E1F5FE" }]}
              >
                <Ionicons name="water" size={24} color="#42A5F5" />
              </View>
              <Text style={styles.quickAccessText}>Humidity</Text>
              <Text style={styles.quickAccessStatus}>
                {sensorData.humidity.toFixed(0)}%
              </Text>
            </View>

            <View style={styles.quickAccessItem}>
              <View
                style={[styles.quickAccessIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Ionicons
                  name={sensorData.rain === 0 ? "rainy" : "sunny"}
                  size={24}
                  color={sensorData.rain === 0 ? "#42A5F5" : "#FFA726"}
                />
              </View>
              <Text style={styles.quickAccessText}>Weather</Text>
              <Text style={styles.quickAccessStatus}>
                {sensorData.rain === 0 ? "Rain" : "Dry"}
              </Text>
            </View>

            <View style={styles.quickAccessItem}>
              <View
                style={[styles.quickAccessIcon, { backgroundColor: "#FFF3E0" }]}
              >
                <Ionicons name="sunny" size={24} color="#FFA726" />
              </View>
              <Text style={styles.quickAccessText}>Light</Text>
              <Text style={styles.quickAccessStatus}>{sensorData.light}</Text>
            </View>
          </View>
        </View>

        {/* ROOMS */}
        <View style={styles.roomsHeader}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roomsGrid}>
          {rooms.map((room, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.roomCard,
                { backgroundColor: room.color },
                selectedRoom.name === room.name && styles.roomCardSelected,
              ]}
              onPress={() => handleRoomSelect(room)}
            >
              <Ionicons name={room.icon as any} size={32} color="#fff" />
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomDevices}>
                {room.devices} device{room.devices > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DEVICES */}
        <View style={styles.devicesHeader}>
          <Text style={styles.sectionTitle}>
            {selectedRoom.name === "Sensors"
              ? "Sensor Data"
              : `Devices in ${selectedRoom.name}`}
          </Text>
        </View>

        <View style={styles.grid}>{renderDevicesByRoom()}</View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {loading && <ActivityIndicator size="large" color="#7C3AED" />}
            <Text style={styles.modalText}>{transcript}</Text>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color="#7C3AED" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="videocam" size={26} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.micBtn} onPress={handleMicPress}>
          <Ionicons name="mic" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="stats-chart" size={26} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={26} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

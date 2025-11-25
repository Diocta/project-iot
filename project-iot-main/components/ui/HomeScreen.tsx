import { Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/home.styles";

const rooms = [
  { 
    name: "Bed Room", 
    devices: 7, 
    color: "#7C3AED", 
    icon: "bed-outline",
    deviceList: [
      { id: 1, name: "Night Lamp", type: "bulb", status: true, color: "#FFF3E0", iconColor: "#FFA726" },
      { id: 2, name: "AC", type: "snow", status: false, color: "#E1F5FE", iconColor: "#42A5F5" },
      { id: 3, name: "Smart TV", type: "tv", status: true, color: "#E0F2F1", iconColor: "#26A69A" },
      { id: 4, name: "Fan", type: "sync", status: false, color: "#F3E5F5", iconColor: "#AB47BC" },
    ]
  },
  { 
    name: "Kitchen Room", 
    devices: 5, 
    color: "#FFA726", 
    icon: "restaurant-outline",
    deviceList: [
      { id: 1, name: "Ceiling Light", type: "bulb", status: true, color: "#FFF3E0", iconColor: "#FFA726" },
      { id: 2, name: "Refrigerator", type: "snow", status: true, color: "#E1F5FE", iconColor: "#42A5F5" },
      { id: 3, name: "Exhaust Fan", type: "sync", status: false, color: "#F3E5F5", iconColor: "#AB47BC" },
      { id: 4, name: "Smart Plug", type: "power", status: true, color: "#E8F5E9", iconColor: "#66BB6A" },
    ]
  },
  { 
    name: "Dining Room", 
    devices: 8, 
    color: "#A8E6CF", 
    icon: "wine-outline",
    deviceList: [
      { id: 1, name: "Chandelier", type: "bulb", status: true, color: "#FFF3E0", iconColor: "#FFA726" },
      { id: 2, name: "Wall Light", type: "bulb", status: true, color: "#FFF9C4", iconColor: "#FDD835" },
      { id: 3, name: "AC", type: "snow", status: false, color: "#E1F5FE", iconColor: "#42A5F5" },
      { id: 4, name: "Music System", type: "volume-high", status: false, color: "#FCE4EC", iconColor: "#EC407A" },
    ]
  },
  { 
    name: "Office Room", 
    devices: 12, 
    color: "#81D4FA", 
    icon: "desktop-outline",
    deviceList: [
      { id: 1, name: "Desk Lamp", type: "bulb", status: true, color: "#FFF3E0", iconColor: "#FFA726" },
      { id: 2, name: "AC", type: "snow", status: true, color: "#E1F5FE", iconColor: "#42A5F5" },
      { id: 3, name: "Smart Speaker", type: "volume-high", status: false, color: "#FCE4EC", iconColor: "#EC407A" },
      { id: 4, name: "Monitor Light", type: "desktop", status: true, color: "#E0F2F1", iconColor: "#26A69A" },
    ]
  },
];

export default function HomeScreen() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [devices, setDevices] = useState(selectedRoom.deviceList);
  const [modalVisible, setModalVisible] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoomSelect = (room: typeof rooms[0]) => {
    setSelectedRoom(room);
    setDevices(room.deviceList);
  };

  const toggleDevice = (deviceId: number) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? { ...device, status: !device.status }
          : device
      )
    );
  };

  const handleMicPress = async () => {
    setModalVisible(true);
    setTranscript("Mendengar...");
    setLoading(true);

    try {
      const response = await fetch("http://10.218.19.147:5000/record");
      const data = await response.json();

      setTranscript(`Kamu bilang: ${data.heard || "Tidak terdengar"}`);
      setLoading(false);

      setTimeout(() => {
        alert(
          "Action: " + (data.action || "-") +
          "\nDevice: " + (data.device || "-")
        );
        setModalVisible(false);
      }, 1000);

    } catch (err) {
      console.log("Error:", err);
      setTranscript("Tidak dapat menghubungi server");
      setLoading(false);
      setTimeout(() => setModalVisible(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>10.28</Text>
            <View style={styles.weatherRow}>
              <Ionicons name="rainy" size={20} color="#7C3AED" />
              <Text style={styles.temp}>28°C</Text>
            </View>
            <Text style={styles.subtitle}>Today's Weather</Text>
          </View>

          <TouchableOpacity style={styles.profileBtn}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* SWEET HOME SECTION */}
        <View style={styles.sweetHomeSection}>
          <Text style={styles.sweetHomeTitle}>Sweet Home</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="open-outline" size={24} color="#42A5F5" />
              </View>
              <Text style={styles.quickAccessText}>Front Door</Text>
              <Text style={styles.quickAccessStatus}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="bulb" size={24} color="#FFA726" />
              </View>
              <Text style={styles.quickAccessText}>2 Lights</Text>
              <Text style={styles.quickAccessStatus}>On</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="videocam" size={24} color="#66BB6A" />
              </View>
              <Text style={styles.quickAccessText}>Cameras</Text>
              <Text style={styles.quickAccessStatus}>Off</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="wifi" size={24} color="#AB47BC" />
              </View>
              <Text style={styles.quickAccessText}>WiFi</Text>
              <Text style={styles.quickAccessStatus}>On</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ROOMS SECTION */}
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
                selectedRoom.name === room.name && styles.roomCardSelected
              ]}
              onPress={() => handleRoomSelect(room)}
            >
              <Ionicons name={room.icon as any} size={32} color="#fff" />
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomDevices}>{room.devices} devices</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DEVICES SECTION */}
        <View style={styles.devicesHeader}>
          <Text style={styles.sectionTitle}>Devices in {selectedRoom.name}</Text>
        </View>

        <View style={styles.grid}>
          {devices.map((device) => (
            <View key={device.id} style={styles.card}>
              <View style={[styles.deviceIconContainer, { backgroundColor: device.color }]}>
                <Ionicons name={device.type as any} size={28} color={device.iconColor} />
              </View>
              <Text style={styles.cardTitle}>{device.name}</Text>
              <Text style={styles.cardStatus}>{device.status ? 'On' : 'Off'}</Text>
              <Switch 
                value={device.status} 
                onValueChange={() => toggleDevice(device.id)}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={device.status ? '#7C3AED' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {loading && <ActivityIndicator size="large" color="#7C3AED" />}
            <Text style={styles.modalText}>{transcript}</Text>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color="#7C3AED" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="videocam" size={26} color="#9CA3AF" />
        </TouchableOpacity>

        {/* CENTER MIC BUTTON */}
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
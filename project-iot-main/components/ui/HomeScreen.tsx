import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from "react-native";
import { styles } from "../styles/home.styles";
import { Ionicons, Feather } from "@expo/vector-icons";

const rooms = ["Living Room", "Kitchen", "Bathroom", "Garage"];

export default function HomeScreen() {
  const [selectedRoom, setSelectedRoom] = useState("Living Room");
  const [device1, setDevice1] = useState(true);
  const [device2, setDevice2] = useState(false);
  const [device3, setDevice3] = useState(true);
  const [device4, setDevice4] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>HI,</Text>
            <Text style={styles.name}>DIOCTA</Text>
          </View>

          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* GENERAL INFORMATION TITLE */}
        <Text style={styles.sectionTitle}>General Information</Text>

        {/* WEATHER + TEMP INFO */}
        <View style={styles.infoRow}>
          {/* LEFT WEATHER */}
          <View style={styles.weatherBox}>
            <Image
              style={styles.weatherIcon}
              source={require("@/assets/images/splash-icon.png")}
            />
            <Text style={styles.weatherText}>Rainy</Text>
          </View>

          {/* CENTER TEMP */}
          <View style={styles.tempCenter}>
            <Text style={styles.tempNumber}>25°C</Text>
            <Text style={styles.tempLabel}>Indoor Temp.</Text>
          </View>

          {/* RIGHT TEMP */}
          <View style={styles.tempRight}>
            <Text style={styles.tempNumber}>25°C</Text>
            <Text style={styles.tempLabel}>Outdoor Temp.</Text>
          </View>
        </View>

        {/* ROOM TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomTabRow}>
          {rooms.map((room) => (
            <TouchableOpacity
              key={room}
              onPress={() => setSelectedRoom(room)}
              style={[
                styles.roomBtn,
                selectedRoom === room && styles.roomBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.roomBtnText,
                  selectedRoom === room && styles.roomBtnTextActive,
                ]}
              >
                {room}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DEVICE GRID */}
        <View style={styles.grid}>
          {/* DEVICE 1 */}
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Light Bulbs</Text>
            <Text style={styles.cardSubtitle}>Philips Fun 2</Text>
            <Switch value={device1} onValueChange={setDevice1} />
          </View>

          {/* DEVICE 2 */}
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Television</Text>
            <Text style={styles.cardSubtitle}>Xiaomi Smart Tv</Text>
            <Switch value={device2} onValueChange={setDevice2} />
          </View>

          {/* DEVICE 3 */}
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Light Bulbs</Text>
            <Text style={styles.cardSubtitle}>Philips Fun 2</Text>
            <Switch value={device3} onValueChange={setDevice3} />
          </View>

          {/* DEVICE 4 */}
          <View style={styles.card}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Light Bulbs</Text>
            <Text style={styles.cardSubtitle}>Philips Fun 2</Text>
            <Switch value={device4} onValueChange={setDevice4} />
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} />
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Feather name="camera" size={22} />
          <Text style={styles.navLabel}>Camera</Text>
        </TouchableOpacity>

        {/* CENTER MIC */}
        <TouchableOpacity style={styles.micBtn}>
          <Ionicons name="mic" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Feather name="bar-chart-2" size={22} />
          <Text style={styles.navLabel}>Graphchart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={22} />
          <Text style={styles.navLabel}>Setting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

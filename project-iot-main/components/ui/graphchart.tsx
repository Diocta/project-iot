import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { styles } from "../styles/graphchart.styles";

const screenWidth = Dimensions.get("window").width;

// Sample data - ganti dengan data real dari API/sensor Anda
const sensorData = {
  water: [
    { time: "00:00", value: 45 },
    { time: "04:00", value: 52 },
    { time: "08:00", value: 48 },
    { time: "12:00", value: 65 },
    { time: "16:00", value: 58 },
    { time: "20:00", value: 51 },
  ],
  temperature: [
    { time: "00:00", value: 24 },
    { time: "04:00", value: 23 },
    { time: "08:00", value: 26 },
    { time: "12:00", value: 30 },
    { time: "16:00", value: 28 },
    { time: "20:00", value: 25 },
  ],
  humidity: [
    { time: "00:00", value: 65 },
    { time: "04:00", value: 68 },
    { time: "08:00", value: 62 },
    { time: "12:00", value: 55 },
    { time: "16:00", value: 58 },
    { time: "20:00", value: 64 },
  ],
  light: [
    { time: "00:00", value: 0 },
    { time: "04:00", value: 5 },
    { time: "08:00", value: 45 },
    { time: "12:00", value: 95 },
    { time: "16:00", value: 75 },
    { time: "20:00", value: 10 },
  ],
};

const sensors = [
  {
    id: "water",
    name: "Water Sensor",
    icon: "water",
    color: "#42A5F5",
    bgColor: "#E3F2FD",
    unit: "%",
    currentValue: 51,
    status: "Normal",
  },
  {
    id: "temperature",
    name: "Temperature",
    icon: "thermometer",
    color: "#FFA726",
    bgColor: "#FFF3E0",
    unit: "°C",
    currentValue: 25,
    status: "Optimal",
  },
  {
    id: "humidity",
    name: "Humidity",
    icon: "water-outline",
    color: "#66BB6A",
    bgColor: "#E8F5E9",
    unit: "%",
    currentValue: 64,
    status: "Good",
  },
  {
    id: "light",
    name: "Light Sensor (LDR)",
    icon: "sunny",
    color: "#FDD835",
    bgColor: "#FFF9C4",
    unit: "%",
    currentValue: 10,
    status: "Low",
  },
];

export default function GraphChartScreen() {
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]);
  const [chartData, setChartData] = useState(sensorData.water);

  const handleSensorSelect = (sensor: typeof sensors[0]) => {
    setSelectedSensor(sensor);
    switch (sensor.id) {
      case "water":
        setChartData(sensorData.water);
        break;
      case "temperature":
        setChartData(sensorData.temperature);
        break;
      case "humidity":
        setChartData(sensorData.humidity);
        break;
      case "light":
        setChartData(sensorData.light);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Sensor</Text>
            <Text style={styles.subtitle}>Monitoring</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn}>
            <Ionicons name="refresh" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* SENSOR CARDS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sensorScroll}
        >
          {sensors.map((sensor) => (
            <TouchableOpacity
              key={sensor.id}
              style={[
                styles.sensorCard,
                selectedSensor.id === sensor.id && styles.sensorCardActive,
              ]}
              onPress={() => handleSensorSelect(sensor)}
            >
              <View style={[styles.sensorIconContainer, { backgroundColor: sensor.bgColor }]}>
                <Ionicons name={sensor.icon as any} size={28} color={sensor.color} />
              </View>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <View style={styles.sensorValueRow}>
                <Text style={[styles.sensorValue, { color: sensor.color }]}>
                  {sensor.currentValue}
                </Text>
                <Text style={styles.sensorUnit}>{sensor.unit}</Text>
              </View>
              <Text style={styles.sensorStatus}>{sensor.status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CHART SECTION */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{selectedSensor.name} History</Text>
            <View style={styles.timePeriodRow}>
              <TouchableOpacity style={styles.timePeriodBtn}>
                <Text style={styles.timePeriodText}>24H</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.timePeriodBtn, styles.timePeriodBtnActive]}>
                <Text style={[styles.timePeriodText, styles.timePeriodTextActive]}>7D</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timePeriodBtn}>
                <Text style={styles.timePeriodText}>30D</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CHART */}
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: chartData.map(d => d.time),
                datasets: [
                  {
                    data: chartData.map(d => d.value),
                    strokeWidth: 2,
                    color: (opacity = 1) => `rgba(${parseInt(selectedSensor.color.slice(1, 3), 16)}, ${parseInt(selectedSensor.color.slice(3, 5), 16)}, ${parseInt(selectedSensor.color.slice(5, 7), 16)}, ${opacity})`,
                  }
                ]
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#f0f0f0',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                strokeWidth: 2,
                useShadowColorFromDataset: true,
                decimalPlaces: 0,
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: selectedSensor.color
                }
              }}
              bezier
            />
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={[styles.statValue, { color: selectedSensor.color }]}>
                {(chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length).toFixed(1)}
                {selectedSensor.unit}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Max</Text>
              <Text style={[styles.statValue, { color: selectedSensor.color }]}>
                {Math.max(...chartData.map(d => d.value))}
                {selectedSensor.unit}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Min</Text>
              <Text style={[styles.statValue, { color: selectedSensor.color }]}>
                {Math.min(...chartData.map(d => d.value))}
                {selectedSensor.unit}
              </Text>
            </View>
          </View>
        </View>

        {/* SENSOR DETAILS */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Sensor Details</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sensor Type</Text>
              <Text style={styles.detailValue}>{selectedSensor.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: selectedSensor.bgColor }]}>
                <Text style={[styles.statusText, { color: selectedSensor.color }]}>
                  {selectedSensor.status}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Update</Text>
              <Text style={styles.detailValue}>2 minutes ago</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>Living Room</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}
import BottomNav from "@/components/BottomNav";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { styles } from "../styles/graphchart.styles";

const screenWidth = Dimensions.get("window").width;

// API Configuration
const API_BASE_URL = "http://10.203.142.56:3000"; // Backend server address

const sensors = [
  {
    id: "temperature",
    name: "Temperature",
    icon: "thermometer",
    color: "#FFA726",
    bgColor: "#FFF3E0",
    unit: "°C",
    dbField: "temperature",
    currentValue: 0,
    status: "Optimal",
  },
  {
    id: "humidity",
    name: "Humidity",
    icon: "water-outline",
    color: "#66BB6A",
    bgColor: "#E8F5E9",
    unit: "%",
    dbField: "humidity",
    currentValue: 0,
    status: "Good",
  },
  {
    id: "light",
    name: "Light Sensor (LDR)",
    icon: "sunny",
    color: "#FDD835",
    bgColor: "#FFF9C4",
    unit: "%",
    dbField: "light_level",
    currentValue: 0,
    status: "Low",
  },
  {
    id: "rain",
    name: "Rain Sensor",
    icon: "water",
    color: "#42A5F5",
    bgColor: "#E3F2FD",
    unit: "Status",
    dbField: "rain_status",
    currentValue: 0,
    status: "Normal",
  },
];

export default function GraphChartScreen() {
  // keep sensors in state so we can update their current values when data arrives
  const [sensorList, setSensorList] = useState(sensors);
  const [selectedSensorId, setSelectedSensorId] = useState(sensors[0].id);

  const selectedSensor = useMemo(
    () => sensorList.find((s) => s.id === selectedSensorId) || sensorList[0],
    [sensorList, selectedSensorId]
  );
  const [chartData, setChartData] = useState<
    Array<{ time: string; value: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("Connecting...");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<"24h" | "7d" | "30d">("7d");

  // Downsample large datasets for plotting to avoid over-plotting
  const downsample = (
    data: Array<{ time: string; value: number }>,
    maxPoints = 120
  ) => {
    if (!data || data.length <= maxPoints) return data;

    const bucketSize = Math.ceil(data.length / maxPoints);
    const buckets: Array<Array<{ time: string; value: number }>> = [];
    for (let i = 0; i < data.length; i += bucketSize) {
      buckets.push(data.slice(i, i + bucketSize));
    }

    return buckets.map((bucket) => {
      const avg = bucket.reduce((s, p) => s + p.value, 0) / bucket.length;
      // choose middle timestamp for label
      const mid = bucket[Math.floor(bucket.length / 2)];
      return { time: mid.time, value: parseFloat(avg.toFixed(2)) };
    });
  };

  // Memoize plotted data to avoid re-computing on each render
  const plottedData = useMemo(() => downsample(chartData, 120), [chartData]);

  // Create sparse labels for x-axis (show ~6 labels max)
  const chartLabels = useMemo(() => {
    if (!plottedData || plottedData.length === 0) return [];
    const maxLabels = 6;
    const step = Math.max(1, Math.ceil(plottedData.length / maxLabels));
    return plottedData.map((d, i) => (i % step === 0 ? d.time : ""));
  }, [plottedData]);

  // Fetch sensor history from database
  const fetchSensorHistory = async () => {
    try {
      setIsLoading(true);
      // Determine limit based on time period
      let limit = 24; // Default 24h
      if (timePeriod === "7d") limit = 168; // 7 days * 24 hours
      if (timePeriod === "30d") limit = 720; // 30 days * 24 hours

      const response = await fetch(
        `${API_BASE_URL}/api/sensor/history?limit=${limit}`
      );
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // Transform database data to chart format
        const processedData = result.data
          .reverse()
          .slice(-limit) // Last N records based on period
          .map((record: any, index: number) => {
            const timestamp = new Date(record.timestamp);
            const time = timestamp.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Get the field value for selected sensor
            const fieldName = selectedSensor.dbField;
            const value = record[fieldName] || 0;

            return {
              time,
              value: parseFloat(value),
            };
          });

        setChartData(processedData);

        // Update all sensors' currentValue from the latest record (if present)
        const latestRecord = result.data[result.data.length - 1];
        if (latestRecord) {
          setSensorList((prev) =>
            prev.map((s) => {
              const field = s.dbField;
              const raw = latestRecord[field];
              const val =
                raw !== undefined && raw !== null
                  ? parseFloat(raw)
                  : s.currentValue;
              return { ...s, currentValue: isNaN(val) ? s.currentValue : val };
            })
          );

          setLastUpdate(
            new Date(latestRecord.timestamp).toLocaleTimeString("id-ID")
          );
        }
        console.log(
          `✅ Fetched ${processedData.length} records for ${selectedSensor.name} (${timePeriod})`
        );
      } else {
        console.log("⚠️ No data received from server");
        setChartData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching sensor data:", error);
      Alert.alert(
        "Connection Error",
        `Failed to fetch data from server: ${error}`
      );
      setChartData([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    fetchSensorHistory();

    const interval = setInterval(() => {
      fetchSensorHistory();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedSensor, timePeriod]);

  const handleSensorSelect = (sensor: (typeof sensors)[0]) => {
    setSelectedSensorId(sensor.id);
    setIsLoading(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSensorHistory();
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
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Ionicons
              name={isRefreshing ? "hourglass" : "refresh"}
              size={24}
              color="#7C3AED"
            />
          </TouchableOpacity>
        </View>

        {/* Status indicator */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
            Last update: {lastUpdate} • Auto-refresh: Every 5s
          </Text>
        </View>

        {/* SENSOR CARDS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sensorScroll}
        >
          {sensorList.map((sensor) => (
            <TouchableOpacity
              key={sensor.id}
              style={[
                styles.sensorCard,
                selectedSensor.id === sensor.id && styles.sensorCardActive,
              ]}
              onPress={() => handleSensorSelect(sensor)}
            >
              <View
                style={[
                  styles.sensorIconContainer,
                  { backgroundColor: sensor.bgColor },
                ]}
              >
                <Ionicons
                  name={sensor.icon as any}
                  size={28}
                  color={sensor.color}
                />
              </View>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <View style={styles.sensorValueRow}>
                <Text style={[styles.sensorValue, { color: sensor.color }]}>
                  {sensor.currentValue.toFixed(1)}
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
              <TouchableOpacity
                style={[
                  styles.timePeriodBtn,
                  timePeriod === "24h" && styles.timePeriodBtnActive,
                ]}
                onPress={() => setTimePeriod("24h")}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    timePeriod === "24h" && styles.timePeriodTextActive,
                  ]}
                >
                  24H
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timePeriodBtn,
                  timePeriod === "7d" && styles.timePeriodBtnActive,
                ]}
                onPress={() => setTimePeriod("7d")}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    timePeriod === "7d" && styles.timePeriodTextActive,
                  ]}
                >
                  7D
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timePeriodBtn,
                  timePeriod === "30d" && styles.timePeriodBtnActive,
                ]}
                onPress={() => setTimePeriod("30d")}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    timePeriod === "30d" && styles.timePeriodTextActive,
                  ]}
                >
                  30D
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CHART */}
          <View style={styles.chartContainer}>
            {plottedData.length > 0 ? (
              <LineChart
                data={{
                  // use sparse labels for a cleaner X axis
                  labels: chartLabels,
                  datasets: [
                    {
                      data: plottedData.map((d: any) => d.value),
                      strokeWidth: 2,
                      color: (opacity = 1) =>
                        `rgba(${parseInt(
                          selectedSensor.color.slice(1, 3),
                          16
                        )}, ${parseInt(
                          selectedSensor.color.slice(3, 5),
                          16
                        )}, ${parseInt(
                          selectedSensor.color.slice(5, 7),
                          16
                        )}, ${opacity})`,
                    },
                  ],
                }}
                width={screenWidth - 32}
                height={200}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                  strokeWidth: 2,
                  useShadowColorFromDataset: false,
                  decimalPlaces: 1,
                }}
                bezier
                withDots={false}
                withInnerLines={false}
                withVerticalLines={false}
              />
            ) : (
              <View
                style={{
                  width: screenWidth - 32,
                  height: 200,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#9CA3AF" }}>No data available</Text>
              </View>
            )}
          </View>

          {/* STATS - simplified: show Latest and Average only */}
          {chartData.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Latest</Text>
                <Text
                  style={[styles.statValue, { color: selectedSensor.color }]}
                >
                  {chartData[chartData.length - 1].value.toFixed(2)}
                  {selectedSensor.unit}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Average</Text>
                <Text
                  style={[styles.statValue, { color: selectedSensor.color }]}
                >
                  {(
                    chartData.reduce(
                      (acc: number, curr: any) => acc + curr.value,
                      0
                    ) / chartData.length
                  ).toFixed(1)}
                  {selectedSensor.unit}
                </Text>
              </View>
            </View>
          )}
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
              <Text style={styles.detailLabel}>Current Value</Text>
              <Text style={styles.detailValue}>
                {selectedSensor.currentValue.toFixed(2)} {selectedSensor.unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Update</Text>
              <Text style={styles.detailValue}>{lastUpdate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data Points</Text>
              <Text style={styles.detailValue}>{chartData.length} records</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

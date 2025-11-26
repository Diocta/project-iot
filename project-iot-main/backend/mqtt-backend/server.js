// server.js - MQTT to MySQL Bridge
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ================== MySQL Connection ==================
let db;

async function connectDatabase() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'smart_home',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('✅ MySQL Connected!');
    
    // Test connection
    const [rows] = await db.query('SELECT 1');
    console.log('   Database test query successful');
    
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
}

// ================== MQTT Connection ==================
const MQTT_HOST = process.env.MQTT_HOST || '10.203.142.56';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, {
  clientId: `backend_${Math.random().toString(16).slice(2, 8)}`,
  clean: true,
  reconnectPeriod: 1000,
});

// MQTT Topics
const TOPICS = {
  TEMP: 'home/sensor/temp',
  HUM: 'home/sensor/hum',
  RAIN: 'home/sensor/rain',
  LIGHT: 'home/sensor/light',
  CTRL_LAMP: 'home/control/lamp',
  CTRL_GARAGE: 'home/control/servo/garasi',
  CTRL_CLOTHESLINE: 'home/control/servo/jemuran',
};

// Temporary storage for sensor data before saving to DB
let latestSensorData = {
  temperature: null,
  humidity: null,
  rain: null,
  light: null,
  lastUpdate: null
};

mqttClient.on('connect', () => {
  console.log('✅ MQTT Connected!');
  
  // Subscribe to all sensor topics
  Object.values(TOPICS).forEach(topic => {
    mqttClient.subscribe(topic, (err) => {
      if (!err) {
        console.log(`   📫 Subscribed to: ${topic}`);
      }
    });
  });
});

mqttClient.on('message', async (topic, message) => {
  const payload = message.toString();
  console.log(`📥 ${topic}: ${payload}`);
  
  try {
    // ========== Sensor Data ==========
    if (topic === TOPICS.TEMP) {
      latestSensorData.temperature = parseFloat(payload);
    } else if (topic === TOPICS.HUM) {
      latestSensorData.humidity = parseFloat(payload);
    } else if (topic === TOPICS.RAIN) {
      latestSensorData.rain = parseInt(payload);
    } else if (topic === TOPICS.LIGHT) {
      latestSensorData.light = parseInt(payload);
    }
    
    // Check if we have all sensor data, then save to database
    if (latestSensorData.temperature !== null && 
        latestSensorData.humidity !== null && 
        latestSensorData.rain !== null && 
        latestSensorData.light !== null) {
      
      await saveSensorData(latestSensorData);
      
      // Reset for next batch
      latestSensorData = {
        temperature: null,
        humidity: null,
        rain: null,
        light: null,
        lastUpdate: new Date()
      };
    }
    
    // ========== Device Control Logs ==========
    if (topic === TOPICS.CTRL_LAMP) {
      await logDeviceAction('lamp', 'All Lamps', payload.includes('1') ? 'on' : 'off', 'manual');
    } else if (topic === TOPICS.CTRL_GARAGE) {
      const action = payload.includes('1') || payload.includes('open') ? 'open' : 'close';
      await logDeviceAction('garage', 'Garage Gate', action, 'manual');
    } else if (topic === TOPICS.CTRL_CLOTHESLINE) {
      const action = payload.includes('1') || payload.includes('open') ? 'open' : 'close';
      await logDeviceAction('clothesline', 'Clothesline', action, 'manual');
    }
    
  } catch (error) {
    console.error('❌ Error processing message:', error.message);
  }
});

mqttClient.on('error', (error) => {
  console.error('❌ MQTT Error:', error.message);
});

// ================== Database Functions ==================

async function saveSensorData(data) {
  try {
    const query = `
      INSERT INTO sensor_data (temperature, humidity, light_level, rain_status)
      VALUES (?, ?, ?, ?)
    `;
    
    await db.execute(query, [
      data.temperature,
      data.humidity,
      data.light,
      data.rain
    ]);
    
    console.log('💾 Sensor data saved to database');
    
  } catch (error) {
    console.error('❌ Database save error:', error.message);
  }
}

async function logDeviceAction(deviceType, deviceName, action, triggeredBy) {
  try {
    const query = `
      INSERT INTO device_logs (device_type, device_name, action, triggered_by)
      VALUES (?, ?, ?, ?)
    `;
    
    await db.execute(query, [deviceType, deviceName, action, triggeredBy]);
    
    console.log(`📝 Device log saved: ${deviceType} - ${action}`);
    
  } catch (error) {
    console.error('❌ Device log error:', error.message);
  }
}

// ================== REST API Endpoints ==================

// Get latest sensor data
app.get('/api/sensor/latest', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM sensor_data 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    
    res.json({
      success: true,
      data: rows[0] || null
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sensor data history with pagination
app.get('/api/sensor/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const [rows] = await db.query(`
      SELECT * FROM sensor_data 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM sensor_data');
    
    res.json({
      success: true,
      data: rows,
      total: countResult[0].total,
      limit,
      offset
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sensor data by date range
app.get('/api/sensor/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: 'start and end dates are required'
      });
    }
    
    const [rows] = await db.query(`
      SELECT * FROM sensor_data 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `, [start, end]);
    
    res.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get device logs
app.get('/api/logs/devices', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const deviceType = req.query.type || null;
    
    let query = 'SELECT * FROM device_logs';
    let params = [];
    
    if (deviceType) {
      query += ' WHERE device_type = ?';
      params.push(deviceType);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await db.query(query, params);
    
    res.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [avgData] = await db.query(`
      SELECT 
        AVG(temperature) as avg_temp,
        AVG(humidity) as avg_humidity,
        AVG(light_level) as avg_light,
        COUNT(*) as total_records
      FROM sensor_data
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    const [deviceCounts] = await db.query(`
      SELECT 
        device_type,
        COUNT(*) as action_count
      FROM device_logs
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY device_type
    `);
    
    res.json({
      success: true,
      data: {
        averages: avgData[0],
        deviceActivity: deviceCounts
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    
    res.json({
      status: 'ok',
      mqtt: mqttClient.connected ? 'connected' : 'disconnected',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ================== Start Server ==================
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Sensor Data: http://localhost:${PORT}/api/sensor/latest`);
  });
}

startServer().catch(error => {
  console.error('❌ Server startup failed:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  mqttClient.end();
  await db.end();
  
  console.log('✅ Shutdown complete');
  process.exit(0);
});
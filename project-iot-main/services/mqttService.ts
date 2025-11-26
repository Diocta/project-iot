// services/mqttService.ts
import Paho from 'paho-mqtt';

// MQTT Configuration
const MQTT_CONFIG = {
  host: '10.203.142.56', // IP PC kamu
  port: 9001, // WebSocket port (PENTING: bukan 1883!)
  clientId: `expo_app_${Math.random().toString(16).slice(2, 8)}`,
};

// Topics - sama dengan ESP32
export const MQTT_TOPICS = {
  // Sensor Topics (Subscribe)
  TEMP: 'home/sensor/temp',
  HUM: 'home/sensor/hum',
  RAIN: 'home/sensor/rain',
  LIGHT: 'home/sensor/light',
  
  // Control Topics (Publish)
  CTRL_LAMP: 'home/control/lamp',
  CTRL_SERVO_GARASI: 'home/control/servo/garasi',
  CTRL_SERVO_JEMURAN: 'home/control/servo/jemuran',
};

export interface SensorData {
  temperature: number;
  humidity: number;
  rain: number;
  light: number;
  lastUpdate: Date;
}

export type MessageCallback = (topic: string, message: string) => void;

class MQTTService {
  private client: any = null;
  private messageCallbacks: MessageCallback[] = [];
  private connected: boolean = false;

  connect(onConnected?: () => void, onError?: (error: Error) => void) {
    try {
      console.log('🔌 Connecting to MQTT via WebSocket...');
      console.log(`   Host: ${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`);

      // Create Paho MQTT client
      this.client = new Paho.Client(
        MQTT_CONFIG.host,
        MQTT_CONFIG.port,
        '/mqtt',
        MQTT_CONFIG.clientId
      );

      // Connection lost callback
      this.client.onConnectionLost = (responseObject: any) => {
        this.connected = false;
        console.log('❌ Connection Lost:', responseObject.errorMessage);
        if (responseObject.errorCode !== 0) {
          onError?.(new Error(responseObject.errorMessage));
        }
      };

      // Message arrived callback
      this.client.onMessageArrived = (message: any) => {
        const topic = message.destinationName;
        const payload = message.payloadString;
        console.log(`📥 ${topic}: ${payload}`);

        // Notify all callbacks
        this.messageCallbacks.forEach(callback => {
          callback(topic, payload);
        });
      };

      // Connection options
      const connectOptions = {
        timeout: 10,
        keepAliveInterval: 60,
        cleanSession: true,
        useSSL: false,
        onSuccess: () => {
          console.log('✅ MQTT Connected!');
          this.connected = true;

          // Subscribe to sensor topics
          const topics = [
            MQTT_TOPICS.TEMP,
            MQTT_TOPICS.HUM,
            MQTT_TOPICS.RAIN,
            MQTT_TOPICS.LIGHT,
          ];

          topics.forEach(topic => {
            this.client.subscribe(topic);
            console.log(`📫 Subscribed: ${topic}`);
          });

          onConnected?.();
        },
        onFailure: (error: any) => {
          console.error('❌ Connection Failed:', error.errorMessage);
          this.connected = false;
          onError?.(new Error(error.errorMessage || 'Connection failed'));
        },
      };

      // Connect
      this.client.connect(connectOptions);

    } catch (error) {
      console.error('❌ MQTT Error:', error);
      onError?.(error as Error);
    }
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.disconnect();
      this.connected = false;
      console.log('🔌 Disconnected');
    }
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  publishLampControl(lampNumber: 1 | 2 | 3 | 4, state: 'on' | 'off') {
    // Kirim command dengan format: "lamp_number:state"
    // Contoh: "1:1" = lamp 1 on, "2:0" = lamp 2 off
    const message = `${lampNumber}:${state === 'on' ? '1' : '0'}`;
    this.publish(MQTT_TOPICS.CTRL_LAMP, message);
  }

  publishGarageControl(action: 'open' | 'close') {
    const message = action === 'open' ? '1' : '0';
    this.publish(MQTT_TOPICS.CTRL_SERVO_GARASI, message);
  }

  publishClotheslineControl(action: 'open' | 'close') {
    const message = action === 'open' ? '1' : '0';
    this.publish(MQTT_TOPICS.CTRL_SERVO_JEMURAN, message);
  }

  private publish(topic: string, payload: string) {
    if (this.client && this.connected) {
      const message = new Paho.Message(payload);
      message.destinationName = topic;
      this.client.send(message);
      console.log(`📤 ${topic}: ${payload}`);
    } else {
      console.error('❌ Not connected');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const mqttService = new MQTTService();
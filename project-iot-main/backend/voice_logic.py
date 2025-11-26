import sounddevice as sd
import scipy.io.wavfile as wav
import speech_recognition as sr
import tempfile
import os
from gtts import gTTS
import base64
from io import BytesIO
try:
    import paho.mqtt.client as mqtt
except Exception as _e:
    mqtt = None
    print("⚠️ paho-mqtt not available:", _e)

import os as _os


# -------------------------------
# TEXT-TO-SPEECH (gTTS - NO PLAYBACK ON SERVER)
# -------------------------------
def speak(text):
    """Text-to-speech using gTTS (Indonesian), returns MP3 as base64 to send to phone"""
    print("🔊 Voice Response:", text)
    
    try:
        # Generate MP3 in RAM (BytesIO)
        mp3_fp = BytesIO()
        tts = gTTS(text=text, lang='id', slow=False)
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        # Return MP3 data as base64 (phone will play it)
        mp3_data = mp3_fp.getvalue()
        audio_base64 = base64.b64encode(mp3_data).decode('utf-8')
        
        return audio_base64
        
    except Exception as e:
        print("❌ Error in TTS:", e)
        return None



# -------------------------------
# COMMAND KEYWORDS
# -------------------------------
ACTIONS_ON = ["nyalakan", "hidupkan", "aktifkan", "on", "buka"]
ACTIONS_OFF = ["matikan", "nonaktifkan", "off", "tutup", "Tutup"]

DEVICES = {
    "lampu": ["lampu", "light"],
    "kipas": ["kipas", "fan"],
    "ac": ["ac", "pendingin"],
    "tv": ["tv", "televisi"],
    "pintu": ["pintu", "door"],
    "garasi": ["garasi", "garage"],
    "jemuran": ["jemuran", "tali jemuran", "clothesline"]
}

# Number words in Indonesian -> integer
NUMBER_WORDS = {
    'satu': 1,
    'dua': 2,
    'tiga': 3,
    'empat': 4,
    'lima': 5,
}


# -------------------------------
# MQTT PUBLISHER (for IoT control)
# -------------------------------
# Configure via environment variables or change defaults below
MQTT_BROKER_HOST = _os.getenv('MQTT_BROKER_HOST', '10.203.142.56')
MQTT_BROKER_PORT = int(_os.getenv('MQTT_BROKER_PORT', '1883'))

# Map logical devices to MQTT topics used by your ESP32 / broker
TOPIC_MAP = {
    'lampu': 'home/control/lamp',
    'kipas': 'home/control/fan',
    'ac': 'home/control/ac',
    'tv': 'home/control/tv',
    'pintu': 'home/control/door',
}

_mqtt_client = None
_mqtt_connected = False

def _on_connect(client, userdata, flags, rc):
    global _mqtt_connected
    if rc == 0:
        _mqtt_connected = True
        print(f"✅ MQTT connected to {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
    else:
        print("❌ MQTT connection failed with code", rc)

def _init_mqtt():
    global _mqtt_client
    if mqtt is None:
        print("⚠️ Skipping MQTT init because paho-mqtt is not installed")
        return

    try:
        _mqtt_client = mqtt.Client()
        _mqtt_client.on_connect = _on_connect
        # Use a short timeout connect; if broker isn't available, we'll continue without MQTT
        _mqtt_client.connect_async(MQTT_BROKER_HOST, MQTT_BROKER_PORT, keepalive=60)
        _mqtt_client.loop_start()
    except Exception as e:
        print("❌ Failed to initialize MQTT client:", e)


def mqtt_publish(topic: str, payload: str):
    """Publish payload to topic if MQTT is initialized. Returns True if published."""
    global _mqtt_client, _mqtt_connected
    if _mqtt_client is None:
        print("⚠️ MQTT client not initialized. Attempting to initialize...")
        _init_mqtt()

    if _mqtt_client and _mqtt_connected:
        try:
            _mqtt_client.publish(topic, payload)
            print(f"📤 Published MQTT -> {topic}: {payload}")
            return True
        except Exception as e:
            print("❌ MQTT publish error:", e)
            return False
    else:
        print("⚠️ MQTT not connected. Skipping publish for", topic)
        return False


# Initialize MQTT client on module import (best-effort)
_init_mqtt()



# -------------------------------
# RECORD & TRANSCRIBE
# -------------------------------
def record_and_text():
    duration = 4
    samplerate = 16000

    print("🎤 Silakan bicara sekarang (merekam 4 detik)...")
    try:
        audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
        sd.wait()
    except Exception as e:
        # Could be no audio device (e.g., running on a server without mic)
        print("❌ Failed to record from microphone:", e)
        return ""

    # Save to temp WAV for SpeechRecognition
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
        wav.write(tmpfile.name, samplerate, audio)
        temp_path = tmpfile.name

    try:
        text = text_from_wav(temp_path)
        return text
    finally:
        # Hapus file temp
        try:
            os.unlink(temp_path)
        except:
            pass


def text_from_wav(path: str) -> str:
    """Transcribe a WAV file at `path` using SpeechRecognition Google API (Indonesian)."""
    r = sr.Recognizer()
    try:
        with sr.AudioFile(path) as source:
            audio_file = r.record(source)

        text = r.recognize_google(audio_file, language='id-ID')
        print("🗣️ Transcribed:", text)
        return text.lower()
    except sr.UnknownValueError:
        print("❌ Tidak bisa mengenali suara dari file.")
        speak("Maaf, saya tidak mendengar dengan jelas.")
        return ""
    except sr.RequestError:
        print("❌ Error Google Speech API")
        speak("Terjadi kesalahan saat menghubungi layanan.")
        return ""
    except Exception as e:
        print("❌ Error transcribing file:", e)
        return ""


def _handle_text_and_build_response(text: str):
    """Shared logic to parse text and build the response JSON + TTS audio."""
    action, device, device_number = parse_command(text)

    if action and device:
        print(f"✅ COMMAND DETECTED → {action} → {device}")

        # Device number already parsed

        # Build response and MQTT payload according to device
        mqtt_ok = False
        mqtt_topic = None
        mqtt_payload = None

        if device == 'lampu':
            if device_number is None:
                # Ask user to specify lamp number
                response = "Tolong sebutkan nomor lampu (1 sampai 4)."
                audio_base64 = speak(response)
                return {"heard": text, "action": action, "device": device, "device_number": None, "response": response, "audio": audio_base64, "mqtt": {"published": False}}

            # payload format: "<lampNumber>:<0|1>" to match frontend
            mqtt_topic = TOPIC_MAP.get('lampu')
            mqtt_payload = f"{device_number}:{'1' if action == 'ON' else '0'}"
            mqtt_ok = mqtt_publish(mqtt_topic, mqtt_payload) if mqtt_topic else False
            response = f"Lampu {device_number} berhasil {'dinyalakan' if action == 'ON' else 'dimatikan'}."

        else:
            mqtt_topic = TOPIC_MAP.get(device)
            # Generic payload: '1' for ON, '0' for OFF (adjust if your device expects different format)
            mqtt_payload = '1' if action == 'ON' else '0'
            if mqtt_topic:
                mqtt_ok = mqtt_publish(mqtt_topic, mqtt_payload)
            else:
                print(f"⚠️ No MQTT topic mapping for device: {device}")
            response = f"{device} berhasil {'dinyalakan' if action == 'ON' else 'dimatikan'}."

        audio_base64 = speak(response)
        return {"heard": text, "action": action, "device": device, "device_number": device_number, "response": response, "audio": audio_base64, "mqtt": {"topic": mqtt_topic, "payload": mqtt_payload, "published": mqtt_ok}}

    elif device and not action:
        print("⚠️ Device ditemukan tapi tidak ada ON/OFF")
        response = "Perintah kurang lengkap. Tolong sebutkan nyalakan atau matikan."
        audio_base64 = speak(response)
        return {"heard": text, "action": None, "device": device, "device_number": device_number, "response": response, "audio": audio_base64}

    elif action and not device:
        print("⚠️ Aksi ditemukan tapi perangkat tidak ditemukan")
        response = "Perangkat tidak ditemukan. Tolong sebutkan nama perangkat."
        audio_base64 = speak(response)
        return {"heard": text, "action": action, "device": None, "device_number": None, "response": response, "audio": audio_base64}

    else:
        print("❌ Tidak bisa memahami perintah.")
        response = "Maaf, saya tidak mengerti perintahnya."
        audio_base64 = speak(response)
        return {"heard": text, "action": None, "device": None, "device_number": None, "response": response, "audio": audio_base64}


def run_voice_ai_from_wav_bytes(wav_bytes: bytes):
    """Accept raw WAV bytes (or file bytes), write temp file, transcribe and handle the command."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
        tmpfile.write(wav_bytes)
        tmpfile.flush()
        temp_path = tmpfile.name

    try:
        text = text_from_wav(temp_path)
        return _handle_text_and_build_response(text)
    finally:
        try:
            os.unlink(temp_path)
        except:
            pass



# -------------------------------
# PARSE COMMAND
# -------------------------------
def parse_command(text):
    """Parse spoken text and return (action, device, device_number).
    device_number is an int when the command includes a number (e.g., 'lampu 2')."""
    action = None
    device = None
    device_number = None

    # normalize
    t = text.lower()

    # Action
    for a in ACTIONS_ON:
        if a in t:
            action = "ON"
            break

    for a in ACTIONS_OFF:
        if a in t:
            action = "OFF"
            break

    # Device
    for dev_name, keywords in DEVICES.items():
        for k in keywords:
            if k in t:
                device = dev_name
                break
        if device:
            break

    # Try to find explicit device number (e.g., 'lampu 2' or 'lampu dua')
    if device == 'lampu':
        # digits
        import re
        m = re.search(r"\b([1-4])\b", t)
        if m:
            device_number = int(m.group(1))
        else:
            # number words
            for word, num in NUMBER_WORDS.items():
                if word in t:
                    device_number = num
                    break

    return action, device, device_number



# -------------------------------
# MAIN SYSTEM
# -------------------------------
# -------------------------------
# MAIN FUNCTION FOR SERVER
# -------------------------------
def run_voice_ai():
    """Main voice AI function called from server"""
    text = record_and_text()
    action, device, device_number = parse_command(text)

    if action and device:
        print(f"✅ COMMAND DETECTED → {action} → {device}")

        # Build response and MQTT payload according to device
        mqtt_ok = False
        mqtt_topic = None
        mqtt_payload = None

        if device == 'lampu':
            if device_number is None:
                # Ask user to specify lamp number
                response = "Tolong sebutkan nomor lampu (1 sampai 4)."
                audio_base64 = speak(response)
                return {"heard": text, "action": action, "device": device, "device_number": None, "response": response, "audio": audio_base64, "mqtt": {"published": False}}

            # payload format: "<lampNumber>:<0|1>" to match frontend
            mqtt_topic = TOPIC_MAP.get('lampu')
            mqtt_payload = f"{device_number}:{'1' if action == 'ON' else '0'}"
            mqtt_ok = mqtt_publish(mqtt_topic, mqtt_payload) if mqtt_topic else False
            response = f"Lampu {device_number} berhasil {'dinyalakan' if action == 'ON' else 'dimatikan'}."

        else:
            mqtt_topic = TOPIC_MAP.get(device)
            # Generic payload: '1' for ON, '0' for OFF (adjust if your device expects different format)
            mqtt_payload = '1' if action == 'ON' else '0'
            if mqtt_topic:
                mqtt_ok = mqtt_publish(mqtt_topic, mqtt_payload)
            else:
                print(f"⚠️ No MQTT topic mapping for device: {device}")
            response = f"{device} berhasil {'dinyalakan' if action == 'ON' else 'dimatikan'}."

        audio_base64 = speak(response)
        return {"heard": text, "action": action, "device": device, "device_number": device_number, "response": response, "audio": audio_base64, "mqtt": {"topic": mqtt_topic, "payload": mqtt_payload, "published": mqtt_ok}}

    elif device and not action:
        print("⚠️ Device ditemukan tapi tidak ada ON/OFF")
        response = "Perintah kurang lengkap. Tolong sebutkan nyalakan atau matikan."
        audio_base64 = speak(response)
        return {"heard": text, "action": None, "device": device, "device_number": device_number, "response": response, "audio": audio_base64}

    elif action and not device:
        print("⚠️ Aksi ditemukan tapi perangkat tidak ditemukan")
        response = "Perangkat tidak ditemukan. Tolong sebutkan nama perangkat."
        audio_base64 = speak(response)
        return {"heard": text, "action": action, "device": None, "device_number": None, "response": response, "audio": audio_base64}

    else:
        print("❌ Tidak bisa memahami perintah.")
        response = "Maaf, saya tidak mengerti perintahnya."
        audio_base64 = speak(response)
        return {"heard": text, "action": None, "device": None, "device_number": None, "response": response, "audio": audio_base64}


# Only run if called directly (not from server)
if __name__ == "__main__":
    result = run_voice_ai()

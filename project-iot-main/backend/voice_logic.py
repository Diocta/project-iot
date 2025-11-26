import sounddevice as sd
import scipy.io.wavfile as wav
import speech_recognition as sr
import tempfile
import os
from gtts import gTTS
import numpy as np
from io import BytesIO
from pydub import AudioSegment


# -------------------------------
# TEXT-TO-SPEECH (gTTS - NO FILES)
# -------------------------------
def speak(text):
    """Text-to-speech using gTTS (Indonesian), plays in RAM without file creation"""
    print("🔊 Voice Response:", text)
    
    try:
        # Generate MP3 in RAM (BytesIO)
        mp3_fp = BytesIO()
        tts = gTTS(text=text, lang='id', slow=False)
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        # Load MP3 from RAM into pydub
        audio = AudioSegment.from_file(mp3_fp, format="mp3")
        
        # Convert to numpy array for playback
        samples = np.array(audio.get_array_of_samples()).astype(np.float32)
        
        # Normalize to -1..+1 range
        samples /= np.iinfo(audio.array_type).max
        
        # Play audio directly (no file created)
        sd.play(samples, audio.frame_rate)
        sd.wait()
        
    except Exception as e:
        print("❌ Error in TTS:", e)



# -------------------------------
# COMMAND KEYWORDS
# -------------------------------
ACTIONS_ON = ["nyalakan", "hidupkan", "aktifkan", "on", "buka"]
ACTIONS_OFF = ["matikan", "nonaktifkan", "off", "Tutup"]

DEVICES = {
    "lampu": ["lampu", "light"],
    "kipas": ["kipas", "fan"],
    "ac": ["ac", "pendingin"],
    "tv": ["tv", "televisi"],
    "pintu": ["pintu", "door"]
}



# -------------------------------
# RECORD & TRANSCRIBE
# -------------------------------
def record_and_text():
    duration = 4
    samplerate = 16000

    print("🎤 Silakan bicara sekarang (merekam 4 detik)...")
    audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
    sd.wait()

    # Save to temp WAV for SpeechRecognition
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
        wav.write(tmpfile.name, samplerate, audio)
        temp_path = tmpfile.name

    r = sr.Recognizer()

    try:
        with sr.AudioFile(temp_path) as source:
            audio_file = r.record(source)

        text = r.recognize_google(audio_file, language='id-ID')
        print("🗣️ Kamu bilang:", text)
        return text.lower()

    except sr.UnknownValueError:
        print("❌ Tidak bisa mengenali suara.")
        speak("Maaf, saya tidak mendengar dengan jelas.")
        return ""
    except sr.RequestError:
        print("❌ Error Google Speech API")
        speak("Terjadi kesalahan saat menghubungi layanan.")
        return ""
    except Exception as e:
        print("❌ Error:", e)
        return ""
    finally:
        # Hapus file temp
        try:
            os.unlink(temp_path)
        except:
            pass



# -------------------------------
# PARSE COMMAND
# -------------------------------
def parse_command(text):
    action = None
    device = None

    # Action
    for a in ACTIONS_ON:
        if a in text:
            action = "ON"
            break

    for a in ACTIONS_OFF:
        if a in text:
            action = "OFF"
            break

    # Device
    for dev_name, keywords in DEVICES.items():
        for k in keywords:
            if k in text:
                device = dev_name
                break

    return action, device



# -------------------------------
# MAIN SYSTEM
# -------------------------------
# -------------------------------
# MAIN FUNCTION FOR SERVER
# -------------------------------
def run_voice_ai():
    """Main voice AI function called from server"""
    text = record_and_text()
    action, device = parse_command(text)

    if action and device:
        print(f"✅ COMMAND DETECTED → {action} → {device}")
        response = f"{device} berhasil {'dinyalakan' if action == 'ON' else 'dimatikan'}."
        speak(response)
        return {"heard": text, "action": action, "device": device, "response": response}

    elif device and not action:
        print("⚠️ Device ditemukan tapi tidak ada ON/OFF")
        response = "Perintah kurang lengkap. Tolong sebutkan nyalakan atau matikan."
        speak(response)
        return {"heard": text, "action": None, "device": device, "response": response}

    elif action and not device:
        print("⚠️ Aksi ditemukan tapi perangkat tidak ditemukan")
        response = "Perangkat tidak ditemukan. Tolong sebutkan nama perangkat."
        speak(response)
        return {"heard": text, "action": action, "device": None, "response": response}

    else:
        print("❌ Tidak bisa memahami perintah.")
        response = "rio sangat kontol sekali dia adalah manuusia anjing sanagt bodoh tolol dan lain lain"
        speak(response)
        return {"heard": text, "action": None, "device": None, "response": response}


# Only run if called directly (not from server)
if __name__ == "__main__":
    result = run_voice_ai()

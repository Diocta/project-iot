from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from backend.voice_logic import run_voice_ai, run_voice_ai_from_wav_bytes

app = FastAPI()

# Allow React Native to access the server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/record")
def record_voice():
    print("🎤 Mobile requested voice recording...")
    try:
        result = run_voice_ai()
        return result
    except Exception as e:
        # If server cannot record (no microphone), return helpful error
        print("❌ Error while recording on server:", e)
        return {"error": "Server recording failed. Upload audio via POST /record instead.", "details": str(e)}


@app.post("/record")
async def record_voice_upload(audio: UploadFile = File(...)):
    """Accept an uploaded audio file (WAV/MP3) and process it server-side.
    This is the recommended mode when running the server without a microphone (mobile should record and upload)."""
    print(f"📥 Received uploaded audio: {audio.filename}")
    try:
        contents = await audio.read()
        result = run_voice_ai_from_wav_bytes(contents)
        return result
    except Exception as e:
        print("❌ Error processing uploaded audio:", e)
        return {"error": "Failed to process uploaded audio.", "details": str(e)}

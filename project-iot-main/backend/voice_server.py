from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.voice_logic import run_voice_ai

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
    result = run_voice_ai()
    return result

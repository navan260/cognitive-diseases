import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv() # Fallback

def get_groq_client():
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("[WARNING] GROQ_API_KEY not found in environment variables.")
        return None
    return Groq(api_key=groq_key)

client = None

def transcribe_audio(file_path):
    """
    Transcribes an audio file using Groq's Whisper API.
    """
    if not os.path.exists(file_path):
        return "Error: File not found."

    try:
        client = get_groq_client()
        if not client:
            return "Error: Groq client not initialized."

        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(file_path, file.read()),
                model="whisper-large-v3-turbo",
                response_format="text",
                language="en",
            )
            # Check if transcription is an object or string
            return transcription if isinstance(transcription, str) else transcription.text
    except Exception as e:
        print(f"Transcription error: {e}")
        return f"Error transcribing audio: {str(e)}"

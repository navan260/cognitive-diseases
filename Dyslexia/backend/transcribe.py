import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

groq_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_key)

def transcribe_audio(file_path):
    """
    Transcribes an audio file using Groq's Whisper API.
    """
    if not os.path.exists(file_path):
        return "Error: File not found."

    try:
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

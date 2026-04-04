import os
import re
import urllib.parse
from groq import Groq
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

def get_groq_client():
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return None
    return Groq(api_key=groq_key)

def generate_mindmap(text):
    client = get_groq_client()
    if not client:
        return "[ ERROR: Groq client not initialized ]"
    prompt = f"""
    Create a simple, easy-to-understand vertical text-based flowchart for the following transcript.
    
    STRICT RULES:
    1. Use boxed text for each step, like: [ STEP NAME ]
    2. Use a vertical arrow symbol: ↓ between boxes.
    3. Keep it VERY simple and concise.
    4. Focus on the main sequence of events or ideas.
    5. Output ONLY the flowchart. No intro or outro.
    
    Example format:
    [ Start ]
      ↓
    [ Step 1 ]
      ↓
    [ End ]
    
    Transcript: "{text[:800]}"
    """
    
    try:
        # Use Groq (llama-3.3-70b-versatile) for robust text generation
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq flowchart generation failed: {e}")
        
        # Simple fallback
        lines = [line.strip() for line in text.split('.') if line.strip()][:4]
        flowchart = ""
        for i, line in enumerate(lines):
            flowchart += f"[ {line[:30]}... ]\n"
            if i < len(lines) - 1:
                flowchart += "      ↓      \n"
        return flowchart

import os
from groq import Groq
from dotenv import load_dotenv

def get_groq_client():
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return None
    return Groq(api_key=groq_key)

def summarize(text):
    client = get_groq_client()
    if not client:
        return "Error: Groq client not initialized. Check your .env file."
    
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an assistant who summarizes text to make it easy for people with dyslexia to read. Keep the summary concise, use very simple words, and use short bullet points."},
            {"role": "user", "content": f"Please summarize the following transcript:\n\n\"\"\"\n{text}\n\"\"\""}
        ],
        model="llama-3.1-8b-instant", 
    )
    return chat_completion.choices[0].message.content
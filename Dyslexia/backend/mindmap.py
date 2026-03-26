import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_mindmap(text):
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an assistant who creates simple text-based mind maps for people with dyslexia. Use indentation and bullet points (- and  •) to show hierarchy. Keep it concise."},
            {"role": "user", "content": f"Create a mind map from the following transcript:\n\n\"\"\"\n{text}\n\"\"\""}
        ],
        model="llama-3.1-8b-instant", 
    )
    return chat_completion.choices[0].message.content

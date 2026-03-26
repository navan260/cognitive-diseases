import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def summarize(text):
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an assistant who summarizes text to make it easy for people with dyslexia to read. Keep the summary concise, use very simple words, and use short bullet points."},
            {"role": "user", "content": f"Please summarize the following transcript:\n\n\"\"\"\n{text}\n\"\"\""}
        ],
        model="llama-3.1-8b-instant", 
    )
    return chat_completion.choices[0].message.content
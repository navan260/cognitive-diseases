import os
import requests
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import google.generativeai as genai

# Load environment variables early
load_dotenv()
from transcribe import transcribe_audio
from pdf_processor import extract_text_from_pdf
from syllable import process_text
from summary import summarize
from mindmap import generate_mindmap

from db import add_face, query_face
import face_recognition
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'ogg', 'wav'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/process", methods=["POST"])
def process():
    data = request.json
    text = data.get("text", "")

    response = {
        "original": text,
        "syllables": {},
        "summary": "",
        "mindmap": "",
    }

    try:
        response["syllables"] = process_text(text)
    except Exception as e:
        print(f"[ERROR] syllable: {e}")
        response["syllables"] = {"error": str(e)}

    try:
        response["summary"] = summarize(text)
    except Exception as e:
        print(f"[ERROR] summary: {e}")
        response["summary"] = f"Error generating summary: {e}"

    try:
        response["mindmap"] = generate_mindmap(text)
    except Exception as e:
        print(f"[ERROR] mindmap: {e}")
        response["mindmap"] = f"Error generating mind map: {e}"

    return jsonify(response)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # 1. Transcribe the audio
            transcript = transcribe_audio(file_path)
            
            # Clean up: Remove temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
                
            if transcript.startswith("Error"):
                return jsonify({"error": transcript}), 500
                
            # 2. Process the transcript
            response = {
                "original": transcript,
                "syllables": process_text(transcript),
                "summary": summarize(transcript),
                "mindmap": generate_mindmap(transcript)
            }
            return jsonify(response)
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # 1. Extract text from PDF
            text = extract_text_from_pdf(file_path)
            
            # Clean up: Remove temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
                
            if text.startswith("Error"):
                return jsonify({"error": text}), 400
                
            # 2. Process the text
            response = {
                "original": text,
                "syllables": process_text(text),
                "summary": summarize(text),
                "mindmap": generate_mindmap(text)
            }
            return jsonify(response)
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400

@app.route('/summary', methods=["POST"])
def dycalculia_summary():
    data = request.json
    dot = data.get('dot', {})
    line = data.get('line', {})
    arithmetic = data.get('arithmetic', {})
    prediction = data.get('prediction', '')
    
    prompt = f"""
You are a friendly and supportive learning assistant.

A student completed some math-related cognitive tests.

Here are their results:
Dot Accuracy: {dot.get('accuracy')}
Response Time: {dot.get('avgTime')}
Number Line Error: {line.get('avgError')}
Arithmetic Accuracy: {arithmetic.get('accuracy')}
Memory Issue: {arithmetic.get('memoryFail')}
Difficulty Level: {prediction}

TASK:
Write a short, friendly message to the student.

STYLE RULES:
- Talk like a supportive friend or teacher
- Keep it simple and encouraging
- Do NOT use technical words
- Do NOT list points or numbers
- Write like a short paragraph (3–4 lines)
- Give gentle suggestions for improvement

Make the student feel motivated and comfortable.
"""

    try:
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return jsonify({"text": response.text})
    except Exception as e:
        print(f"[ERROR] Gemini request failed: {e}")
        return jsonify({"text": "AI failed"})

@app.route('/generate_story', methods=["POST"])
def generate_story():
    data = request.json
    prompt = data.get("prompt", "")
    
    try:
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return jsonify({"text": response.text})
    except Exception as e:
        print(f"[ERROR] Gemini generate_story failed: {e}")
        return jsonify({"text": "Error generating story", "error": str(e)}), 500

@app.route('/propognasia/enroll', methods=['POST'])
def propognasia_enroll():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    name = request.form.get('name')
    namespace = request.form.get('userId')
    
    if not name or not namespace:
        return jsonify({"error": "Missing name or userId"}), 400
        
    try:
        img = Image.open(file).convert("RGB")
        img_array = np.array(img)
        encodings = face_recognition.face_encodings(img_array)
        
        if len(encodings) > 0:
            add_face(name, encodings[0], namespace=namespace)
            return jsonify({"success": True, "message": f"Enrolled {name}"})
        else:
            return jsonify({"error": "No face detected"}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/propognasia/identify', methods=['POST'])
def propognasia_identify():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    namespace = request.form.get('userId')
    
    if not namespace:
        return jsonify({"error": "Missing userId"}), 400
        
    try:
        img = Image.open(file).convert("RGB")
        img_array = np.array(img)
        face_locations = face_recognition.face_locations(img_array)
        face_encodings = face_recognition.face_encodings(img_array, face_locations)
        
        if len(face_encodings) == 0:
            return jsonify({"message": "No face detected", "matches": []})
            
        results = []
        for encoding in face_encodings:
            person_name = query_face(encoding, namespace=namespace)
            results.append(person_name)
            
        return jsonify({"success": True, "matches": results})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
from werkzeug.utils import secure_filename
from transcribe import transcribe_audio
from pdf_processor import extract_text_from_pdf
from syllable import process_text
from summary import summarize
from mindmap import generate_mindmap

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

if __name__ == "__main__":
    app.run(debug=True)
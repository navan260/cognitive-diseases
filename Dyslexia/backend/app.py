from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

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

    # Syllable breakdown
    try:
        from syllable import process_text
        response["syllables"] = process_text(text)
    except Exception as e:
        print(f"[ERROR] syllable: {e}")
        traceback.print_exc()
        response["syllables"] = {"error": str(e)}

    # Summary via Gemini
    try:
        from summary import summarize
        response["summary"] = summarize(text)
    except Exception as e:
        print(f"[ERROR] summary: {e}")
        traceback.print_exc()
        response["summary"] = f"Error generating summary: {e}"

    # Mind map via Gemini
    try:
        from mindmap import generate_mindmap
        response["mindmap"] = generate_mindmap(text)
    except Exception as e:
        print(f"[ERROR] mindmap: {e}")
        traceback.print_exc()
        response["mindmap"] = f"Error generating mind map: {e}"

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
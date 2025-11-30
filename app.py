from flask import Flask, render_template, request, jsonify, send_from_directory, abort
import os
import datetime
import pathlib

app = Flask(__name__, static_folder='static', template_folder='templates')

TRANSCRIPTS_DIR = pathlib.Path("transcripts")
TRANSCRIPTS_DIR.mkdir(exist_ok=True)

def make_filename():
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"transcript_{ts}.txt"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/save", methods=["POST"])
def save_transcript():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Empty text"}), 400

    filename = make_filename()
    filepath = TRANSCRIPTS_DIR / filename
    filepath.write_text(text, encoding="utf-8")

    return jsonify({"ok": True, "filename": filename})

@app.route("/transcripts", methods=["GET"])
def list_transcripts():
    files = sorted(TRANSCRIPTS_DIR.iterdir(), key=os.path.getmtime, reverse=True)
    items = []
    for f in files:
        if f.is_file():
            items.append({
                "name": f.name,
                "mtime": int(f.stat().st_mtime)
            })
    return jsonify(items)

@app.route("/download/<path:filename>", methods=["GET"])
def download_transcript(filename):
    safe_dir = os.path.abspath(TRANSCRIPTS_DIR)
    requested = os.path.abspath(os.path.join(TRANSCRIPTS_DIR, filename))
    if not requested.startswith(safe_dir) or not os.path.exists(requested):
        abort(404)
    return send_from_directory(TRANSCRIPTS_DIR, filename, as_attachment=True)

if __name__ == "__main__":
    # for dev only; in production use a real WSGI server
    app.run(host="0.0.0.0", port=5000, debug=True)
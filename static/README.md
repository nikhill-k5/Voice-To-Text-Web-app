# Voice-to-Text Web App (For Hearing Impaired)
 ## Overview
 This project is a simple web application that converts voice input into text in real time. It is built
 using:- **Frontend:** HTML, CSS- **Backend:** Python (Flask)- **Speech Recognition:** Web Speech API (no aifc module required)
 This design avoids Python speech-recognition libraries to prevent dependency issues such as the
 `aifc` module error.--
## Features- Real-time speech-to-text using the browser- Clean UI- No heavy dependencies- No external installations required (except Flask)--
## Project Structure
 ```
 voice-to-text-app/
 static/
    style.css
    app.js
 templates/
    index.html
 app.py
 README.md
 ```
--
## How to Run the Project
 ### 1. Install Python (if not installed)
 Make sure Python 3.10+ is installed.
 ### 2. Install Flask
 ```bash
 pip install flask
 ```
 ### 3. Run the App
 ```bash
 python app.py
 ```
 ### 4. Open in Browser
 Go to:
 ```
 http://127.0.0.1:5000
 ```--
## Notes- This uses the **Web Speech API**, supported only in Chromium-based browsers (Chrome, Edge,
 Brave).- It does *not* require the `aifc` module or any other heavy audio libraries.--
## Author
Nikhil Kumar
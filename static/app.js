// Client-side code using Web Speech API
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const saveBtn = document.getElementById("saveBtn");
const interimDiv = document.getElementById("interim");
const finalDiv = document.getElementById("final");
const langSelect = document.getElementById("lang");
const savedList = document.getElementById("savedList");

let recognition;
let finalTranscript = "";

function supportsSpeechAPI() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.lang = langSelect.value || "en-US";
  return r;
}

function startRecognition() {
  if (!supportsSpeechAPI()) {
    alert("Your browser does not support the Web Speech API. Use Chrome for best results.");
    return;
  }
  if (!recognition) {
    recognition = initRecognition();
    if (!recognition) {
      alert("SpeechRecognition not available.");
      return;
    }
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript + (res[0].transcript.endsWith("\n") ? "" : " ");
        } else {
          interim += res[0].transcript;
        }
      }
      interimDiv.textContent = interim;
      finalDiv.textContent = finalTranscript;
      saveBtn.disabled = finalTranscript.trim().length === 0;
    };

    recognition.onerror = (e) => {
      console.error("Recognition error", e);
    };

    recognition.onend = () => {
      // keep recognition reference so language selection can be changed next time
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };
  }

  recognition.lang = langSelect.value || "en-US";
  try {
    recognition.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (err) {
    // sometimes start() throws if already started
    console.warn(err);
  }
}

function stopRecognition() {
  if (recognition) recognition.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

async function saveTranscript() {
  const text = finalTranscript.trim();
  if (!text) return alert("No transcript to save.");
  try {
    const res = await fetch("/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const j = await res.json();
    if (j.ok) {
      finalTranscript = "";
      finalDiv.textContent = "";
      interimDiv.textContent = "";
      saveBtn.disabled = true;
      loadSaved();
      alert("Saved: " + j.filename);
    } else {
      alert("Save error: " + (j.error || "unknown"));
    }
  } catch (e) {
    console.error(e);
    alert("Network error while saving.");
  }
}

async function loadSaved() {
  try {
    const r = await fetch("/transcripts");
    const list = await r.json();
    savedList.innerHTML = "";
    if (list.length === 0) {
      savedList.innerHTML = "<li><em>No saved transcripts</em></li>";
      return;
    }
    list.forEach(item => {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = item.name;
      const link = document.createElement("a");
      link.href = `/download/${encodeURIComponent(item.name)}`;
      link.textContent = "Download";
      li.appendChild(name);
      li.appendChild(link);
      savedList.appendChild(li);
    });
  } catch (e) {
    savedList.innerHTML = "<li><em>Failed to load saved transcripts</em></li>";
    console.error(e);
  }
}

startBtn.addEventListener("click", startRecognition);
stopBtn.addEventListener("click", stopRecognition);
saveBtn.addEventListener("click", saveTranscript);
langSelect.addEventListener("change", () => {
  if (recognition) {
    // will take effect next start
    recognition.lang = langSelect.value;
  }
});

window.addEventListener("load", () => {
  if (!supportsSpeechAPI()) {
    startBtn.disabled = true;
    stopBtn.disabled = true;
    saveBtn.disabled = true;
    interimDiv.textContent = "Web Speech API not supported in this browser.";
  }
  loadSaved();
});
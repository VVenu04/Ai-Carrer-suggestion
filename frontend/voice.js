window.VoiceAssistant = (() => {
  function getSpeechRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function speak(text, lang) {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("speechSynthesis not supported"));
        return;
      }

      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 1.0;
      utter.pitch = 1.0;

      utter.onend = () => resolve();
      utter.onerror = () => reject(new Error("TTS error"));
      window.speechSynthesis.speak(utter);
    });
  }

  function listen({ lang, timeoutMs = 10000 } = {}) {
    return new Promise((resolve, reject) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        reject(new Error("SpeechRecognition not supported"));
        return;
      }

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = "";

      let timeoutHandle = null;
      const cleanupTimeout = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        timeoutHandle = null;
      };

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || "";
          if (res.isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + transcript;
          }
        }
      };

      recognition.onerror = (e) => {
        cleanupTimeout();
        try { recognition.stop(); } catch {}
        reject(new Error(e.error || "STT error"));
      };

      recognition.onend = () => {
        cleanupTimeout();
        const out = (finalTranscript || "").trim();
        resolve(out);
      };

      timeoutHandle = setTimeout(() => {
        try { recognition.stop(); } catch {}
      }, timeoutMs);

      try {
        recognition.start();
      } catch (e) {
        cleanupTimeout();
        reject(e);
      }
    });
  }

  function setMicPulsing(btnEl, on) {
    if (!btnEl) return;
    btnEl.classList.toggle("pulsing", !!on);
  }

  return {
    speak,
    listen,
    isSpeechRecognitionSupported: () => !!getSpeechRecognitionCtor(),
    setMicPulsing
  };
})();


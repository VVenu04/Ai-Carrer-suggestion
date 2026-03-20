window.I18N = {
  en: {
    ui: {
      homeTitle: "Find the right career path",
      startCareerGuidance: "Start Career Guidance",
      homeSubtitle:
        "Answer a few questions (voice or typing), then get 3–5 career suggestions with a learning path.",
      homeHint: "Voice works best in Chrome.",
      qTitle: "Career Questions",
      qSubTitle: "Step {step} of {total}",
      next: "Next",
      back: "Back",
      resultsTitle: "Career Suggestions",
      resultsSubtitle: "Saved session will be used for chatbot follow-ups.",
      readAloud: "Read aloud",
      downloadPdf: "Download PDF",
      chatTitle: "Career Chatbot",
      chatSubtitle: "Ask follow-up questions.",
      chatInputPlaceholder: "Type your question...",
      sttNotSupported: "Voice input is not supported in this browser. Please type your answer.",
      voiceListening: "Listening... Speak now.",
      voiceCapturing: "Capturing your answer...",
      voiceError: "Could not capture voice. Please type your answer.",
      downloading: "Preparing PDF...",
      missingAnswers: "Please answer all questions before getting suggestions.",
    },
    questions: {
      interests: {
        prompt: "What are your interests? (e.g., coding, business, art)",
        placeholder: "Example: I like coding and learning new tools..."
      },
      subjects: {
        prompt: "Favorite subjects?",
        placeholder: "Example: Maths, Computer Science, English..."
      },
      skills: {
        prompt: "Skills (technical / soft skills)?",
        placeholder: "Example: communication, problem-solving, design..."
      },
      personality: {
        prompt: "Personality (introvert/extrovert)?",
        placeholder: "Example: I’m more introverted but like group projects..."
      },
      workstyle: {
        prompt: "Preferred work style (team/individual)?",
        placeholder: "Example: I prefer teamwork and brainstorming..."
      },
      goals: {
        prompt: "Career goals?",
        placeholder: "Example: I want a job where I can grow and help others..."
      },
      educationLevel: {
        prompt: "Education level?",
        placeholder: "Example: School (Grade 10), College (Year 1), Diploma..."
      }
    }
  },
  ta: {
    ui: {
      homeTitle: "சரியான தொழில் பாதையை கண்டுபிடியுங்கள்",
      startCareerGuidance: "தொழில் வழிகாட்டுதலை தொடங்கவும்",
      homeSubtitle:
        "சில கேள்விகளுக்கு (குரல் அல்லது தட்டச்சு) பதில் அளிக்கவும். பின்னர் 3–5 தொழில் பரிந்துரைகள் + கற்றல் பாதை கிடைக்கும்.",
      homeHint: "குரல் வசதி Chrome-ல் சிறப்பாக வேலை செய்யும்.",
      qTitle: "தொழில் கேள்விகள்",
      qSubTitle: "படி {step} / {total}",
      next: "அடுத்து",
      back: "மீண்டும்",
      resultsTitle: "தொழில் பரிந்துரைகள்",
      resultsSubtitle: "சேமிக்கப்பட்ட தகவல், chatbot தொடர்ந்து கேள்விகளுக்கு பயன்படும்.",
      readAloud: "மீண்டும் ஒலி படிக்கவும்",
      downloadPdf: "PDF பதிவிறக்க",
      chatTitle: "தொழில் Chatbot",
      chatSubtitle: "தொடர்பான கேள்விகள் கேளுங்கள்.",
      chatInputPlaceholder: "உங்கள் கேள்வியை எழுதுங்கள்...",
      sttNotSupported: "இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. தயவுசெய்து தட்டச்சு செய்யுங்கள்.",
      voiceListening: "கேட்கிறோம்... இப்போது பேசுங்கள்.",
      voiceCapturing: "உங்கள் பதிலை பதிவு செய்கிறோம்...",
      voiceError: "குரலை பெற முடியவில்லை. தயவுசெய்து தட்டச்சு செய்யுங்கள்.",
      downloading: "PDF தயாராகிறது...",
      missingAnswers: "முன் உங்கள் எல்லா கேள்விகளுக்கும் பதில் அளிக்கவும்.",
    },
    questions: {
      interests: {
        prompt: "உங்கள் ஆர்வங்கள் என்ன? (உதா: நிரலாக்கம், வணிகம், கலை)",
        placeholder: "உதா: எனக்கு coding பிடிக்கும், புதிய விஷயங்களை கற்றுக்கொள்ள விரும்புகிறேன்..."
      },
      subjects: {
        prompt: "பிடித்த பாடங்கள்?",
        placeholder: "உதா: கணிதம், கணினி அறிவியல், ஆங்கிலம்..."
      },
      skills: {
        prompt: "திறன்கள் (தொழில்நுட்ப/மென்மையான திறன்கள்)?",
        placeholder: "உதா: தொடர்பு திறன், பிரச்சனை தீர்ப்பு, வடிவமைப்பு..."
      },
      personality: {
        prompt: "உங்கள் நபர் தன்மை (introvert/extrovert)?",
        placeholder: "உதா: நான் அதிகமாக introvert; ஆனால் குழு திட்டங்களில் ஈடுபட விரும்புகிறேன்..."
      },
      workstyle: {
        prompt: "வேலை செய்யும் முறை (குழு/தனிநபர்)?",
        placeholder: "உதா: teamwork மற்றும் brainstorming பிடிக்கும்..."
      },
      goals: {
        prompt: "உங்கள் தொழில் இலக்குகள்?",
        placeholder: "உதா: வளர்ச்சியுடன் உதவி செய்யும் வேலையை வேண்டும்..."
      },
      educationLevel: {
        prompt: "உங்கள் கல்வி நிலை?",
        placeholder: "உதா: பள்ளி (10ம் வகுப்பு), கல்லூரி (1ம் ஆண்டு), டிப்ளமோ..."
      }
    }
  }
};

window.getLangConfig = function(lang) {
  if (lang === "ta") {
    return { sttLang: "ta-IN", ttsLang: "ta-IN" };
  }
  return { sttLang: "en-US", ttsLang: "en-US" };
};


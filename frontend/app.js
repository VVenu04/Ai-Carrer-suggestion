window.CareerApp = (() => {
  const state = {
    language: "en",
    voiceMode: false,
    sessionId: null,
    careers: [],
    studentAnswers: {
      interests: "",
      subjects: "",
      skills: "",
      personality: "",
      workstyle: "",
      goals: "",
      educationLevel: "",
    }
  };

  const questionOrder = [
    { key: "interests" },
    { key: "subjects" },
    { key: "skills" },
    { key: "personality" },
    { key: "workstyle" },
    { key: "goals" },
    { key: "educationLevel" },
  ];

  const els = {
    homeView: document.getElementById("homeView"),
    questionsView: document.getElementById("questionsView"),
    resultsView: document.getElementById("resultsView"),

    homeTitle: document.getElementById("homeTitle"),
    homeSubtitle: document.getElementById("homeSubtitle"),
    homeHint: document.getElementById("homeHint"),

    startBtn: document.getElementById("startBtn"),
    micHomeBtn: document.getElementById("micHomeBtn"),

    languageSelect: document.getElementById("languageSelect"),

    qTitle: document.getElementById("qTitle"),
    qSubTitle: document.getElementById("qSubTitle"),
    qStep: document.getElementById("qStep"),
    qTotal: document.getElementById("qTotal"),
    questionPrompt: document.getElementById("questionPrompt"),
    answerInput: document.getElementById("answerInput"),
    nextBtn: document.getElementById("nextBtn"),
    backBtn: document.getElementById("backBtn"),
    micAnswerBtn: document.getElementById("micAnswerBtn"),
    voiceStatus: document.getElementById("voiceStatus"),
    sttSupportHint: document.getElementById("sttSupportHint"),
    typingBubble: document.getElementById("typingBubble"),

    cardsContainer: document.getElementById("cardsContainer"),
    readAloudBtn: document.getElementById("readAloudBtn"),
    downloadPdfBtn: document.getElementById("downloadPdfBtn"),
    sessionIdDisplay: document.getElementById("sessionIdDisplay"),

    resultsTitle: document.getElementById("resultsTitle"),
    resultsSubtitle: document.getElementById("resultsSubtitle"),
    chatTitle: document.getElementById("chatTitle"),
    chatSubtitle: document.getElementById("chatSubtitle"),

    readAloudResultsBtn: document.getElementById("chatReadAloudBtn"),
    chatInput: document.getElementById("chatInput"),
  };

  function showView(viewEl) {
    [els.homeView, els.questionsView, els.resultsView].forEach((v) => {
      if (!v) return;
      v.classList.toggle("active", v === viewEl);
    });
  }

  function setAssistantThinking(on) {
    if (els.typingBubble) els.typingBubble.style.display = on ? "block" : "none";
  }

  function setLoadingOverlay(on) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = on ? "flex" : "none";
  }

  function getLangText(key) {
    return window.I18N?.[state.language]?.ui?.[key] || "";
  }

  function getQuestionText(qKey, variant) {
    const langBlock = window.I18N?.[state.language]?.questions?.[qKey];
    if (!langBlock) return "";
    return variant === "placeholder" ? langBlock.placeholder : langBlock.prompt;
  }

  function refreshLanguageUi() {
    if (els.qTitle) els.qTitle.textContent = window.I18N[state.language].ui.qTitle;
    if (els.homeTitle) els.homeTitle.textContent = window.I18N[state.language].ui.homeTitle;
    if (els.homeSubtitle) els.homeSubtitle.textContent = window.I18N[state.language].ui.homeSubtitle;
    if (els.homeHint) els.homeHint.textContent = window.I18N[state.language].ui.homeHint;
    if (els.qSubTitle) {
      els.qSubTitle.innerHTML = (window.I18N[state.language].ui.qSubTitle || "")
        .replace("{step}", els.qStep?.textContent || "1")
        .replace("{total}", els.qTotal?.textContent || "7");
    }
    if (els.startBtn) els.startBtn.textContent = window.I18N[state.language].ui.startCareerGuidance;
    if (els.nextBtn) els.nextBtn.textContent = window.I18N[state.language].ui.next;
    if (els.backBtn) els.backBtn.textContent = window.I18N[state.language].ui.back;
    if (els.readAloudBtn) els.readAloudBtn.textContent = window.I18N[state.language].ui.readAloud;
    if (els.downloadPdfBtn) els.downloadPdfBtn.textContent = window.I18N[state.language].ui.downloadPdf;
    if (els.resultsTitle) els.resultsTitle.textContent = window.I18N[state.language].ui.resultsTitle;
    if (els.resultsSubtitle) els.resultsSubtitle.textContent = window.I18N[state.language].ui.resultsSubtitle;
    if (els.chatTitle) els.chatTitle.textContent = window.I18N[state.language].ui.chatTitle;
    if (els.chatSubtitle) els.chatSubtitle.textContent = window.I18N[state.language].ui.chatSubtitle;
  }

  function resetAll() {
    state.sessionId = null;
    state.careers = [];
    state.studentAnswers = {
      interests: "",
      subjects: "",
      skills: "",
      personality: "",
      workstyle: "",
      goals: "",
      educationLevel: "",
    };
  }

  let currentQuestionIndex = 0;

  function renderQuestion(idx) {
    currentQuestionIndex = idx;
    const total = questionOrder.length;
    els.qStep.textContent = String(idx + 1);
    els.qTotal.textContent = String(total);

    const qKey = questionOrder[idx].key;
    els.questionPrompt.textContent = getQuestionText(qKey, "prompt");
    els.answerInput.placeholder = getQuestionText(qKey, "placeholder");
    els.answerInput.value = state.studentAnswers[qKey] || "";

    els.sttSupportHint.textContent = "";
    els.voiceStatus.textContent = "";

    // Update subtitle
    els.qSubTitle.innerHTML = (window.I18N[state.language].ui.qSubTitle || "")
      .replace("{step}", els.qStep.textContent)
      .replace("{total}", els.qTotal.textContent);
  }

  function disableQuestionControls(disabled) {
    if (els.nextBtn) els.nextBtn.disabled = disabled;
    if (els.backBtn) els.backBtn.disabled = disabled;
    if (els.micAnswerBtn) els.micAnswerBtn.disabled = disabled;
    if (els.answerInput) els.answerInput.disabled = disabled;
  }

  function saveCurrentAnswerAndProceed() {
    const qKey = questionOrder[currentQuestionIndex].key;
    const value = (els.answerInput.value || "").trim();
    state.studentAnswers[qKey] = value;
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= questionOrder.length) {
      submitCareerSuggestions();
      return;
    }
    renderQuestion(nextIdx);
    els.answerInput.focus();
  }

  function confirmCurrentAnswerOnly() {
    const qKey = questionOrder[currentQuestionIndex].key;
    const value = (els.answerInput.value || "").trim();
    state.studentAnswers[qKey] = value;
  }

  async function submitCareerSuggestions() {
    const missingIndex = questionOrder.findIndex((q) => {
      const v = (state.studentAnswers[q.key] || "").trim();
      return v.length === 0;
    });
    if (missingIndex >= 0) {
      showToast(window.I18N[state.language].ui.missingAnswers);
      renderQuestion(missingIndex);
      els.answerInput.focus();
      return;
    }

    disableQuestionControls(true);
    setAssistantThinking(true);
    setLoadingOverlay(true);
    els.voiceStatus.textContent = "";

    try {
      const res = await window.ApiClient.requestCareerSuggestions(state.language, state.studentAnswers);
      state.sessionId = res.sessionId;
      state.careers = res.careers || [];
      renderResults();
    } catch (e) {
      showToast(e?.message || "Failed to get suggestions.");
    } finally {
      setLoadingOverlay(false);
      setAssistantThinking(false);
      disableQuestionControls(false);
    }
  }

  function showToast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "26px";
      el.style.transform = "translateX(-50%)";
      el.style.zIndex = "1000";
      el.style.background = "rgba(0,0,0,0.7)";
      el.style.border = "1px solid rgba(255,255,255,0.18)";
      el.style.padding = "10px 14px";
      el.style.borderRadius = "12px";
      el.style.color = "white";
      el.style.fontWeight = "700";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 5000);
  }

  function renderResults() {
    showView(els.resultsView);
    els.sessionIdDisplay.textContent = state.sessionId ? `Session: ${state.sessionId}` : "";
    els.cardsContainer.innerHTML = "";

    if (!state.careers?.length) {
      els.cardsContainer.innerHTML = `<div class="card"><div class="card-title">No results</div><div class="card-text">${state.language === "ta" ? "AI பதில் இல்லை." : "AI did not return results."}</div></div>`;
      return;
    }

    state.careers.forEach((career) => {
      const card = document.createElement("div");
      card.className = "card";

      const skills = (career.required_skills || [])
        .slice(0, 8)
        .map((s) => `<div class="chip">${escapeHtml(s)}</div>`)
        .join("");

      const learning = (career.learning_path || [])
        .slice(0, 10)
        .map((s) => `• ${escapeHtml(s)}`)
        .join("<br/>");

      const isTa = state.language === "ta";
      card.innerHTML = `
        <div class="card-title">${escapeHtml(career.name || "")}</div>
        <div class="card-meta">${isTa ? "விளக்கம்" : "Description"}</div>
        <div class="card-text">${escapeHtml(career.description || "")}</div>

        <div class="card-section-title">${isTa ? "தேவையான திறன்கள்" : "Required Skills"}</div>
        <div class="chip-list">${skills || ""}</div>

        <div class="card-section-title">${isTa ? "எதிர்கால தேவை" : "Future Demand"}</div>
        <div class="card-text">${escapeHtml(career.future_demand || "")}</div>

        <div class="card-section-title">${isTa ? "கற்றல் பாதை" : "Learning Path"}</div>
        <div class="card-text">${learning || "-"}</div>
      `;
      els.cardsContainer.appendChild(card);
    });

    // Initialize chat composer for this session
    if (window.ChatUI?.clearMessages) window.ChatUI.clearMessages(document.getElementById("chatMessages"));
    initChatWiring();
  }

function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .toString();
}
  function getTtsLang() {
    return window.getLangConfig(state.language).ttsLang;
  }

  function readAloudText() {
    if (!state.careers?.length) return "";
    const isTa = state.language === "ta";
    const parts = state.careers.map((c, idx) => {
      const title = isTa ? `பரிந்துரை ${idx + 1}: ${c.name}` : `Suggestion ${idx + 1}: ${c.name}`;
      const desc = isTa ? `விளக்கம்: ${c.description}` : `Description: ${c.description}`;
      const skills = (c.required_skills || []).slice(0, 6).join(", ");
      const skillsText = isTa ? `திறன்கள்: ${skills}` : `Skills: ${skills}`;
      const demand = isTa ? `எதிர்கால தேவை: ${c.future_demand}` : `Future demand: ${c.future_demand}`;
      const path = (c.learning_path || []).slice(0, 5).join(". ");
      const learning = isTa ? `கற்றல் பாதை: ${path}` : `Learning path: ${path}`;
      return [title, desc, skillsText, demand, learning].filter(Boolean).join(" ");
    });
    return parts.join(" ");
  }

  async function readAloud() {
    try {
      const text = readAloudText();
      if (!text) {
        showToast("Nothing to read.");
        return;
      }
      setLoadingOverlay(true);
      await window.VoiceAssistant.speak(text, getTtsLang());
    } catch (e) {
      showToast(e?.message || "Voice output failed.");
    } finally {
      setLoadingOverlay(false);
    }
  }

  async function captureVoiceAnswerForCurrentQuestion() {
    const isSupported = window.VoiceAssistant.isSpeechRecognitionSupported();
    if (!isSupported) {
      els.sttSupportHint.textContent = window.I18N[state.language].ui.sttNotSupported;
      return;
    }

    disableQuestionControls(true);
    setAssistantThinking(false);
    const sttLang = window.getLangConfig(state.language).sttLang;
    els.voiceStatus.textContent = window.I18N[state.language].ui.voiceListening;

    try {
      window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, true);
      const transcript = await window.VoiceAssistant.listen({ lang: sttLang, timeoutMs: 14000 });
      window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, false);

      if (!transcript) {
        els.voiceStatus.textContent = window.I18N[state.language].ui.voiceError;
        return;
      }

      els.answerInput.value = transcript;
      els.voiceStatus.textContent = window.I18N[state.language].ui.voiceCapturing;
      els.nextBtn.disabled = false;
    } catch (e) {
      window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, false);
      els.voiceStatus.textContent = window.I18N[state.language].ui.voiceError;
    } finally {
      disableQuestionControls(false);
      els.answerInput.focus();
    }
  }

  async function startVoiceAssistantFlow() {
    resetAll();
    state.voiceMode = true;
    showView(els.questionsView);

    els.answerInput.disabled = false;
    disableQuestionControls(false);

    const sttSupported = window.VoiceAssistant.isSpeechRecognitionSupported();
    if (!sttSupported) {
      els.sttSupportHint.textContent = window.I18N[state.language].ui.sttNotSupported;
    }

    const homeMicBtn = els.micHomeBtn;
    try {
      window.VoiceAssistant?.setMicPulsing?.(homeMicBtn, true);

      renderQuestion(0);
      // Step through questions. "Next" confirms each answer.
      for (let i = 0; i < questionOrder.length; i++) {
        renderQuestion(i);
        const qKey = questionOrder[i].key;
        const prompt = getQuestionText(qKey, "prompt");

        // Speak question
        setAssistantThinking(false);
        els.voiceStatus.textContent = "";
        disableQuestionControls(true);

        try {
          await window.VoiceAssistant.speak(prompt, getTtsLang());
        } catch {
          // If TTS fails, user can still type.
        }

        // Listen for the answer (if supported)
        const canListen = window.VoiceAssistant.isSpeechRecognitionSupported();
        if (canListen) {
          els.voiceStatus.textContent = window.I18N[state.language].ui.voiceListening;
          window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, true);
          try {
            const transcript = await window.VoiceAssistant.listen({ lang: window.getLangConfig(state.language).sttLang, timeoutMs: 16000 });
            window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, false);
            if (transcript) {
              state.studentAnswers[qKey] = transcript;
              els.answerInput.value = transcript;
            } else {
              els.voiceStatus.textContent = window.I18N[state.language].ui.voiceError;
            }
          } catch {
            window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, false);
          }
        } else {
          els.voiceStatus.textContent = window.I18N[state.language].ui.sttNotSupported;
        }

        // Allow typing/editing + Next to confirm.
        disableQuestionControls(false);
        els.answerInput.focus();
        await waitForNextClick();
      }
      await submitCareerSuggestions();
    } finally {
      window.VoiceAssistant?.setMicPulsing?.(homeMicBtn, false);
      window.VoiceAssistant?.setMicPulsing?.(els.micAnswerBtn, false);
    }
  }

  function waitForNextClick() {
    return new Promise((resolve) => {
      const handler = () => {
        els.nextBtn.removeEventListener("click", handler);
        resolve();
      };
      els.nextBtn.addEventListener("click", handler);
    });
  }

  function initChatWiring() {
    const onSend = async (msg) => {
      setAssistantThinking(true);
      setLoadingOverlay(true);
      try {
        const res = await window.ApiClient.requestChat(state.sessionId, state.language, msg);
        const d = new Date();
        const messagesEl = document.getElementById("chatMessages");
        messagesEl.appendChild(window.ChatUI.renderBubble("assistant", res.reply, d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})));
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (window.VoiceAssistant && window.VoiceAssistant.isSpeechRecognitionSupported) {
          // no-op: keep assistant reply text in UI; read aloud button exists
        }
      } catch (e) {
        showToast(e?.message || "Chat failed.");
      } finally {
        setLoadingOverlay(false);
        setAssistantThinking(false);
      }
    };

    const onReadLast = async () => {
      const messagesEl = document.getElementById("chatMessages");
      const bubbles = messagesEl.querySelectorAll(".bubble.assistant");
      const last = bubbles[bubbles.length - 1];
      const text = last?.querySelector?.(".text")?.textContent || last?.innerText || "";
      if (!text) {
        showToast("No assistant reply to read.");
        return;
      }
      try {
        setLoadingOverlay(true);
        await window.VoiceAssistant.speak(text, getTtsLang());
      } catch (e) {
        showToast(e?.message || "Voice output failed.");
      } finally {
        setLoadingOverlay(false);
      }
    };

    window.ChatUI.wireChat({ onSend, onReadLast });
  }

  function bindEvents() {
    if (els.languageSelect) {
      els.languageSelect.addEventListener("change", () => {
        state.language = els.languageSelect.value;
        refreshLanguageUi();
        // Update current prompt immediately if we're on questions view.
        const isQuestions = els.questionsView && els.questionsView.classList.contains("active");
        if (isQuestions) renderQuestion(currentQuestionIndex);
      });
    }

    els.startBtn?.addEventListener("click", () => {
      resetAll();
      state.voiceMode = false;
      showView(els.questionsView);
      renderQuestion(0);
      els.answerInput.focus();
    });

    els.micHomeBtn?.addEventListener("click", async () => {
      await startVoiceAssistantFlow();
    });

    els.nextBtn?.addEventListener("click", () => {
      if (state.voiceMode) {
        // In voice mode, Next only confirms the current answer.
        confirmCurrentAnswerOnly();
        return;
      }
      saveCurrentAnswerAndProceed();
    });

    els.backBtn?.addEventListener("click", () => {
      if (state.voiceMode) {
        showToast("Back is disabled in voice mode for simplicity.");
        return;
      }
      if (currentQuestionIndex <= 0) return;
      renderQuestion(currentQuestionIndex - 1);
      els.answerInput.focus();
    });

    els.micAnswerBtn?.addEventListener("click", async () => {
      await captureVoiceAnswerForCurrentQuestion();
    });

    els.readAloudBtn?.addEventListener("click", () => readAloud());

    els.downloadPdfBtn?.addEventListener("click", () => {
      try {
        window.PdfUtil.downloadCareerPdf({
          careers: state.careers,
          language: state.language,
          studentAnswers: state.studentAnswers,
          sessionId: state.sessionId,
        });
      } catch (e) {
        showToast(e?.message || "PDF generation failed.");
      }
    });
  }

  function init() {
    // Initial view
    showView(els.homeView);
    // Language selection
    if (els.languageSelect) els.languageSelect.value = state.language;
    refreshLanguageUi();
    bindEvents();
  }

  return { init, state };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (window.CareerApp) window.CareerApp.init();
});


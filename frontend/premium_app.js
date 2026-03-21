// Premium AI Career Guidance wizard (vanilla JS)
// Keeps backend input simple (strings), while the UI collects structured selections.

window.PremiumCareerApp = (() => {
  const state = {
    theme: "dark",
    language: "en",
    voiceMode: false,
    sessionId: null,
    careers: [],
    interestsPage: 0,
    // Answers collected from the wizard
    answers: {
      interests: [], // array of interest ids
      skills: {}, // { skillId: level } where level is "beginner" | "intermediate" | "advanced"
      personality: null,
      workstyle: null,
      risk: null,
      learningStyle: null,
      motivation: [], // array of motivation ids
      educationLevel: null,
    },
    // Wizard navigation
    stepIndex: 0,
    // For the "skills level" step: we show level for one skill at a time
    skillLevelSubIndex: 0,
    isListening: false,
  };

  const THEMES = { dark: "dark", light: "light" };

  // ---- Option catalogs (used for numbering + rendering) ----
  const catalog = {
    interests: [
      {
        category: "Technology",
        emoji: "💻",
        options: [
          { id: "coding", label: "Coding / Software Development", emoji: "💻" },
          { id: "ai_ml", label: "Artificial Intelligence / Machine Learning", emoji: "🤖" },
          { id: "cybersecurity", label: "Cybersecurity", emoji: "🛡️" },
          { id: "game_dev", label: "Game Development", emoji: "🎮" },
        ],
      },
      {
        category: "Business",
        emoji: "📈",
        options: [
          { id: "startups", label: "Entrepreneurship / Startups", emoji: "🚀" },
          { id: "marketing", label: "Marketing / Branding", emoji: "📣" },
          { id: "finance", label: "Finance / Investing", emoji: "💰" },
          { id: "management", label: "Management / Leadership", emoji: "🏅" },
        ],
      },
      {
        category: "Creative",
        emoji: "🎨",
        options: [
          { id: "graphic_design", label: "Graphic Design", emoji: "🎨" },
          { id: "video_editing", label: "Video Editing / Content Creation", emoji: "🎬" },
          { id: "ui_ux", label: "UI/UX Design", emoji: "🧩" },
          { id: "writing", label: "Writing / Storytelling", emoji: "✍️" },
        ],
      },
      {
        category: "People-Oriented",
        emoji: "🧑‍🤝‍🧑",
        options: [
          { id: "teaching", label: "Teaching / Mentoring", emoji: "🧑‍🏫" },
          { id: "psychology", label: "Psychology / Counseling", emoji: "🧠" },
          { id: "social_work", label: "Social Work", emoji: "🤝" },
          { id: "public_speaking", label: "Public Speaking", emoji: "🎙️" },
        ],
      },
      {
        category: "Science & Health",
        emoji: "🧪",
        options: [
          { id: "medicine", label: "Medicine", emoji: "🩺" },
          { id: "engineering", label: "Engineering", emoji: "🛠️" },
          { id: "research", label: "Research", emoji: "🔬" },
          { id: "environment", label: "Environmental Science", emoji: "🌿" },
        ],
      },
    ],
    skills: [
      { id: "problem_solving", label: "Problem Solving" },
      { id: "communication", label: "Communication" },
      { id: "leadership", label: "Leadership" },
      { id: "creativity", label: "Creativity" },
      { id: "analytical", label: "Analytical Thinking" },
      { id: "technical", label: "Technical Skills" },
      { id: "time_management", label: "Time Management" },
      { id: "critical_thinking", label: "Critical Thinking" },
    ],
    personality: [
      { id: "introvert", label: "Introvert", emoji: "🌙" },
      { id: "extrovert", label: "Extrovert", emoji: "🌞" },
      { id: "ambivert", label: "Ambivert", emoji: "⚖️" },
    ],
    workstyle: [
      { id: "office", label: "Office / Corporate", emoji: "🏢" },
      { id: "remote", label: "Remote / Work from home", emoji: "🏠" },
      { id: "field", label: "Field work / Outdoor", emoji: "🧭" },
      { id: "hybrid", label: "Flexible / Hybrid", emoji: "🔄" },
    ],
    risk: [
      { id: "low", label: "Low (Safe career)", emoji: "🛟" },
      { id: "medium", label: "Medium", emoji: "🧠" },
      { id: "high", label: "High (Startup / risky career)", emoji: "🚀" },
    ],
    learningStyle: [
      { id: "practical", label: "Practical (Hands-on)", emoji: "🧰" },
      { id: "theoretical", label: "Theoretical", emoji: "📚" },
      { id: "visual", label: "Visual / Creative", emoji: "🖼️" },
      { id: "self_learning", label: "Self-learning", emoji: "🧗" },
    ],
    motivation: [
      { id: "money", label: "Money", emoji: "💵" },
      { id: "passion", label: "Passion", emoji: "🔥" },
      { id: "impact", label: "Impact on society", emoji: "🌍" },
      { id: "fame", label: "Fame / Recognition", emoji: "🏆" },
      { id: "innovation", label: "Innovation", emoji: "💡" },
    ],
    educationLevel: [
      { id: "school", label: "School (Grade 10–12)", emoji: "🏫" },
      { id: "diploma", label: "Diploma / ITI", emoji: "🎓" },
      { id: "bachelors", label: "Bachelor's", emoji: "📘" },
      { id: "masters", label: "Master's", emoji: "🎓" },
      { id: "other", label: "Currently exploring / Other", emoji: "🧩" },
    ],
  };

  const levelLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  const steps = [
    { key: "interests" },
    { key: "skillsSelect" },
    { key: "skillsLevels" }, // dynamic sub-index
    { key: "personality" },
    { key: "workstyle" },
    { key: "risk" },
    { key: "learningStyle" },
    { key: "motivation" },
    { key: "educationLevel" },
  ];

  // Map step index -> which UI prompt to show
  function i18nUI(key) {
    return window.I18N?.[state.language]?.ui?.[key] || window.I18N?.en?.ui?.[key] || key;
  }

  // ---- DOM elements ----
  const els = {
    // Views
    homeView: document.getElementById("homeView"),
    questionsView: document.getElementById("questionsView"),
    reviewView: document.getElementById("reviewView"),
    resultsView: document.getElementById("resultsView"),

    // Wizard
    qTitle: document.getElementById("qTitle"),
    qSubTitle: document.getElementById("qSubTitle"),
    qStep: document.getElementById("qStep"),
    qTotal: document.getElementById("qTotal"),
    progressFill: document.getElementById("progressFill"),
    progressLabel: document.getElementById("progressLabel"),
    questionPrompt: document.getElementById("questionPrompt"),
    questionHint: document.getElementById("questionHint"),
    optionsContainer: document.getElementById("optionsContainer"),
    voiceStatus: document.getElementById("voiceStatus"),
    sttSupportHint: document.getElementById("sttSupportHint"),
    micAnswerBtn: document.getElementById("micAnswerBtn"),
    backBtn: document.getElementById("backBtn"),
    nextBtn: document.getElementById("nextBtn"),
    typingBubble: document.getElementById("typingBubble"),

    // Home
    startBtn: document.getElementById("startBtn"),
    micHomeBtn: document.getElementById("micHomeBtn"),

    // Review
    reviewTitle: document.getElementById("reviewTitle"),
    reviewSubtitle: document.getElementById("reviewSubtitle"),
    reviewSummary: document.getElementById("reviewSummary"),
    reviewBackBtn: document.getElementById("reviewBackBtn"),
    generateBtn: document.getElementById("generateBtn"),
    reviewVoiceStatus: document.getElementById("reviewVoiceStatus"),

    // Results
    cardsContainer: document.getElementById("cardsContainer"),
    readAloudBtn: document.getElementById("readAloudBtn"),
    downloadPdfBtn: document.getElementById("downloadPdfBtn"),
    sessionIdDisplay: document.getElementById("sessionIdDisplay"),

    // Chat
    chatMessages: document.getElementById("chatMessages"),
    chatForm: document.getElementById("chatForm"),
    chatInput: document.getElementById("chatInput"),
    chatReadAloudBtn: document.getElementById("chatReadAloudBtn"),
  };

  // ---- Utility ----
  function showView(viewEl) {
    [els.homeView, els.questionsView, els.reviewView, els.resultsView].forEach((v) => {
      if (!v) return;
      v.classList.toggle("active", v === viewEl);
      v.style.display = v === viewEl ? "block" : "none";
    });
  }

  function setLoadingOverlay(on) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = on ? "flex" : "none";
  }

  function setAssistantThinking(on, el) {
    if (!el) return;
    el.style.display = on ? "block" : "none";
  }

  function setTheme(nextTheme) {
    state.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {}
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = nextTheme === THEMES.dark ? "Light" : "Dark";
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

  function speak(text) {
    if (!window.VoiceAssistant?.speak) return Promise.resolve();
    return window.VoiceAssistant.speak(text, getTtsLang());
  }

  function getTtsLang() {
    return window.getLangConfig(state.language).ttsLang;
  }

  function isSpeechSupported() {
    return window.VoiceAssistant?.isSpeechRecognitionSupported?.() || false;
  }

  // Extract numbers from both digits ("1 and 3") and words ("one three")
  function extractNumbers(text) {
    const t = (text || "").toLowerCase();
    const out = new Set();

    // digits
    const digits = t.match(/\d+/g) || [];
    digits.forEach((d) => out.add(parseInt(d, 10)));

    // words 1..20
    const wordMap = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
    };

    const words = Object.keys(wordMap);
    for (const w of words) {
      if (t.includes(w)) out.add(wordMap[w]);
    }
    return Array.from(out).sort((a, b) => a - b);
  }

  // ---- Option rendering helpers ----
  let currentNumberMap = new Map(); // number -> { type, id, label }

  function buildNumberMapFromOptions(optionList) {
    // optionList: [{ id, label, emoji? }]
    currentNumberMap = new Map();
    optionList.forEach((opt, idx) => {
      currentNumberMap.set(idx + 1, { id: opt.id, label: opt.label, emoji: opt.emoji });
    });
  }

  function getInterestsFlat() {
    // Flatten for numbering
    const flat = [];
    catalog.interests.forEach((cat) => {
      cat.options.forEach((o) => {
        flat.push({ ...o, category: cat.category, emoji: o.emoji || cat.emoji });
      });
    });
    return flat;
  }

  const INTERESTS_PAGE_SIZE = 10;

  function getInterestsPage() {
    const flat = getInterestsFlat();
    const totalPages = Math.max(1, Math.ceil(flat.length / INTERESTS_PAGE_SIZE));
    const page = Math.min(totalPages - 1, Math.max(0, state.interestsPage || 0));
    const start = page * INTERESTS_PAGE_SIZE;
    const options = flat.slice(start, start + INTERESTS_PAGE_SIZE);
    return { flat, totalPages, page, options };
  }

  function getSkillsFlat() {
    return catalog.skills.map((s) => ({ ...s }));
  }

  // ---- Validation ----
  function validateCurrentStep() {
    const stepKey = steps[state.stepIndex].key;
    if (stepKey === "interests") return state.answers.interests.length > 0;
    if (stepKey === "skillsSelect") return Object.keys(state.answers.skills).length > 0;
    if (stepKey === "skillsLevels") {
      const selectedSkillIds = Object.keys(state.answers.skills);
      if (selectedSkillIds.length === 0) return false;
      // Enable Next only when all selected skills have a level.
      return selectedSkillIds.every((sid) => !!state.answers.skills[sid]);
    }
    if (stepKey === "personality") return !!state.answers.personality;
    if (stepKey === "workstyle") return !!state.answers.workstyle;
    if (stepKey === "risk") return !!state.answers.risk;
    if (stepKey === "learningStyle") return !!state.answers.learningStyle;
    if (stepKey === "motivation") return state.answers.motivation.length > 0;
    if (stepKey === "educationLevel") return !!state.answers.educationLevel;
    return false;
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
    setTimeout(() => { el.style.display = "none"; }, 4500);
  }

  // ---- Render step UI ----
  function renderProgress() {
    const totalSteps = steps.length;
    const cur = state.stepIndex + 1;
    els.qStep.textContent = String(cur);
    els.qTotal.textContent = String(totalSteps);

    if (els.progressFill) {
      const pct = Math.round((cur / totalSteps) * 100);
      els.progressFill.style.width = `${pct}%`;
    }
    if (els.progressLabel) els.progressLabel.textContent = `Step ${cur} / ${totalSteps}`;
  }

  function clearOptions() {
    if (els.optionsContainer) els.optionsContainer.innerHTML = "";
  }

  function renderInterests() {
    els.questionPrompt.textContent = state.language === "ta" ? "உங்கள் ஆர்வங்கள் என்ன?" : "What are your interests?";
    const { totalPages, page } = getInterestsPage();
    els.questionHint.textContent = state.language === "ta"
      ? `பலவற்றை தேர்ந்தெடுக்கலாம். (பக்கம் ${page + 1} / ${totalPages})`
      : `Select multiple. (Page ${page + 1} / ${totalPages})`;
    clearOptions();

    const { options, totalPages: tp, page: pg } = getInterestsPage();

    // Number only the visible options for the voice flow.
    buildNumberMapFromOptions(options.map(({ id, label, emoji }) => ({ id, label, emoji })));

    els.optionsContainer.style.gridTemplateColumns = "1fr 1fr";
    options.forEach((opt, idx) => {
      const number = idx + 1;
      const selected = state.answers.interests.includes(opt.id);
      const card = document.createElement("div");
      card.className = "option-card" + (selected ? " selected" : "");
      card.dataset.type = "interests";
      card.dataset.id = opt.id;
      card.innerHTML = `
        <div class="option-emoji">${escapeHtml(opt.emoji || "✨")}</div>
        <div style="flex:1;">
          <div class="option-label">${escapeHtml(opt.label)}</div>
          <div class="option-sub">${escapeHtml(`Option ${number}`)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        toggleMultiAnswer("interests", opt.id);
        renderStep();
      });
      els.optionsContainer.appendChild(card);
    });

    // Page navigation (keeps selections across pages)
    if (tp > 1) {
      const nav = document.createElement("div");
      nav.style.gridColumn = "1 / -1";
      nav.style.display = "flex";
      nav.style.justifyContent = "space-between";
      nav.style.alignItems = "center";
      nav.style.gap = "10px";
      nav.style.marginTop = "12px";
      nav.innerHTML = `
        <button class="btn ghost small" type="button" id="interestsPrevBtn" ${pg <= 0 ? "disabled" : ""}>Prev</button>
        <div class="hint" style="font-weight:800;">${escapeHtml(`Page ${pg + 1} / ${tp}`)}</div>
        <button class="btn ghost small" type="button" id="interestsNextBtn" ${pg >= tp - 1 ? "disabled" : ""}>Next</button>
      `;
      els.optionsContainer.appendChild(nav);

      const prevBtn = document.getElementById("interestsPrevBtn");
      const nextBtn = document.getElementById("interestsNextBtn");
      prevBtn?.addEventListener("click", () => {
        state.interestsPage = Math.max(0, state.interestsPage - 1);
        renderStep();
      });
      nextBtn?.addEventListener("click", () => {
        state.interestsPage = Math.min(tp - 1, state.interestsPage + 1);
        renderStep();
      });
    }
  }

  function renderSkillsSelect() {
    els.questionPrompt.textContent = state.language === "ta" ? "உங்கள் திறன்கள் என்ன?" : "Which skills do you have?";
    els.questionHint.textContent = state.language === "ta" ? "பலவற்றை தேர்ந்தெடுக்கவும்." : "Select multiple.";
    clearOptions();

    const flat = getSkillsFlat();
    buildNumberMapFromOptions(flat.map(({ id, label }) => ({ id, label })));

    const selectedSkillIds = Object.keys(state.answers.skills);

    els.optionsContainer.style.gridTemplateColumns = "1fr 1fr";
    catalog.skills.forEach((skill, idx) => {
      const number = idx + 1;
      const selected = selectedSkillIds.includes(skill.id);
      const card = document.createElement("div");
      card.className = "option-card" + (selected ? " selected" : "");
      card.dataset.type = "skillsSelect";
      card.dataset.id = skill.id;
      card.innerHTML = `
        <div class="option-emoji">🧠</div>
        <div style="flex:1;">
          <div class="option-label">${escapeHtml(skill.label)}</div>
          <div class="option-sub">${escapeHtml(`Option ${number}`)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        toggleSkillSelection(skill.id);
        renderStep();
      });
      els.optionsContainer.appendChild(card);
    });
  }

  function toggleSkillSelection(skillId) {
    if (!state.answers.skills[skillId]) {
      // Select with default beginner until levels step changes it.
      state.answers.skills[skillId] = null;
    } else {
      // Unselect
      delete state.answers.skills[skillId];
    }
  }

  function renderSkillsLevels() {
    els.questionPrompt.textContent = state.language === "ta" ? "இந்த திறனுக்கான நிலை என்ன?" : "Set your level";
    const selectedSkillIds = Object.keys(state.answers.skills);
    const curSkillId = selectedSkillIds[state.skillLevelSubIndex] || selectedSkillIds[0];
    const curSkill = catalog.skills.find((s) => s.id === curSkillId);

    els.questionHint.textContent = state.language === "ta"
      ? `Skill ${state.skillLevelSubIndex + 1} / ${selectedSkillIds.length}: ${curSkill ? curSkill.label : ""}`
      : `Skill ${state.skillLevelSubIndex + 1} / ${selectedSkillIds.length}: ${curSkill ? curSkill.label : ""}`;

    clearOptions();

    const levels = [
      { key: "beginner", label: "Beginner", emoji: "🌱", number: 1 },
      { key: "intermediate", label: "Intermediate", emoji: "⚡", number: 2 },
      { key: "advanced", label: "Advanced", emoji: "🏆", number: 3 },
    ];

    buildNumberMapFromOptions(levels.map((l) => ({ id: l.key, label: l.label })));

    levels.forEach((lvl) => {
      const selected = state.answers.skills[curSkillId] === lvl.key;
      const card = document.createElement("div");
      card.className = "option-card" + (selected ? " selected" : "");
      card.dataset.type = "skillsLevels";
      card.dataset.level = lvl.key;
      card.innerHTML = `
        <div class="option-emoji">${escapeHtml(lvl.emoji)}</div>
        <div style="flex:1;">
          <div class="option-label">${escapeHtml(lvl.label)}</div>
          <div class="option-sub">${escapeHtml(`Option ${lvl.number}`)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        state.answers.skills[curSkillId] = lvl.key;
        // Auto-advance subIndex if possible (typing flow)
        if (state.skillLevelSubIndex < selectedSkillIds.length - 1) {
          state.skillLevelSubIndex += 1;
        }
        renderStep();
      });
      els.optionsContainer.appendChild(card);
    });

    // If all levels set, move to next step
    const allSet = selectedSkillIds.every((sid) => !!state.answers.skills[sid]);
    if (allSet) {
      // Keep UI stable; Next button will move forward after validation.
    }
  }

  function renderSingleSelect(stepKey, options, title, hint) {
    els.questionPrompt.textContent = title;
    els.questionHint.textContent = hint;
    clearOptions();

    // Number options sequentially for voice mode
    buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji })));

    els.optionsContainer.style.gridTemplateColumns = "1fr 1fr";
    options.forEach((opt, idx) => {
      const selected = state.answers[stepKey] === opt.id;
      const number = idx + 1;
      const card = document.createElement("div");
      card.className = "option-card" + (selected ? " selected" : "");
      card.dataset.type = "single";
      card.dataset.stepKey = stepKey;
      card.dataset.id = opt.id;
      card.innerHTML = `
        <div class="option-emoji">${escapeHtml(opt.emoji || "✨")}</div>
        <div style="flex:1;">
          <div class="option-label">${escapeHtml(opt.label)}</div>
          <div class="option-sub">${escapeHtml(`Option ${number}`)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        state.answers[stepKey] = opt.id;
        renderStep();
      });
      els.optionsContainer.appendChild(card);
    });
  }

  function renderMultiSelect(stepKey, options, title, hint) {
    els.questionPrompt.textContent = title;
    els.questionHint.textContent = hint;
    clearOptions();

    buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji })));

    els.optionsContainer.style.gridTemplateColumns = "1fr 1fr";
    options.forEach((opt, idx) => {
      const selected = state.answers[stepKey].includes(opt.id);
      const number = idx + 1;
      const card = document.createElement("div");
      card.className = "option-card" + (selected ? " selected" : "");
      card.dataset.type = "multi";
      card.dataset.stepKey = stepKey;
      card.dataset.id = opt.id;
      card.innerHTML = `
        <div class="option-emoji">${escapeHtml(opt.emoji || "✨")}</div>
        <div style="flex:1;">
          <div class="option-label">${escapeHtml(opt.label)}</div>
          <div class="option-sub">${escapeHtml(`Option ${number}`)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        toggleMultiAnswer(stepKey, opt.id);
        renderStep();
      });
      els.optionsContainer.appendChild(card);
    });
  }

  function toggleMultiAnswer(stepKey, id) {
    const arr = state.answers[stepKey];
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(id);
  }

  function renderMotivation() {
    renderMultiSelect(
      "motivation",
      catalog.motivation,
      state.language === "ta" ? "உங்களை ஊக்குவிப்பது என்ன?" : "What motivates you?",
      state.language === "ta" ? "பலவற்றை தேர்ந்தெடுக்கவும்." : "Select multiple."
    );
  }

  function renderEducationLevel() {
    renderSingleSelect(
      "educationLevel",
      catalog.educationLevel,
      state.language === "ta" ? "உங்கள் கல்வி நிலை?" : "Your education level?",
      state.language === "ta" ? "ஒரை தேர்ந்தெடுக்கவும்." : "Select one."
    );
  }

  function renderStep() {
    renderProgress();

    const key = steps[state.stepIndex].key;
    els.qTitle.textContent = state.language === "ta" ? "Career வழிகாட்டல்" : "Career Guidance";

    // Default: show STT hint only if unsupported
    els.sttSupportHint.textContent = "";

    if (key === "interests") {
      renderInterests();
    } else if (key === "skillsSelect") {
      renderSkillsSelect();
    } else if (key === "skillsLevels") {
      renderSkillsLevels();
    } else if (key === "personality") {
      renderSingleSelect(
        "personality",
        catalog.personality,
        state.language === "ta" ? "உங்கள் தன்மை?" : "Your personality?",
        state.language === "ta" ? "ஒரை தேர்ந்தெடுக்கவும்." : "Select one."
      );
    } else if (key === "workstyle") {
      renderSingleSelect(
        "workstyle",
        catalog.workstyle,
        state.language === "ta" ? "உங்களுக்கு பிடித்த வேலை முறை?" : "Preferred work environment?",
        state.language === "ta" ? "ஒரை தேர்ந்தெடுக்கவும்." : "Select one."
      );
    } else if (key === "risk") {
      renderSingleSelect(
        "risk",
        catalog.risk,
        state.language === "ta" ? "உங்கள் ஆபத்து நிலை?" : "Risk appetite?",
        state.language === "ta" ? "ஒரை தேர்ந்தெடுக்கவும்." : "Select one."
      );
    } else if (key === "learningStyle") {
      renderSingleSelect(
        "learningStyle",
        catalog.learningStyle,
        state.language === "ta" ? "உங்கள் கற்றல் முறை?" : "Learning style?",
        state.language === "ta" ? "ஒரை தேர்ந்தெடுக்கவும்." : "Select one."
      );
    } else if (key === "motivation") {
      renderMotivation();
    } else if (key === "educationLevel") {
      renderEducationLevel();
    }

    els.nextBtn.disabled = !validateCurrentStep();
  }

  function getSelectionSummary() {
    const interestLabels = getInterestsFlat()
      .filter((o) => state.answers.interests.includes(o.id))
      .map((o) => o.label);

    const skillEntries = Object.entries(state.answers.skills)
      .filter(([, lvl]) => !!lvl)
      .map(([sid, lvl]) => {
        const skill = catalog.skills.find((s) => s.id === sid);
        return skill ? `${skill.label}: ${levelLabels[lvl]}` : `${sid}: ${lvl}`;
      });

    const motivationLabels = catalog.motivation
      .filter((m) => state.answers.motivation.includes(m.id))
      .map((m) => m.label);

    const lang = state.language;
    const pick = (list, id) => (list.find((x) => x.id === id)?.label || "");

    return {
      interests: interestLabels.join(", "),
      skills: skillEntries.join(", "),
      personality: pick(catalog.personality, state.answers.personality),
      workstyle: pick(catalog.workstyle, state.answers.workstyle),
      risk: pick(catalog.risk, state.answers.risk),
      learningStyle: pick(catalog.learningStyle, state.answers.learningStyle),
      motivation: motivationLabels.join(", "),
      educationLevel: pick(catalog.educationLevel, state.answers.educationLevel),
      lang,
    };
  }

  function getPatternsDetected() {
    const summary = getSelectionSummary();
    const s = `${summary.interests} ${summary.skills} ${summary.motivation} ${summary.learningStyle}`.toLowerCase();
    const patterns = [];

    // Simple keyword-based detection (frontend)
    const hasTech = ["coding", "ai", "cyber", "technical", "software"].some((k) => s.includes(k));
    const hasDesign = ["ui/ux", "graphic", "design"].some((k) => s.includes(k));
    const hasWriting = s.includes("writing") || s.includes("story");
    const hasPeople = ["teaching", "psychology", "counseling", "social", "public"].some((k) => s.includes(k));
    const hasImpact = s.includes("impact");

    if (hasTech && hasDesign) patterns.push("UI/UX-oriented path (Tech + Design)");
    if (hasTech && s.includes("game")) patterns.push("Game/Interactive experiences path");
    if (hasPeople && hasImpact) patterns.push("Helping/impact careers path");
    if (hasWriting) patterns.push("Communication/Storytelling careers path");

    if (patterns.length === 0) patterns.push("Balanced interests across multiple domains");
    return patterns.join("; ");
  }

  async function listenAndFillCurrentStep() {
    if (state.isListening) return;
    if (!isSpeechSupported()) {
      els.sttSupportHint.textContent = state.language === "ta" ? "இந்த உலாவியில் voice support இல்லை. தேர்வுகளை கிளிக் செய்யுங்கள்." : "Voice not supported. Please click options.";
      return;
    }

    state.isListening = true;
    els.voiceStatus.textContent = state.language === "ta" ? "கேட்கிறேன்... பேசுங்கள்." : "Listening... Speak now.";
    if (window.VoiceAssistant?.setMicPulsing) window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, true);
    try {
      const sttLang = window.getLangConfig(state.language).sttLang;
      const transcript = await window.VoiceAssistant.listen({ lang: sttLang, timeoutMs: 16000 });
      if (!transcript) {
        els.voiceStatus.textContent = state.language === "ta" ? "குரலை பிடிக்க முடியவில்லை." : "Could not capture voice.";
        return;
      }
      applyTranscriptToStep(transcript);
    } catch (e) {
      els.voiceStatus.textContent = state.language === "ta" ? "குரல் பிழை. மீண்டும் முயற்சிக்கவும்." : "Voice error. Try again.";
    } finally {
      state.isListening = false;
      if (window.VoiceAssistant?.setMicPulsing) window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, false);
    }
  }

  function applyTranscriptToStep(transcript) {
    const nums = extractNumbers(transcript);
    const key = steps[state.stepIndex].key;

    if (key === "interests") {
      const { options } = getInterestsPage();
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji })));
      const pickedIds = [];
      nums.forEach((n) => {
        const m = currentNumberMap.get(n);
        if (m && !pickedIds.includes(m.id)) pickedIds.push(m.id);
      });
      if (pickedIds.length) state.answers.interests = pickedIds;
      renderStep();
      return;
    }

    if (key === "skillsSelect") {
      const flat = getSkillsFlat();
      buildNumberMapFromOptions(flat.map((o) => ({ id: o.id, label: o.label })));
      const picked = [];
      nums.forEach((n) => {
        const m = currentNumberMap.get(n);
        if (m && !picked.includes(m.id)) picked.push(m.id);
      });
      if (picked.length) {
        // Keep existing levels if already set; else null
        const nextSkills = {};
        picked.forEach((sid) => nextSkills[sid] = state.answers.skills[sid] ?? null);
        state.answers.skills = nextSkills;
      }
      // Reset level subIndex to first selected skill
      state.skillLevelSubIndex = 0;
      renderStep();
      return;
    }

    if (key === "skillsLevels") {
      const selectedSkillIds = Object.keys(state.answers.skills);
      const curSkillId = selectedSkillIds[state.skillLevelSubIndex] || selectedSkillIds[0];
      const n = nums[0];
      // 1/2/3 -> beginner/intermediate/advanced
      if (n === 1) state.answers.skills[curSkillId] = "beginner";
      if (n === 2) state.answers.skills[curSkillId] = "intermediate";
      if (n === 3) state.answers.skills[curSkillId] = "advanced";

      // advance if possible
      if (state.skillLevelSubIndex < selectedSkillIds.length - 1) {
        state.skillLevelSubIndex += 1;
      }
      renderStep();
      return;
    }

    if (key === "personality") {
      const options = catalog.personality;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const n = nums[0];
      const m = currentNumberMap.get(n);
      if (m) state.answers.personality = m.id;
      renderStep();
      return;
    }

    if (key === "workstyle") {
      const options = catalog.workstyle;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const n = nums[0];
      const m = currentNumberMap.get(n);
      if (m) state.answers.workstyle = m.id;
      renderStep();
      return;
    }

    if (key === "risk") {
      const options = catalog.risk;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const n = nums[0];
      const m = currentNumberMap.get(n);
      if (m) state.answers.risk = m.id;
      renderStep();
      return;
    }

    if (key === "learningStyle") {
      const options = catalog.learningStyle;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const n = nums[0];
      const m = currentNumberMap.get(n);
      if (m) state.answers.learningStyle = m.id;
      renderStep();
      return;
    }

    if (key === "motivation") {
      const options = catalog.motivation;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const picked = [];
      nums.forEach((n) => {
        const m = currentNumberMap.get(n);
        if (m && !picked.includes(m.id)) picked.push(m.id);
      });
      if (picked.length) state.answers.motivation = picked;
      renderStep();
      return;
    }

    if (key === "educationLevel") {
      const options = catalog.educationLevel;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const n = nums[0];
      const m = currentNumberMap.get(n);
      if (m) state.answers.educationLevel = m.id;
      renderStep();
      return;
    }
  }

  function buildTtsForCurrentStep() {
    const key = steps[state.stepIndex].key;
    const langIsTa = state.language === "ta";

    if (key === "interests") {
      const { options, page, totalPages } = getInterestsPage();
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label, emoji: o.emoji })));
      const title = langIsTa ? "உங்கள் ஆர்வங்களை தேர்ந்தெடுக்கவும்." : "Choose your interests.";
      const optionsText = options
        .map((o, idx) => `${idx + 1}. ${o.label}`)
        .join(", ");
      const pageText = langIsTa ? `பக்கம் ${page + 1}/${totalPages}` : `Page ${page + 1}/${totalPages}`;
      return `${title} ${pageText}. ${optionsText}.`;
    }

    if (key === "skillsSelect") {
      const flat = getSkillsFlat();
      buildNumberMapFromOptions(flat.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்கள் திறன்களை தேர்ந்தெடுக்கவும்." : "Choose your skills.";
      const optionsText = flat.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    if (key === "skillsLevels") {
      const selectedSkillIds = Object.keys(state.answers.skills);
      const curSkillId = selectedSkillIds[state.skillLevelSubIndex] || selectedSkillIds[0];
      const curSkill = catalog.skills.find((s) => s.id === curSkillId);
      const title = langIsTa ? "இந்த திறனுக்கான நிலையை தேர்ந்தெடுக்கவும்." : "Set your level for this skill.";
      const optionsText = langIsTa
        ? `1. ஆரம்ப நிலை, 2. இடை நிலை, 3. மேம்பட்ட நிலை.`
        : `1. Beginner, 2. Intermediate, 3. Advanced.`;
      return `${title} ${curSkill?.label || ""}. ${optionsText}`;
    }

    if (key === "personality") {
      const options = catalog.personality;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்கள் தன்மையை தேர்ந்தெடுக்கவும்." : "Choose your personality.";
      const optionsText = options.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    if (key === "workstyle") {
      const options = catalog.workstyle;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்கள் வேலை முறை." : "Choose your work environment.";
      const optionsText = options.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    if (key === "risk") {
      const options = catalog.risk;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்கள் ஆபத்து நிலை." : "Choose your risk appetite.";
      const optionsText = options.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    if (key === "learningStyle") {
      const options = catalog.learningStyle;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்கள் கற்றல் முறை." : "Choose your learning style.";
      const optionsText = options.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    if (key === "motivation") {
      const options = catalog.motivation;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்களை ஊக்குவிப்பது என்ன?" : "Choose your motivations.";
      const optionsText = options.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    if (key === "educationLevel") {
      const options = catalog.educationLevel;
      buildNumberMapFromOptions(options.map((o) => ({ id: o.id, label: o.label })));
      const title = langIsTa ? "உங்கள் கல்வி நிலை." : "Choose your education level.";
      const optionsText = options.map((o, idx) => `${idx + 1}. ${o.label}`).join(", ");
      return `${title} ${optionsText}.`;
    }

    return "";
  }

  // ---- Voice flow ----
  function waitForNextClick() {
    return new Promise((resolve) => {
      const handler = () => {
        els.nextBtn.removeEventListener("click", handler);
        resolve();
      };
      els.nextBtn.addEventListener("click", handler);
    });
  }

  async function startVoiceAssistantFlow() {
    resetAll();
    state.voiceMode = true;
    state.stepIndex = 0;
    state.skillLevelSubIndex = 0;
    showView(els.questionsView);
    renderStep();

    // If STT not supported, show hint but keep going with typing/clicks.
    if (!isSpeechSupported()) {
      els.sttSupportHint.textContent = state.language === "ta" ? "Voice ஆதரவு இல்லை. தேர்வுகளை கிளிக் செய்யுங்கள்." : "Voice not supported. Please click options.";
    }

    // Walk all steps
    for (let i = 0; i < steps.length; i++) {
      state.stepIndex = i;
      const stepKey = steps[i].key;
      if (stepKey !== "skillsLevels") state.skillLevelSubIndex = 0;
      if (stepKey === "skillsLevels") {
        const selectedSkillIds = Object.keys(state.answers.skills);
        if (!selectedSkillIds.length) break;
        state.skillLevelSubIndex = 0;
      }
      renderStep();

      // Speak question
      els.voiceStatus.textContent = "";
      if (window.VoiceAssistant?.setMicPulsing) window.VoiceAssistant.setMicPulsing(els.micAnswerBtn, false);

      if (stepKey === "interests") {
        const { totalPages } = getInterestsPage();
        // Ask for interests page-by-page (so the user can pick from all options).
        while (true) {
          renderStep();
          try {
            setLoadingOverlay(true);
            await speak(buildTtsForCurrentStep());
          } catch {
            // TTS optional
          } finally {
            setLoadingOverlay(false);
          }

          await listenAndFillCurrentStep();

          if (state.interestsPage >= totalPages - 1) break;
          state.interestsPage += 1;
        }

        els.nextBtn.disabled = !validateCurrentStep();
        await waitForNextClick();
      } else if (stepKey === "skillsLevels") {
        // Voice mode needs to ask for each selected skill level.
        const selectedSkillIds = Object.keys(state.answers.skills);
        while (state.skillLevelSubIndex < selectedSkillIds.length) {
          // If this skill already has a level, advance.
          const curSkillId = selectedSkillIds[state.skillLevelSubIndex];
          if (state.answers.skills[curSkillId]) {
            state.skillLevelSubIndex += 1;
            renderStep();
            continue;
          }

          try {
            setLoadingOverlay(true);
            await speak(buildTtsForCurrentStep());
          } catch {
            // TTS optional
          } finally {
            setLoadingOverlay(false);
          }

          await listenAndFillCurrentStep();
          // Refresh UI for next skill
          renderStep();
        }
        els.nextBtn.disabled = !validateCurrentStep();
        await waitForNextClick();
      } else {
        try {
          setLoadingOverlay(true);
          await speak(buildTtsForCurrentStep());
        } catch {
          // TTS optional
        } finally {
          setLoadingOverlay(false);
        }

        // Listen and fill for current step
        await listenAndFillCurrentStep();

        // Allow user to confirm/correct with Next
        els.nextBtn.disabled = !validateCurrentStep();
        await waitForNextClick();
      }
    }

    // Move to review
    showView(els.reviewView);
    renderReview();
  }

  // ---- Typing flow ----
  function startTypingFlow() {
    resetAll();
    state.voiceMode = false;
    state.stepIndex = 0;
    state.skillLevelSubIndex = 0;
    showView(els.questionsView);
    renderStep();
    els.nextBtn.disabled = !validateCurrentStep();
  }

  function resetAll() {
    state.sessionId = null;
    state.careers = [];
    state.interestsPage = 0;
    state.answers = {
      interests: [],
      skills: {},
      personality: null,
      workstyle: null,
      risk: null,
      learningStyle: null,
      motivation: [],
      educationLevel: null,
    };
    state.stepIndex = 0;
    state.skillLevelSubIndex = 0;
    state.isListening = false;
  }

  // ---- Review + AI ----
  function renderReview() {
    const summary = getSelectionSummary();
    const patterns = getPatternsDetected();

    const lines = [
      `<div style="font-weight:900;margin-bottom:8px;">${state.language === "ta" ? "உங்கள் தேர்வுகள்" : "Your selections"}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "ஆர்வங்கள்" : "Interests"}:</b> ${escapeHtml(summary.interests || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "திறன்கள்" : "Skills"}:</b> ${escapeHtml(summary.skills || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "தன்மை" : "Personality"}:</b> ${escapeHtml(summary.personality || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "வேலை முறை" : "Work environment"}:</b> ${escapeHtml(summary.workstyle || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "ஆபத்து நிலை" : "Risk appetite"}:</b> ${escapeHtml(summary.risk || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "கற்றல் முறை" : "Learning style"}:</b> ${escapeHtml(summary.learningStyle || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "ஊக்கம்" : "Motivation"}:</b> ${escapeHtml(summary.motivation || "-")}</div>`,
      `<div style="margin-bottom:10px;"><b>${state.language === "ta" ? "கல்வி நிலை" : "Education level"}:</b> ${escapeHtml(summary.educationLevel || "-")}</div>`,
      `<div style="margin-top:14px;padding:12px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.10);color:var(--muted);">
        <b>${state.language === "ta" ? "படிமங்கள்" : "Patterns detected"}:</b> ${escapeHtml(patterns)}
      </div>`,
    ];

    els.reviewSummary.innerHTML = lines.join("");
    els.generateBtn.textContent = state.language === "ta" ? "AI முடிவுகளை உருவாக்கவும்" : "Generate AI Career Suggestions";
  }

  async function submitCareerSuggestions() {
    const loadingText = document.getElementById("loadingText");
    if (loadingText) {
      loadingText.textContent = state.language === "ta" ? "உங்கள் எதிர்காலத்தை பகுப்பாய்வு செய்கிறோம்..." : "Analyzing your future...";
    }
    setLoadingOverlay(true);
    els.reviewVoiceStatus.textContent = "";

    try {
      const summary = getSelectionSummary();
      const patterns = getPatternsDetected();

      // Keep backend input "simple": send structured summary as strings.
      const studentAnswers = {
        interests: summary.interests || "",
        skills: patterns ? `${summary.skills}\nPatterns detected: ${patterns}` : summary.skills || "",
        personality: summary.personality || "",
        workstyle: summary.workstyle || "",
        risk: summary.risk || "",
        learningStyle: summary.learningStyle || "",
        motivation: summary.motivation || "",
        educationLevel: summary.educationLevel || "",
      };

      const res = await window.ApiClient.requestCareerSuggestions(state.language, studentAnswers);
      state.sessionId = res.sessionId;
      state.careers = res.careers || [];
      renderResults();
    } catch (e) {
      showToast(e?.message || (state.language === "ta" ? "AI பிழை ஏற்பட்டது." : "AI call failed."));
    } finally {
      setLoadingOverlay(false);
    }
  }

  async function renderResults() {
    showView(els.resultsView);
    els.sessionIdDisplay.textContent = state.sessionId ? `Session: ${state.sessionId}` : "";
    els.cardsContainer.innerHTML = "";

    if (!state.careers?.length) {
      els.cardsContainer.innerHTML = `<div class="card"><div class="card-title">No results</div><div class="card-text">${state.language === "ta" ? "AI பதில் இல்லை." : "AI did not return results."}</div></div>`;
    } else {
      state.careers.forEach((career) => {
        const skills = (career.required_skills || []).slice(0, 10).map((s) => `<div class="chip">${escapeHtml(s)}</div>`).join("");
        const path = (career.learning_path || []).slice(0, 10).map((s) => `• ${escapeHtml(s)}`).join("<br/>");
        const icon = career.icon || "✨";
        const confidence = typeof career.confidence_percent === "number" ? career.confidence_percent : null;
        const confText = confidence === null ? "" : `${escapeHtml(String(confidence))}%`;

        const why = career.why_this_fits_you || "";

        const badgeHtml = confidence === null
          ? ""
          : `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <div class="card-title" style="margin:0;">${escapeHtml(icon)} ${escapeHtml(career.name || "")}</div>
              <div style="font-weight:900;background:rgba(122,240,196,0.16);border:1px solid rgba(122,240,196,0.45);padding:6px 10px;border-radius:999px;">
                ${escapeHtml(confText)} match
              </div>
            </div>`;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          ${badgeHtml || `<div class="card-title">${escapeHtml(icon)} ${escapeHtml(career.name || "")}</div>`}
          <div class="card-meta">${state.language === "ta" ? "விளக்கம்" : "Description"}</div>
          <div class="card-text">${escapeHtml(career.description || "")}</div>

          <div class="card-section-title">${state.language === "ta" ? "தேவையான திறன்கள்" : "Required Skills"}</div>
          <div class="chip-list">${skills || ""}</div>

          <div class="card-section-title">${state.language === "ta" ? "எதிர்கால தேவை" : "Future Demand"}</div>
          <div class="card-text">${escapeHtml(career.future_demand || "")}</div>

          <div class="card-section-title">${state.language === "ta" ? "கற்றல் பாதை" : "Learning Path"}</div>
          <div class="card-text">${path || "-"}</div>

          ${
            why
              ? `<div class="card-section-title" style="margin-top:12px;">${state.language === "ta" ? "ஏன் இது உங்களுக்கு பொருந்தும்" : "Why this fits you"}</div>
                 <div class="card-text">${escapeHtml(why)}</div>`
              : ""
          }
        `;
        els.cardsContainer.appendChild(card);
      });
    }

    // Chat avatar assistant
    if (els.chatMessages) {
      els.chatMessages.innerHTML = "";
      const introText = state.language === "ta"
        ? "உங்களை இன்னும் நன்றாக புரிந்து கொள்ள விடுங்கள்..."
        : "Let me understand you better...";
      els.chatMessages.appendChild(window.ChatUI.renderBubble("assistant", introText, ""));
    }

    initChatWiring();
    initReadAloud();
  }

  function readAloudText() {
    if (!state.careers?.length) return "";
    const parts = state.careers.map((c, idx) => {
      const title = state.language === "ta"
        ? `பரிந்துரை ${idx + 1}: ${c.name}`
        : `Suggestion ${idx + 1}: ${c.name}`;
      const desc = state.language === "ta" ? `விளக்கம்: ${c.description}` : `Description: ${c.description}`;
      const demand = state.language === "ta" ? `எதிர்கால தேவை: ${c.future_demand}` : `Future demand: ${c.future_demand}`;
      const skills = (c.required_skills || []).slice(0, 6).join(", ");
      const skillsLine = state.language === "ta" ? `திறன்கள்: ${skills}` : `Skills: ${skills}`;
      const why = c.why_this_fits_you ? (state.language === "ta" ? `ஏன் பொருந்தும்: ${c.why_this_fits_you}` : `Why: ${c.why_this_fits_you}`) : "";
      return [title, desc, skillsLine, demand, why].filter(Boolean).join(" ");
    });
    return parts.join(" ");
  }

  function initReadAloud() {
    els.readAloudBtn.onclick = async () => {
      try {
        const text = readAloudText();
        if (!text) return;
        setLoadingOverlay(true);
        await window.VoiceAssistant.speak(text, getTtsLang());
      } catch (e) {
        showToast(e?.message || "Voice output failed.");
      } finally {
        setLoadingOverlay(false);
      }
    };

    els.downloadPdfBtn.onclick = () => {
      try {
        const summary = getSelectionSummary();
        window.PdfUtil.downloadCareerPdf({
          careers: state.careers,
          language: state.language,
          studentAnswers: summary,
          sessionId: state.sessionId,
        });
      } catch (e) {
        showToast(e?.message || "PDF generation failed.");
      }
    };
  }

  function initChatWiring() {
    window.ChatUI.wireChat({
      onSend: async (msg) => {
        setLoadingOverlay(true);
        try {
          const res = await window.ApiClient.requestChat(state.sessionId, state.language, msg);
          const replyBubble = window.ChatUI.renderBubble("assistant", res.reply, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          els.chatMessages.appendChild(replyBubble);
          els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
        } catch (e) {
          showToast(e?.message || "Chat failed.");
        } finally {
          setLoadingOverlay(false);
        }
      },
      onReadLast: async () => {
        const bubbles = els.chatMessages.querySelectorAll(".bubble.assistant");
        const last = bubbles[bubbles.length - 1];
        const text = last?.querySelector?.(".text")?.textContent || last?.innerText || "";
        if (!text) return;
        try {
          setLoadingOverlay(true);
          await window.VoiceAssistant.speak(text, getTtsLang());
        } catch (e) {
          showToast(e?.message || "Voice output failed.");
        } finally {
          setLoadingOverlay(false);
        }
      },
    });

    // Chat read aloud is handled by ChatUI.wireChat
  }

  // ---- Navigation wiring ----
  function bindEvents() {
    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    themeToggle?.addEventListener("click", () => {
      setTheme(state.theme === THEMES.dark ? THEMES.light : THEMES.dark);
    });

    // Language selection
    els.languageSelect = document.getElementById("languageSelect");
    els.languageSelect?.addEventListener("change", () => {
      state.language = els.languageSelect.value;
      // Update current prompt in UI
      renderStep();
      renderReview();
    });

    // Home -> typing
    els.startBtn?.addEventListener("click", () => startTypingFlow());

    // Home mic -> voice wizard
    els.micHomeBtn?.addEventListener("click", async () => {
      await startVoiceAssistantFlow();
    });

    // Mic on question view: re-listen for current step
    els.micAnswerBtn?.addEventListener("click", async () => {
      if (!validateCurrentStep()) {
        // Still allow re-listen even if invalid
      }
      await listenAndFillCurrentStep();
      els.nextBtn.disabled = !validateCurrentStep();
    });

    // Back
    els.backBtn?.addEventListener("click", () => {
      if (state.voiceMode) {
        showToast(state.language === "ta" ? "Back voice mode-ல் கிடையாது." : "Back is disabled in voice mode.");
        return;
      }
      if (state.stepIndex <= 0) return;
      state.stepIndex -= 1;
      // If moving away from skillLevels, keep subIndex safe
      if (steps[state.stepIndex].key !== "skillsLevels") state.skillLevelSubIndex = 0;
      renderStep();
      els.nextBtn.disabled = !validateCurrentStep();
    });

    // Next
    els.nextBtn?.addEventListener("click", async () => {
      if (!validateCurrentStep()) {
        showToast(state.language === "ta" ? "முதலில் பதில் தேர்ந்தெடுக்கவும்." : "Please select an option first.");
        return;
      }

      const key = steps[state.stepIndex].key;

      // Special case: in skillsLevels, if subIndex not at end, don't advance step.
      if (key === "skillsLevels") {
        const selectedSkillIds = Object.keys(state.answers.skills);
        const allSet = selectedSkillIds.every((sid) => !!state.answers.skills[sid]);
        if (!allSet) {
          showToast(state.language === "ta" ? "அனைத்து திறன்களுக்கும் நிலை அமைக்கவும்." : "Set levels for all selected skills.");
          return;
        }
      }

      // Move forward
      if (state.stepIndex < steps.length - 1) {
        state.stepIndex += 1;
        if (steps[state.stepIndex].key !== "skillsLevels") state.skillLevelSubIndex = 0;
        if (steps[state.stepIndex].key === "skillsLevels") state.skillLevelSubIndex = 0;
        renderStep();
        els.nextBtn.disabled = !validateCurrentStep();
      } else {
        // End -> review
        showView(els.reviewView);
        renderReview();
      }
    });

    // Review back
    els.reviewBackBtn?.addEventListener("click", () => {
      if (state.voiceMode) {
        showToast(state.language === "ta" ? "Back கிடையாது." : "Back is disabled in voice mode.");
        return;
      }
      showView(els.questionsView);
      state.stepIndex = steps.length - 1;
      state.skillLevelSubIndex = 0;
      renderStep();
    });

    // Generate from review
    els.generateBtn?.addEventListener("click", async () => {
      // quick validation: ensure all required answers exist
      if (!state.answers.interests.length || !Object.keys(state.answers.skills).length || !state.answers.educationLevel) {
        showToast(state.language === "ta" ? "படிகள் முடிக்கவும்." : "Complete the wizard first.");
        return;
      }
      const selectedSkillIds = Object.keys(state.answers.skills);
      const allLevelsSet = selectedSkillIds.every((sid) => !!state.answers.skills[sid]);
      if (!allLevelsSet) {
        showToast(state.language === "ta" ? "அனைத்து திறன்களுக்கும் நிலை அமைக்கவும்." : "Set levels for all selected skills.");
        return;
      }

      await submitCareerSuggestions();
    });
  }

  function init() {
    // Theme restore
    try {
      const saved = localStorage.getItem("theme");
      if (saved === THEMES.light || saved === THEMES.dark) setTheme(saved);
    } catch {}

    // Language restore to match backend prompt language
    const langSel = document.getElementById("languageSelect");
    if (langSel) {
      state.language = langSel.value || "en";
    }

    // Ensure progress and default state
    showView(els.homeView);
    setTheme(state.theme);
    bindEvents();
  }

  return { init, state };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (window.PremiumCareerApp) window.PremiumCareerApp.init();
});


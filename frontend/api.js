window.ApiClient = (() => {
  function readApiBaseFromMeta() {
    const el = document.querySelector('meta[name="career-api-base"]');
    const v = el && el.getAttribute("content");
    return v && v.trim() ? v.trim() : "";
  }
  const API_BASE =
    window.API_BASE ||
    readApiBaseFromMeta() ||
    "http://localhost:8000";

  async function postJson(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
    }
    return res.json();
  }

  async function getJson(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
    }
    return res.json();
  }

  async function requestCareerSuggestions(language, studentAnswers) {
    return postJson("/api/career-suggestions", {
      language,
      studentAnswers
    });
  }

  async function requestChat(sessionId, language, message) {
    return postJson("/api/chat", { sessionId, language, message });
  }

  async function fetchSession(sessionId) {
    return getJson(`/api/sessions/${encodeURIComponent(sessionId)}`);
  }

  return {
    requestCareerSuggestions,
    requestChat,
    fetchSession
  };
})();


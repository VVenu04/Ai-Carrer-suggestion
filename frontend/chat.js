window.ChatUI = (() => {
  function escapeHtml(s) {
    return (s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderBubble(role, content, createdAt) {
    const wrap = document.createElement("div");
    wrap.className = `bubble ${role}`;
    const meta = role === "assistant" ? "Assistant" : "You";
    wrap.innerHTML = `
      <div class="text">${escapeHtml(content).replace(/\n/g, "<br/>")}</div>
      <div class="meta">${meta}${createdAt ? " • " + createdAt : ""}</div>
    `;
    return wrap;
  }

  function formatTime(d) {
    try {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function clearMessages(container) {
    container.innerHTML = "";
  }

  function wireChat({ onSend, onReadLast }) {
    const messagesEl = document.getElementById("chatMessages");
    const formEl = document.getElementById("chatForm");
    const inputEl = document.getElementById("chatInput");
    const readLastBtn = document.getElementById("chatReadAloudBtn");

    if (!messagesEl || !formEl || !inputEl) return;

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = (inputEl.value || "").trim();
      if (!msg) return;

      inputEl.value = "";
      onSend?.(msg);
      const d = new Date();
      messagesEl.appendChild(renderBubble("user", msg, formatTime(d)));
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });

    readLastBtn?.addEventListener("click", () => {
      onReadLast?.();
    });
  }

  return {
    renderBubble,
    clearMessages,
    wireChat
  };
})();


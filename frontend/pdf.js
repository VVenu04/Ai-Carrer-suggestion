window.PdfUtil = (() => {
  function escapeFileName(s) {
    return (s || "career").toString().replace(/[^a-z0-9_-]/gi, "_").slice(0, 60);
  }

  function addWrappedText(doc, text, x, y, maxWidth, lineHeight) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * lineHeight;
  }

  function downloadCareerPdf({ careers, language, studentAnswers, sessionId }) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 14;

    const uiTitle = language === "ta" ? "தொழில் பரிந்துரைகள்" : "Career Suggestions";
    const uiDate = new Date().toLocaleString();

    let y = 48;
    doc.setFontSize(18);
    doc.text(uiTitle, margin, y);
    y += 24;

    doc.setFontSize(11);
    doc.setTextColor(90);
    const summary = language === "ta"
      ? `அமர்வு ID: ${sessionId}`
      : `Session ID: ${sessionId}`;
    doc.text(summary, margin, y);
    y += 16;

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(language === "ta" ? `தேதி: ${uiDate}` : `Date: ${uiDate}`, margin, y);
    y += 18;

    // Student answers (compact)
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(language === "ta" ? "மாணவர் விவரங்கள்" : "Student Answers", margin, y);
    y += 14;
    doc.setFont(undefined, "normal");

    const answerLines = [
      `Interests: ${studentAnswers?.interests || ""}`,
      `Subjects: ${studentAnswers?.subjects || ""}`,
      `Skills: ${studentAnswers?.skills || ""}`,
      `Personality: ${studentAnswers?.personality || ""}`,
      `Workstyle: ${studentAnswers?.workstyle || ""}`,
      `Goals: ${studentAnswers?.goals || ""}`,
      `Education level: ${studentAnswers?.educationLevel || ""}`,
    ];

    // For Tamil we keep labels in English to avoid layout issues; the AI-generated careers are Tamil.
    const compact = answerLines.join("\n");
    const used = addWrappedText(doc, compact, margin, y, maxWidth, lineHeight);
    y += used + 10;

    for (let i = 0; i < careers.length; i++) {
      const c = careers[i];
      if (y > 740) { doc.addPage(); y = 48; }

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`${i + 1}. ${c.name}`, margin, y);
      y += 18;
      doc.setFont(undefined, "normal");
      doc.setFontSize(11);

      // Description
      doc.setFont(undefined, "bold");
      doc.text(language === "ta" ? "விளக்கம்" : "Description", margin, y);
      doc.setFont(undefined, "normal");
      y += 12;
      y += addWrappedText(doc, c.description || "", margin, y, maxWidth, lineHeight) + 10;

      // Required Skills
      doc.setFont(undefined, "bold");
      doc.text(language === "ta" ? "தேவையான திறன்கள்" : "Required Skills", margin, y);
      doc.setFont(undefined, "normal");
      y += 12;
      const skillsText = (c.required_skills || []).map(s => `• ${s}`).join("\n");
      y += addWrappedText(doc, skillsText || "-", margin, y, maxWidth, lineHeight) + 10;

      // Future Demand
      doc.setFont(undefined, "bold");
      doc.text(language === "ta" ? "எதிர்கால தேவை" : "Future Demand", margin, y);
      doc.setFont(undefined, "normal");
      y += 12;
      y += addWrappedText(doc, c.future_demand || "", margin, y, maxWidth, lineHeight) + 10;

      // Learning Path
      doc.setFont(undefined, "bold");
      doc.text(language === "ta" ? "கற்றல் பாதை" : "Learning Path", margin, y);
      doc.setFont(undefined, "normal");
      y += 12;
      const pathText = (c.learning_path || []).map(s => `• ${s}`).join("\n");
      y += addWrappedText(doc, pathText || "-", margin, y, maxWidth, lineHeight);
      y += 16;
    }

    const fileBase = escapeFileName(uiTitle);
    doc.save(`${fileBase}_${sessionId || "session"}.pdf`);
  }

  return { downloadCareerPdf };
})();


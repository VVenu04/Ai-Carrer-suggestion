from __future__ import annotations

from typing import Dict, List


def language_label(language: str) -> str:
    if language == "ta":
        return "Tamil"
    return "English"


def build_career_suggestions_messages(student_answers: Dict[str, str], language: str) -> List[Dict[str, str]]:
    """
    Instructs the model to return JSON only, matching the expected schema.
    """
    lang = language_label(language)

    # Note: keep the prompt beginner-friendly and explicit about JSON.
    user_prompt = f"""
You are an intelligent career guidance assistant.
Based on the student's answers below, suggest the best 5 career paths.

Student Data:
- Interests: {student_answers.get('interests', '')}
- Favorite subjects: {student_answers.get('subjects', '')}
- Skills (technical / soft skills): {student_answers.get('skills', '')}
- Personality (introvert/extrovert): {student_answers.get('personality', '')}
- Preferred work style (team/individual): {student_answers.get('workstyle', '')}
- Career goals: {student_answers.get('goals', '')}
- Education level: {student_answers.get('educationLevel', '')}

For each career, provide the following:
1) Career Name
2) Description
3) Required Skills (as an array of strings)
4) Future Demand (a short paragraph)
5) Learning Path (as an array of step strings, beginner-friendly)

Return ONLY a valid JSON object (no markdown, no extra text).
JSON schema:
{{
  "careers": [
    {{
      "name": "string",
      "description": "string",
      "required_skills": ["string", "..."],
      "future_demand": "string",
      "learning_path": ["string", "..."]
    }}
  ]
}}

Write everything in {lang}.
"""

    return [
        {"role": "system", "content": "You must output valid JSON only."},
        {"role": "user", "content": user_prompt.strip()},
    ]


def build_fix_json_messages(language: str, last_model_output: str) -> List[Dict[str, str]]:
    """
    Second chance: ask the model to fix and output valid JSON only.
    """
    lang = language_label(language)
    user_prompt = f"""
Your previous response was not valid JSON.
Fix it and return ONLY valid JSON with the same schema.

Previous output (may be invalid JSON):
{last_model_output}

Language: {lang}
"""
    return [
        {"role": "system", "content": "Return ONLY valid JSON. No markdown, no extra text."},
        {"role": "user", "content": user_prompt.strip()},
    ]


def build_chat_messages(
    language: str,
    student_answers: Dict[str, str],
    careers_json: Dict,
    chat_history: List[Dict[str, str]],
    user_message: str,
) -> List[Dict[str, str]]:
    lang = language_label(language)
    base_context = f"""
Student answers:
- interests: {student_answers.get('interests', '')}
- subjects: {student_answers.get('subjects', '')}
- skills: {student_answers.get('skills', '')}
- personality: {student_answers.get('personality', '')}
- workstyle: {student_answers.get('workstyle', '')}
- goals: {student_answers.get('goals', '')}
- educationLevel: {student_answers.get('educationLevel', '')}

Previously suggested careers (JSON):
{careers_json}
"""
    messages: List[Dict[str, str]] = [
        {
            "role": "system",
            "content": (
                f"You are a career guidance assistant. Respond helpfully in {lang}. "
                f"Be specific, supportive, and beginner-friendly."
            ),
        },
        {"role": "user", "content": base_context.strip()},
    ]

    # Add prior chat
    for item in chat_history:
        role = item.get("role", "user")
        content = item.get("content", "")
        messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})
    return messages


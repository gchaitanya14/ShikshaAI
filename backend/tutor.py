import hashlib
import json
import os
from retriever import retrieve
from pruner import prune_context
from groq import Groq
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env into environment

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Avoids re-hitting the LLM for identical (question, subject, difficulty) tuples.
# Could be swapped for Redis or a DB-backed cache in production..
_cache: dict = {}


def _make_cache_key(question: str, subject: str, difficulty: str) -> str:
    raw = f"{question.strip().lower()}|{subject}|{difficulty}"
    return hashlib.md5(raw.encode()).hexdigest()


# ── Per-difficulty system prompts ───
DIFFICULTY_PROMPTS = {
    "easy": (
        "You are ShikshaAI, a warm and patient tutor for younger students in rural India. "
        "Use very simple words, short sentences, and relatable examples from everyday village life. "
        "Keep the answer to 80-100 words maximum. Avoid technical jargon entirely."
    ),
    "medium": (
        "You are ShikshaAI, a friendly tutor for students in rural India. "
        "Explain clearly using simple language with one or two examples. "
        "Keep the answer to 130-160 words. Use basic subject terminology where needed."
    ),
    "hard": (
        "You are ShikshaAI, an in-depth tutor for advanced students in rural India. "
        "Give a thorough, detailed explanation covering the concept fully — include definitions, "
        "how it works step by step, real-world applications, advantages, disadvantages, "
        "and any important sub-concepts. Use proper technical terminology. "
        "Answer in 250-350 words minimum. Be comprehensive and leave no important detail out."
    ),
}


def answer_question(question: str, subject: str, difficulty: str = "medium") -> dict:
    # Return cached result if this exact query was asked before
    cache_key = _make_cache_key(question, subject, difficulty)
    if cache_key in _cache:
        cached = _cache[cache_key].copy()
        cached["from_cache"] = True
        return cached

    raw_chunks = retrieve(question, subject, top_k=5)

    if not raw_chunks:
        return {
            "answer": (
                "I couldn't find this topic in the uploaded textbook. "
                "Please make sure the correct subject PDF has been ingested."
            ),
            "tokens_used": 0,
            "original_tokens_est": 0,
            "pruned_tokens_est": 0,
            "cost_saved_pct": 0,
            "sentences_kept": 0,
            "sentences_total": 0,
            "from_cache": False,
        }

    # Hard mode gets a larger sentence budget so the answer can be more thorough
    top_sentences = 25 if difficulty == "hard" else 15
    prune_result = prune_context(question, raw_chunks, top_sentences=top_sentences)
    pruned_context = prune_result["pruned_context"] or " ".join(raw_chunks)

    system_prompt = DIFFICULTY_PROMPTS.get(difficulty, DIFFICULTY_PROMPTS["medium"])
    user_prompt = f"Textbook content:\n{pruned_context}\n\nStudent question: {question}"

    max_tokens = 600 if difficulty == "hard" else 350

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
    )

    answer = response.choices[0].message.content
    original = prune_result["original_tokens_est"]
    pruned = prune_result["pruned_tokens_est"]
    saved = round((1 - pruned / original) * 100, 1) if original > 0 else 0

    result = {
        "answer": answer,
        "tokens_used": response.usage.total_tokens,
        "original_tokens_est": original,
        "pruned_tokens_est": pruned,
        "cost_saved_pct": saved,
        "sentences_kept": prune_result["kept_sentences"],
        "sentences_total": prune_result["original_sentences"],
        "from_cache": False,
    }

    _cache[cache_key] = result.copy()
    return result


def generate_mcq(topic: str, subject: str, num_questions: int = 5) -> dict:
    raw_chunks = retrieve(topic, subject, top_k=6)

    if not raw_chunks:
        return {"error": "Topic not found in the uploaded textbook."}

    prune_result = prune_context(topic, raw_chunks, top_sentences=30)
    pruned_context = prune_result["pruned_context"] or " ".join(raw_chunks)

    system_prompt = (
        "You are a quiz generator. Generate exactly the requested number of multiple choice questions "
        "based ONLY on the provided textbook content. "
        "Return ONLY valid JSON — no markdown, no backticks, no extra text. "
        'Format: {"questions": [{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], '
        '"correct": "A", "explanation": "..."}, ...]}'
    )

    user_prompt = (
        f"Textbook content:\n{pruned_context}\n\n"
        f"Generate {num_questions} MCQ questions about: {topic}\n"
        f"Each question must have 4 options (A, B, C, D), one correct answer, and a brief explanation."
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()

    # Strip any accidental markdown fences the model might have added
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        data = json.loads(raw)
        return data
    except json.JSONDecodeError:
        return {"error": "Could not parse quiz questions. Please try again."}

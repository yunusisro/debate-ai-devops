from groq import Groq
from config import settings
from typing import List, Dict, Optional
import json

class GroqService:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is missing. Set it in backend/.env")
        self.client = Groq(api_key=settings.GROQ_API_KEY)

        # pick a Groq-supported model "llama-3.1-70b-versatile"
        self.model = "llama-3.3-70b-versatile"

    def _system_prompt(self, topic: str, ai_stance: str, description: Optional[str], category: Optional[str], difficulty: Optional[str]) -> str:
        return f"""
You are an AI debater.

Topic: "{topic}"
Description: "{description or ''}"
Category: "{category or 'General'}"
Difficulty: "{difficulty or 'intermediate'}"
Your stance: "{ai_stance}"

Rules:
- Stay on-topic and treat the description as ground truth.
- Match difficulty: beginner=simpler, expert=more rigorous.
- Be persuasive and directly address the opponent.
- Keep responses concise (1-2 paragraphs).
""".strip()

    async def generate_opening_statement(self, topic: str, ai_stance: str, description: Optional[str], category: Optional[str], difficulty: Optional[str]) -> str:
        messages = [
            {"role": "system", "content": self._system_prompt(topic, ai_stance, description, category, difficulty)},
            {"role": "user", "content": "Write a strong opening statement now."},
        ]
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
        )
        return resp.choices[0].message.content or ""

    async def generate_ai_argument(
        self,
        topic: str,
        ai_stance: str,
        conversation_history: List[Dict],
        candidate_message: str,
        description: Optional[str],
        category: Optional[str],
        difficulty: Optional[str],
    ) -> str:
        # Convert your stored messages into chat format
        chat_history = []
        for msg in conversation_history[-8:]:
            role = "assistant" if msg.get("speaker") == "ai" else "user"
            chat_history.append({"role": role, "content": msg.get("content", "")})

        messages = [
            {"role": "system", "content": self._system_prompt(topic, ai_stance, description, category, difficulty)},
            *chat_history,
            {"role": "user", "content": candidate_message},
        ]

        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
        )
        return resp.choices[0].message.content or ""
    

# inside GroqService class
async def evaluate_debate(self, topic: str, candidate_messages: List[str]) -> Dict:
    arguments = "\n\n".join(candidate_messages)

    prompt = f"""
Evaluate this debate on topic: "{topic}"

Candidate Arguments:
{arguments}

Return JSON with keys:
argumentation, clarity, evidence, rebuttal, presentation (0-10 numbers),
strengths (array), weaknesses (array), feedback, analysis
""".strip()

    resp = self.client.chat.completions.create(
        model=self.model,
        messages=[
            {"role": "system", "content": "You are a strict debate judge. Output ONLY valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    text = resp.choices[0].message.content or "{}"

    try:
        return json.loads(text)
    except:
        # fallback if model returns non-JSON
        return {
            "argumentation": 7,
            "clarity": 7,
            "evidence": 7,
            "rebuttal": 7,
            "presentation": 7,
            "strengths": ["Good effort"],
            "weaknesses": ["Needs improvement"],
            "feedback": "Keep practicing.",
            "analysis": text,
        }

groq_service = GroqService()
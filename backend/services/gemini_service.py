from google import genai
from config import settings
from typing import List, Dict
import asyncio

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY, http_options={"api_version": "v1beta"})

    async def generate_ai_argument(
        self,
        topic: str,
        ai_stance: str,
        conversation_history: List[Dict[str, str]],
        candidate_message: str,
        description: str | None,
        category: str | None,
        difficulty: str | None
    ) -> str:

        context = f"""
You are participating in a debate on the topic: "{topic}"
Description: "{description}"
Category: "{category}"
Difficulty: "{difficulty}"
Your stance: {ai_stance}

Opponent's latest argument:
{candidate_message}

Respond with a strong logical counter-argument (2-3 paragraphs).
"""

        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model="models/gemini-1.5-flash",
            contents=context,
        )

        return response.text

    async def generate_opening_statement(
        self,
        topic: str,
        ai_stance: str,
        description: str | None,
        category: str | None,
        difficulty: str | None
    ) -> str:

        prompt = f"""
You are starting a debate on the topic: "{topic}"
Description: "{description}"
Category: "{category}"
Difficulty: "{difficulty}"
Your stance: {ai_stance}

Write a strong opening statement (2-3 paragraphs).
"""

        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model="models/gemini-1.5-flash",
            contents=prompt,
        )

        return response.text

    async def evaluate_debate(
        self,
        topic: str,
        candidate_messages: List[str]
    ) -> Dict:

        arguments = "\n\n".join(candidate_messages)

        prompt = f"""
Evaluate this debate on topic: "{topic}"

Candidate Arguments:
{arguments}

Return JSON with:
argumentation (0-10)
clarity (0-10)
evidence (0-10)
rebuttal (0-10)
presentation (0-10)
strengths (array)
weaknesses (array)
feedback
analysis
"""

        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model="models/gemini-1.5-flash",
            contents=prompt,
        )

        return self._parse_evaluation_response(response.text)

    def _parse_evaluation_response(self, response_text: str) -> Dict:
        import json
        try:
            return json.loads(response_text.strip())
        except:
            return {
                "argumentation": 7,
                "clarity": 7,
                "evidence": 7,
                "rebuttal": 7,
                "presentation": 7,
                "strengths": ["Good effort"],
                "weaknesses": ["Needs improvement"],
                "feedback": "Keep practicing.",
                "analysis": response_text
            }

gemini_service = GeminiService()
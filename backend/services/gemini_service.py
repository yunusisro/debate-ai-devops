import google.generativeai as genai
from config import settings
from typing import List, Dict

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')

    async def generate_ai_argument(
        self,
        topic: str,
        ai_stance: str,
        conversation_history: List[Dict[str, str]],
        candidate_message: str
    ) -> str:
        context = f"""You are participating in a debate on the topic: "{topic}"
Your stance is: {ai_stance}

Previous conversation:
"""
        for msg in conversation_history[-6:]:
            speaker = "You" if msg["speaker"] == "ai" else "Opponent"
            context += f"{speaker}: {msg['content']}\n\n"

        context += f"""
Opponent's latest argument: {candidate_message}

Provide a strong, logical counter-argument. Be persuasive, use evidence when possible, and address their points directly. Keep your response concise (2-3 paragraphs maximum).
"""

        response = self.model.generate_content(context)
        return response.text

    async def generate_opening_statement(self, topic: str, ai_stance: str) -> str:
        prompt = f"""You are starting a debate on the topic: "{topic}"
Your stance is: {ai_stance}

Provide a strong opening statement for your position. Be clear, persuasive, and set the stage for the debate. Keep it concise (2-3 paragraphs).
"""

        response = self.model.generate_content(prompt)
        return response.text

    async def evaluate_debate(
        self,
        topic: str,
        conversation_history: List[Dict[str, str]],
        candidate_messages: List[str]
    ) -> Dict:
        candidate_arguments = "\n\n".join([f"Argument {i+1}: {msg}" for i, msg in enumerate(candidate_messages)])

        prompt = f"""Evaluate the following debate performance on the topic: "{topic}"

Candidate's Arguments:
{candidate_arguments}

Provide a comprehensive evaluation with:
1. Scores (0-10) for:
   - Argumentation (logic and reasoning)
   - Clarity (clear communication)
   - Evidence (use of facts and examples)
   - Rebuttal (addressing counterarguments)
   - Presentation (overall delivery)

2. List 3-5 key strengths
3. List 3-5 areas for improvement
4. Overall feedback paragraph
5. Detailed analysis

Format your response as JSON with keys: argumentation, clarity, evidence, rebuttal, presentation, strengths (array), weaknesses (array), feedback, analysis
"""

        response = self.model.generate_content(prompt)
        return self._parse_evaluation_response(response.text)

    def _parse_evaluation_response(self, response_text: str) -> Dict:
        try:
            import json
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()

            evaluation = json.loads(cleaned_text)
            return evaluation
        except Exception as e:
            return {
                "argumentation": 7.0,
                "clarity": 7.0,
                "evidence": 7.0,
                "rebuttal": 7.0,
                "presentation": 7.0,
                "strengths": ["Good effort", "Engaged in the debate", "Showed interest"],
                "weaknesses": ["Could provide more evidence", "Could be more structured"],
                "feedback": "Good debate performance. Continue practicing to improve your skills.",
                "analysis": response_text
            }

gemini_service = GeminiService()

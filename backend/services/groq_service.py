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
    

    async def evaluate_debate(
        self,
        topic: str,
        conversation_history: List[Dict],
        candidate_messages: List[str],
        ai_stance: Optional[str] = None,
        candidate_stance: Optional[str] = None,
        difficulty: Optional[str] = None,
        description: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict:
        """
        Comprehensive debate evaluation using Groq.
        Analyzes all aspects of the candidate's performance.
        """
        # Build conversation context
        conversation_text = ""
        for msg in conversation_history:
            speaker = "AI" if msg.get("speaker") == "ai" else "Candidate"
            conversation_text += f"\n{speaker}: {msg.get('content', '')}\n"

        prompt = f"""You are an expert debate judge. Evaluate the candidate's performance comprehensively.

DEBATE CONTEXT:
Topic: "{topic}"
Description: "{description or 'No specific description'}"
Category: "{category or 'General'}"
Difficulty Level: "{difficulty or 'intermediate'}"
AI Stance: "{ai_stance or 'unknown'}"
Candidate Stance: "{candidate_stance or 'unknown'}"

FULL CONVERSATION:
{conversation_text}

EVALUATION TASK:
You MUST evaluate the candidate's arguments, not the AI's. Return ONLY valid JSON with this exact structure:
{{
  "argumentation": <0-10 score for logical argument construction>,
  "clarity": <0-10 score for how clearly ideas are expressed>,
  "evidence": <0-10 score for use of data, examples, and citations>,
  "rebuttal": <0-10 score for addressing opponent's points>,
  "presentation": <0-10 score for overall delivery and engagement>,
  "strengths": [
    {{
      "title": "<brief strength title>",
      "description": "<2-3 sentence explanation of this strength>"
    }}
  ],
  "weaknesses": [
    {{
      "title": "<brief weakness title>",
      "description": "<2-3 sentence explanation of this weakness>"
    }}
  ],
  "improvements": [
    {{
      "title": "<improvement area>",
      "description": "<specific, actionable improvement suggestion>",
      "priority": "high|medium|low"
    }}
  ],
  "missed_points": [
    "<important argument or perspective they didn't address>",
    "<another missed opportunity>"
  ],
  "feedback": "<2-3 paragraph personalized feedback on their debate performance>",
  "analysis": "<1-2 paragraph deep analysis of their debate style, strengths, and growth areas>"
}}

Be critical but fair. Consider the difficulty level when scoring. Generate realistic scores and insights.""".strip()

        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a strict, expert debate evaluator. Output ONLY valid JSON, no markdown code blocks."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        text = resp.choices[0].message.content or "{}"
        
        # Clean up markdown code blocks if present
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            result = json.loads(text)
            # Ensure all required fields exist
            return {
                "argumentation": result.get("argumentation", 6.5),
                "clarity": result.get("clarity", 6.5),
                "evidence": result.get("evidence", 6.5),
                "rebuttal": result.get("rebuttal", 6.5),
                "presentation": result.get("presentation", 6.5),
                "strengths": result.get("strengths", []),
                "weaknesses": result.get("weaknesses", []),
                "improvements": result.get("improvements", []),
                "missed_points": result.get("missed_points", []),
                "feedback": result.get("feedback", ""),
                "analysis": result.get("analysis", ""),
            }
        except:
            # fallback if model returns non-JSON
            return {
                "argumentation": 6.5,
                "clarity": 6.5,
                "evidence": 6.5,
                "rebuttal": 6.5,
                "presentation": 6.5,
                "strengths": [{"title": "Engaged in debate", "description": "You participated actively in the debate."}],
                "weaknesses": [{"title": "Needs more evidence", "description": "Consider adding more data and examples."}],
                "improvements": [
                    {"title": "Research thoroughly", "description": "Prepare with more facts and statistics.", "priority": "high"},
                    {"title": "Practice rebuttals", "description": "Work on addressing opponent's points more directly.", "priority": "medium"}
                ],
                "missed_points": ["Could have addressed counterarguments more thoroughly"],
                "feedback": f"Your debate on '{topic}' showed engagement. Keep practicing to improve your performance.",
                "analysis": f"Model error. {text[:200]}"
            }

groq_service = GroqService()
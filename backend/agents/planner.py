#agents/planner.py
import json
from model_adapters import call_llm

PLANNER_PROMPT = """
You are an expert website information architect.

Your job:
Given the user's request, produce a complete website structure (blueprint) in JSON.

Rules:
- Return ONLY valid JSON
- Do not include comments, markdown, or extra text
- Pages must be tailored to the business type
- Sections must be appropriate for each page
- Include global metadata

JSON FORMAT TO OUTPUT:

{
  "site_title": "string",
  "pages": ["Home", "About", "Services", ...],
  "sections": {
    "Home": ["Hero", "Features", "Testimonials", "CTA"],
    "About": ["Mission", "Team"],
    "Services": ["ServiceList", "Pricing"],
    "Contact": ["ContactForm", "Map"]
  },
  "components": ["Navbar", "Footer"],
  "notes": "Explain why you chose this structure in one sentence."
}

INPUT:
User prompt:
{prompt}

Return ONLY JSON and nothing else.
"""


def plan_from_prompt(prompt: str):
    """
    Uses the 'planner' model (GPT-4.1 or Gemini-Pro) to generate
    dynamic pages, sections, and metadata.
    """

    full_prompt = PLANNER_PROMPT.replace("{prompt}", prompt)


    try:
        out = call_llm(full_prompt, agent="planner").strip()

        # Remove ```json``` wrappers if present
        if out.startswith("```"):
            out = out.replace("```json", "").replace("```", "").strip()

        plan = json.loads(out)

        return plan

    except Exception as e:
        print("Planner Error:", e)

        # Strong fallback plan
        return {
            "site_title": "My Website",
            "pages": ["Home", "About", "Gallery", "Contact"],
            "sections": {
                "Home": ["Hero", "Features", "CTA"],
                "About": ["Mission", "Team"],
                "Gallery": ["ImageGrid"],
                "Contact": ["ContactForm"]
            },
            "components": ["Navbar", "Footer"],
            "notes": "Fallback structure"
        }

# # agents/designer.py
# import json
# from model_adapters import call_llm

# def extract_design_system(prompt: str):
#     """
#     Asks the model to produce a clean design system.
#     """

#     design_prompt = f"""
# You are a senior UI/UX designer.

# Extract a design system from this description:

# \"\"\"{prompt}\"\"\"

# Return ONLY valid JSON with this structure:

# {{
#   "palette": {{
#       "primary": "...",
#       "secondary": "...",
#       "background": "...",
#       "text": "..."
#   }},
#   "fonts": {{
#       "heading": "Inter",
#       "body": "Inter"
#   }},
#   "spacing": {{
#       "section": "py-20",
#       "content": "max-w-5xl mx-auto"
#   }},
#   "style": "modern, clean, minimal, rounded"
# }}
# """

#     try:
#         out = call_llm(design_prompt)

#         # try parsing model output as JSON
#         return json.loads(out)

#     except Exception as e:
#         print("Design system extraction failed:", e)
#         return {
#             "palette": {
#                 "primary": "#2563eb",
#                 "secondary": "#1e293b",
#                 "background": "#ffffff",
#                 "text": "#0f172a"
#             },
#             "fonts": {"heading": "Inter", "body": "Inter"},
#             "spacing": {"section": "py-20", "content": "max-w-5xl mx-auto"},
#             "style": "fallback-minimal"
#         }
# agents/designer.py
# backend/agents/designer.py

# import json
# from model_adapters import call_llm

# def extract_design_system(prompt: str):
#     # Added [INST] tags and instruction to ensure proper JSON output
#     design_prompt = f"""[INST]
# You are a senior UI/UX designer. Your sole purpose is to extract a design system from the user's request and output it in JSON format.

# Extract a professional design system from:
# \"\"\"{prompt}\"\"\"

# Return ONLY valid JSON with this exact structure:

# {{
#   "palette": {{
#     "primary": "#2563eb",
#     "secondary": "#1e293b",
#     "background": "#ffffff",
#     "text": "#0f172a"
#   }},
#   "fonts": {{
#     "heading": "Inter",
#     "body": "Inter"
#   }},
#   "spacing": {{
#     "section": "py-20",
#     "content": "max-w-5xl mx-auto"
#   }},
#   "style": "modern minimal clean rounded"
# }}

# DO NOT include any text, code, or explanation outside the JSON block.
# [/INST]"""

#     try:
#         out = call_llm(design_prompt)
#         if out.startswith("```json"):
#             out = out.strip().strip("```json").strip("```")
#         return json.loads(out)

#     except Exception as e:
#         print("Design system extraction failed:", e)
#         return {
#              # ... (your original fallback code here)
#         }
# import json
# from model_adapters import call_llm

# def extract_design_system(prompt: str):
#     design_prompt = f"""
# You are a senior UI/UX designer.
# Extract a professional design system from:

# \"\"\"{prompt}\"\"\"

# Return ONLY valid JSON:

# {{
#   "palette": {{
#       "primary": "#2563eb",
#       "secondary": "#1e293b",
#       "background": "#ffffff",
#       "text": "#0f172a"
#   }},
#   "fonts": {{
#       "heading": "Inter",
#       "body": "Inter"
#   }},
#   "spacing": {{
#       "section": "py-20",
#       "content": "max-w-5xl mx-auto"
#   }},
#   "style": "modern minimal clean rounded"
# }}
# """

#     try:
#         out = call_llm(design_prompt)
#         return json.loads(out)

#     except:
#         return {
#             "palette": {
#                 "primary": "#2563eb",
#                 "secondary": "#1e293b",
#                 "background": "#ffffff",
#                 "text": "#0f172a"
#             },
#             "fonts": {"heading": "Inter", "body": "Inter"},
#             "spacing": {"section": "py-20", "content": "max-w-5xl mx-auto"},
#             "style": "fallback"
#         }
# backend/agents/designer.py

import json
from model_adapters import call_llm

THEME_PROMPT = """
You are a senior UI/UX designer and design systems expert.

Your task:
Given the user prompt and the site blueprint (pages, sections, site purpose),
produce a complete design system that guides consistent, high-quality UI.

Rules:
- Return ONLY valid JSON
- No markdown
- No commentary
- Must be strictly parseable by json.loads()
- Use professional design patterns (e.g., soft gradients, rounded corners, spacing scale, typography system)

INPUT:
User prompt:
{prompt}

Site blueprint (JSON):
{blueprint_json}

OUTPUT JSON FORMAT:
{{
  "palette": {{
    "primary": "#HEX",
    "secondary": "#HEX",
    "background": "#HEX",
    "text": "#HEX"
  }},
  "fonts": {{
    "heading": "Inter",
    "body": "Inter"
  }},
  "spacing": {{
    "section": "py-16",
    "content": "max-w-6xl mx-auto"
  }},
  "radius": {{
    "small": "rounded-md",
    "medium": "rounded-lg",
    "large": "rounded-2xl"
  }},
  "style": "One-line description of the theme (e.g., 'soft, clean, modern, minimalistic')"
}}

RETURN ONLY THE JSON.
"""


def generate_theme(prompt: str, blueprint: dict):
    final_prompt = THEME_PROMPT.format(
        prompt=prompt,
        blueprint_json=json.dumps(blueprint, indent=2)
    )

    try:
        out = call_llm(final_prompt, agent="designer")  # << USE THE DESIGNER MODEL
        out = out.strip()

        # Remove ```json fences if model adds them
        if out.startswith("```"):
            out = out.replace("```json", "").replace("```", "").strip()

        theme = json.loads(out)
        return theme

    except Exception as e:
        print("Designer Agent Error:", e)

        # -------------------------
        # STRONG SAFE FALLBACK
        # -------------------------
        return {
            "palette": {
                "primary": "#2563eb",
                "secondary": "#1e293b",
                "background": "#ffffff",
                "text": "#0f172a"
            },
            "fonts": {
                "heading": "Inter",
                "body": "Inter"
            },
            "spacing": {
                "section": "py-20",
                "content": "max-w-5xl mx-auto"
            },
            "radius": {
                "small": "rounded-md",
                "medium": "rounded-lg",
                "large": "rounded-3xl"
            },
            "style": "clean minimal modern"
        }

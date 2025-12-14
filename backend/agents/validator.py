# #validator.py
# from bs4 import BeautifulSoup

# def validate_html(html: str):
#     """
#     A tiny validator: checks parseability and presence of <html>, <head>, <body>
#     Returns list of issues (empty if none).
#     """
#     issues = []
#     try:
#         soup = BeautifulSoup(html, "html.parser")
#     except Exception as e:
#         return [f"Parse error: {e}"]

#     if not soup.find("html"):
#         issues.append("<html> tag missing")
#     if not soup.find("body"):
#         issues.append("<body> tag missing")
#     # basic check for script tag issues (very simple)
#     for script in soup.find_all("script"):
#         if script.get("src") is None and not script.string:
#             issues.append("Empty inline <script> tag found")
#     return issues
# agents/validator.py

import re
import json
from model_adapters import call_llm

VALIDATOR_PROMPT = """
You are a senior React engineer. You fix JSX files.

Your task:
Given a file path and its JSX content, FIX ALL ERRORS.

Fixes to apply:
- Missing imports
- Incorrect import paths
- Missing return statements
- Unclosed tags
- Incorrect component names
- Unused variables
- Invalid TailwindCSS class names
- Ensure it exports a default React component
- Ensure syntax is valid for Vite + React + TailwindCSS

Rules:
- Return ONLY the corrected JSX/code
- No explanations
- No markdown
- Must be directly usable
- Do NOT alter functionality

Path: {path}

Code to fix:
----------------
{code}
----------------

Return ONLY the corrected file content.
"""


def _basic_jsx_checks(code: str):
    """Simple static checks. Returns (bool, issue)."""
    if "export default" not in code:
        return False, "Missing `export default`"

    if "return (" not in code and "return <" not in code:
        return False, "Missing return statement"

    if re.search(r"<[A-Za-z]+\s*/?>", code) is None:
        return False, "No JSX tags found"

    return True, None


def validate_file(path: str, code: str) -> str:
    """
    Validate and fix a single JSX/TSX file using:
    - local static checks
    - LLM validator agent
    """

    ok, issue = _basic_jsx_checks(code)

    if ok:
        return code  # Basic checks passed → no need to fix

    # Send to validator LLM
    prompt = VALIDATOR_PROMPT.format(path=path, code=code)

    try:
        fixed = call_llm(prompt, agent="validator")

        if fixed and len(fixed) > 5:
            return fixed.strip()
        else:
            print(f"[validator] Failed to fix {path}, returning original")
            return code

    except Exception as e:
        print(f"[validator] Error for {path}: {e}")
        return code


def validate_files(files: dict) -> dict:
    """
    Validate all generated files.
    Input: { path : code }
    Output: fixed files
    """
    final = {}

    for path, code in files.items():
        if not path.endswith((".jsx", ".js", ".tsx", ".ts")):
            final[path] = code
            continue

        final[path] = validate_file(path, code)

    return final

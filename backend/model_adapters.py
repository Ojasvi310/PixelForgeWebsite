
import os
import time
import random
import threading
from dotenv import load_dotenv

# Providers
from groq import Groq, APIError as GroqAPIError

# ------------------------------------------------------------------
# ENV + CLIENT SETUP
# ------------------------------------------------------------------

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if not groq_client:
    raise RuntimeError("GROQ_API_KEY not found in .env file!")

# ------------------------------------------------------------------
# PROVIDER-LEVEL CONCURRENCY LOCKS (CRITICAL)
# ------------------------------------------------------------------

GROQ_LOCK = threading.Semaphore(1)     # max 1 Groq call at a time

# ------------------------------------------------------------------
# MODEL ROUTER (GROQ ONLY)
# ------------------------------------------------------------------

MODEL_ROUTER = {
    # Planning phase - Groq
    "planner": {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
    },
    
    # Design phase - Groq
    "designer": {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
    },
    
    # Code generation - Groq
    "codegen": {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
    },
    
    # Validation - Groq
    "validator": {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
    },
}



def call_llm(prompt: str, agent: str = "planner", max_retries: int = 3, temperature: float = 0.1) -> str:
    """
    Unified LLM caller using GROQ ONLY.
    
    Benefits:
    - FREE (no payment needed)
    - FAST (instant responses)
    - UNLIMITED (no rate limits)
    - All agents use same provider
    """

    config = MODEL_ROUTER.get(agent)
    if not config:
        raise ValueError(f"Unknown agent type: {agent}")

    provider = config["provider"]
    model = config["model"]

    # STRICT system message - NO markdown, NO JSON wrapping
    system_msg = """You are a code generation AI. Follow these rules STRICTLY:

1. Output ONLY raw code or JSX
2. NO markdown formatting (no ```)
3. NO JSON arrays or objects wrapping the code
4. NO comments like // filename
5. NO explanations before or after
6. Start directly with the code

Example of CORRECT output:
import React from "react"
export default function App() {
  return <div>Hello</div>
}

Example of INCORRECT output (DO NOT DO THIS):
```jsx
import React from "react"
```
or
{"import React from 'react'"}
"""

    for attempt in range(max_retries):
        try:
            # ---------------- GROQ (FAST, FREE, UNLIMITED) ----------------
            if provider == "groq":
                with GROQ_LOCK:
                    resp = groq_client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "system", "content": system_msg},
                            {"role": "user", "content": prompt},
                        ],
                        temperature=temperature,
                        max_tokens=3000,
                    )

                    return resp.choices[0].message.content.strip()

        except GroqAPIError as e:
            if getattr(e, "status_code", None) == 429:
                wait = min(5, 1.5 * (attempt + 1)) + random.random()
                print(f"[{agent}] Rate Limit. Retrying in {wait:.2f}s...")
                time.sleep(wait)
                continue

            print(f"[{agent}] Groq API ERROR: {e}")
            break

        except Exception as e:
            print(f"[{agent}] ERROR: {e}")
            break

    raise RuntimeError(f"[{agent}] Failed after {max_retries} attempts")
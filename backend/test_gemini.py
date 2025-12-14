# import os
# import google_genai as genai

# GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyA9s-RsVEvJDE8dMDusmxj3yzTIuMJxe04")  # or directly insert the key
# client = genai.Client(api_key=GEMINI_KEY)

# response = client.models.generate_content(
#     model="gemini-2.5-flash",
#     contents="Explain how AI works in a few words"
# )

#!/usr/bin/env python3
# """
# Check your actual rate limits from OpenAI.
# Run this to see what your account is limited to.
# """

# import requests

# response = requests.post(
#     'https://openrouter.ai/api/v1/responses',
#     headers={
#         'Authorization': 'OPENROUTER_API_KEY',
#         'Content-Type': 'application/json',
#     },
#     json={
#         'model': 'openai/o4-mini',
#         'input': 'What is the meaning of life?',
#         'max_output_tokens': 9000,
#     }
# )

# result = response.json()
# print(result)
import os
import requests
import time
import json

API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise RuntimeError("GROQ_API_KEY not set")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

payload = {
    "model": "llama-3.3-70b-versatile",   # fast + low cost
    "messages": [
        {"role": "user", "content": "Reply with OK"}
    ],
    "max_tokens": 5,
}

def send_request(i):
    r = requests.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=30
    )

    if r.status_code == 200:
        print(f"[{i}] ✅ OK")
    elif r.status_code == 429:
        print(f"[{i}] ⚠️ RATE LIMITED (429)")
        print(r.text)
    elif r.status_code == 401:
        print(f"[{i}] ❌ INVALID API KEY")
        print(r.text)
    elif r.status_code == 402:
        print(f"[{i}] ❌ QUOTA / BILLING ISSUE")
        print(r.text)
    else:
        print(f"[{i}] ❌ ERROR {r.status_code}")
        print(r.text)

# Fire requests quickly to trigger limits
for i in range(1, 20):
    send_request(i)
    time.sleep(0.4)  # lower this to hit rate limit faster
# reduce this to hit rate limit faster

🚀 PixelForge — Agentic AI Website Generator

PixelForge is a full-stack agentic AI platform that generates complete React websites from natural language prompts and provides live previews - all in real time.

It combines multiple AI agents, modern frontend tooling, secure authentication, and on-the-fly build previews to simulate a real production workflow.

PixelForge is not a single LLM call.

It uses multiple specialized AI agents, each responsible for a distinct task:

🧩 Planner Agent - understands the user prompt and plans the site

🎨 Designer Agent - decides visual style and layout

🧱 CodeGen Agent - generates React + Tailwind components

✅ Validator Agent - Validates and sanitizes generated output before preview/build:

🔗 Model Adapter - orchestrates agents sequentially

Agents communicate via structured outputs, not just text — making this a true agentic system, not a chatbot.

✨ Features


🔮 AI Website Generation

Natural language → complete React website

Modular agent-based generation pipeline

⚡ Live Preview System

Builds websites dynamically using Vite

Serves previews from isolated environments

Supports opening previews in a new tab

🔐 Secure Authentication

Uses Firebase Authentication

Email & password login

No password handling in backend

🖥️ Modern Frontend

React + Vite

Tailwind CSS

Real-time UI updates

Debug file inspector

🧠 Backend Intelligence

FastAPI

Agent orchestration layer

Token-based auth verification

🚀 Getting Started

1️⃣ Clone the Repository

git clone https://github.com/Ojasvi310/PixelForgeWebsite.git

cd pixelforge


2️⃣ Start Backend

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload


3️⃣ Start Preview Server

cd preview-server

npm install

node run dev



4️⃣ Start Frontend

cd my-frontend

npm install

npm run dev

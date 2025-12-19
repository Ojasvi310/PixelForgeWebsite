# backend/app.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

# Agent imports
from agents.planner import plan_from_prompt
from agents.designer import generate_theme
from agents.codegen import generate_files

# Auth imports
from auth.routes import router as auth_router
from auth.database import create_indexes
from auth.utils import verify_token

import uvicorn

# --------------------------
# LIFESPAN EVENTS
# --------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting PixelForge API...")
    try:
        await create_indexes()
        print("✅ Database indexes created")
    except Exception as e:
        print(f"⚠️ Database setup warning: {e}")
    yield
    # Shutdown
    print("👋 Shutting down PixelForge API...")

# --------------------------
# APP INITIALIZATION
# --------------------------

app = FastAPI(title="AI Website Builder API", lifespan=lifespan)

# Include auth routes

# --------------------------
# CORS CONFIG
# --------------------------

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)


# --------------------------
# REQUEST MODEL
# --------------------------

class PromptIn(BaseModel):
    prompt: str


# --------------------------
# MAIN ENDPOINT (PROTECTED)
# --------------------------

@app.post("/generate")
async def generate_site(data: PromptIn, token_data: dict = Depends(verify_token)):
    """
    Generate website from prompt (requires authentication)
    
    Protected endpoint - requires valid JWT token in Authorization header
    """
    prompt = data.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Empty prompt")

    try:
        user_email = token_data.get("sub")
        print("\n" + "="*70)
        print("STARTING WEBSITE GENERATION")
        print("="*70)
        print(f"User: {user_email}")
        print(f"Prompt: {prompt}")
        print()

        # 1️⃣ Planner → structure + metadata
        print("STEP 1: Planning...")
        plan = plan_from_prompt(prompt)
        print(f"✓ Plan created: {plan.get('site_title', 'Untitled')}")

        structure = plan.get("structure", plan)

        # 2️⃣ Designer → theme extraction
        print("\nSTEP 2: Designing...")
        design = generate_theme(prompt, plan)
        print(f"✓ Design created: {design.get('style', 'modern')}")

        # 3️⃣ Codegen → generate full project files
        print("\nSTEP 3: Generating code...")
        files = generate_files(prompt, structure, design)
        print(f"✓ Generated {len(files)} files")

        # 4️⃣ Skip validation (files are pre-validated in codegen)
        print("\nSTEP 4: Skipping validation (files pre-validated)")
        validated_files = files

        print("\n" + "="*70)
        print("GENERATION COMPLETE")
        print("="*70 + "\n")

        return {
            "plan": plan,
            "design": design,
            "files": validated_files
        }

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}\n")
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )


# --------------------------
# HEALTH CHECK
# --------------------------

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "AI Website Builder API with Authentication",
        "version": "2.0.0",
        "endpoints": {
            "auth": {
                "signup": "POST /auth/signup",
                "login": "POST /auth/login"
            },
            "generation": {
                "generate": "POST /generate (requires auth)"
            }
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# --------------------------
# RUN SERVER
# --------------------------

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
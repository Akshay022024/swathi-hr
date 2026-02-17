"""
╔═══════════════════════════════════════════════════════════╗
║                    S.W.A.T.H.I.                          ║
║  Smart Workforce Automation for Talent Hiring Intelligence ║
║                                                           ║
║  Built with 💜 to make HR life easier                    ║
╚═══════════════════════════════════════════════════════════╝
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env from parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

from database import init_db
from routes.jd_routes import router as jd_router
from routes.candidate_routes import router as candidate_router
from routes.dashboard_routes import router as dashboard_router
from routes.email_routes import router as email_router
from routes.chat_routes import router as chat_router
from routes.tracker_routes import router as tracker_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB on startup"""
    print("\n✨ S.W.A.T.H.I. is waking up...")
    print("🧠 Initializing database...")
    init_db()
    print("🚀 Ready to revolutionize HR!\n")
    yield
    print("\n💤 S.W.A.T.H.I. signing off. See you next time!\n")


app = FastAPI(
    title="S.W.A.T.H.I.",
    description="Smart Workforce Automation for Talent Hiring Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(jd_router)
app.include_router(candidate_router)
app.include_router(dashboard_router)
app.include_router(email_router)
app.include_router(chat_router)
app.include_router(tracker_router)


@app.get("/")
def root():
    return {
        "name": "S.W.A.T.H.I.",
        "tagline": "Smart Workforce Automation for Talent Hiring Intelligence",
        "status": "operational",
        "version": "1.0.0",
        "message": "🚀 Your AI-powered HR command center is ready!",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "engine": "S.W.A.T.H.I."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

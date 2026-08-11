from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .routes import auth

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal Finance Budget Tracker API",
    description="Python FastAPI backend with User Auth & Data Storage",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server & Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows requests from all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Finance Tracker Python Backend",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

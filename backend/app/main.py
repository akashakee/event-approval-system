from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401
from app.api.router import api_router
from app.core.config import settings
from app.core.logging import init_sentry, logger
from app.middleware.logging import LoggingMiddleware
from app.db.init_db import seed_users
from app.db.session import Base, SessionLocal, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting Event Approval System API")
    init_sentry()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()
    yield
    logger.info("Shutting down Event Approval System API")

app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


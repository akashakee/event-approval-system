from fastapi import APIRouter

from app.api.routes import auth, proposals, reviews

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])

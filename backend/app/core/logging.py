import logging
import sys
from typing import Optional
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from app.core.config import settings


def init_sentry() -> None:
    """Initialize Sentry for error tracking and monitoring."""
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            environment=settings.app_env,
            traces_sample_rate=0.1 if settings.app_env == "production" else 1.0,
            debug=settings.app_env == "development",
        )


def setup_logging() -> logging.Logger:
    """Set up structured logging."""
    log_level = logging.DEBUG if settings.app_env == "development" else logging.INFO

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized - Environment: {settings.app_env}")
    return logger


logger = setup_logging()

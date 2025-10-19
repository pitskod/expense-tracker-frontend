from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager
from sqlmodel import Session
from app.utils.db import get_session_for_scheduler
from app.utils.reset_codes import cleanup_expired_reset_codes
from app.models.refresh_tokens import RefreshToken
from datetime import datetime, timezone
import logging
import atexit

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = BackgroundScheduler()


def cleanup_expired_tokens_and_codes():
    """
    Weekly cleanup job that deletes expired reset codes and refresh tokens.
    This is equivalent to node-cron functionality.
    """
    try:
        # Use a separate session for the scheduled job
        session = get_session_for_scheduler()
        
        # Clean up expired reset codes
        deleted_codes = cleanup_expired_reset_codes(session)
        logger.info(f"Weekly cleanup: Deleted {deleted_codes} expired reset codes")
        
        # Clean up expired refresh tokens
        current_time = datetime.now(timezone.utc)
        expired_tokens = session.query(RefreshToken).filter(
            RefreshToken.expires_at <= current_time
        ).all()
        
        for token in expired_tokens:
            session.delete(token)
        
        session.commit()
        session.close()
        
        logger.info(f"Weekly cleanup: Deleted {len(expired_tokens)} expired refresh tokens")
        logger.info("Weekly cleanup completed successfully")
        
    except Exception as e:
        logger.error(f"Error during scheduled cleanup: {str(e)}")
        if 'session' in locals():
            session.rollback()
            session.close()


def start_scheduler():
    """Start the background scheduler with weekly cleanup job."""
    try:
        # Add weekly job (runs every Sunday at 2:00 AM)
        scheduler.add_job(
            func=cleanup_expired_tokens_and_codes,
            trigger=CronTrigger(day_of_week='sun', hour=2, minute=0),
            id='weekly_cleanup',
            name='Weekly cleanup of expired tokens and codes',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Scheduler started successfully - Weekly cleanup job scheduled")
        
        # Ensure scheduler shuts down when the application exits
        atexit.register(lambda: scheduler.shutdown())
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")


def stop_scheduler():
    """Stop the background scheduler."""
    try:
        if scheduler.running:
            scheduler.shutdown()
            logger.info("Scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {str(e)}")


# For testing purposes - run cleanup immediately
def run_cleanup_now():
    """Run cleanup immediately (for testing/manual execution)."""
    logger.info("Running manual cleanup...")
    cleanup_expired_tokens_and_codes()
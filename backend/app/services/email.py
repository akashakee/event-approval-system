import logging
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SendGrid."""

    def __init__(self):
        self.api_key = settings.sendgrid_api_key
        self.from_email = settings.sendgrid_from_email

    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        return bool(self.api_key and self.from_email)

    def send_proposal_approved_email(
        self, recipient_email: str, proposal_title: str, recipient_name: str = "User"
    ) -> bool:
        """Send email notification when proposal is approved."""
        if not self.is_configured():
            logger.warning("Email service not configured, skipping send")
            return False

        subject = f"Proposal Approved: {proposal_title}"
        content = f"""
        <h2>Your Proposal Has Been Approved!</h2>
        <p>Dear {recipient_name},</p>
        <p>We're pleased to inform you that your proposal "<strong>{proposal_title}</strong>" has been approved.</p>
        <p>You can view the full details of your proposal by logging into the Event Approval System.</p>
        <p>Thank you for your submission!</p>
        <p>Best regards,<br/>Event Approval Team</p>
        """

        return self._send_email(recipient_email, subject, content)

    def send_proposal_rejected_email(
        self,
        recipient_email: str,
        proposal_title: str,
        remarks: str = "",
        recipient_name: str = "User",
    ) -> bool:
        """Send email notification when proposal is rejected."""
        if not self.is_configured():
            logger.warning("Email service not configured, skipping send")
            return False

        subject = f"Proposal Rejected: {proposal_title}"
        remarks_section = f"<p><strong>Reviewer Comments:</strong><br/>{remarks}</p>" if remarks else ""
        content = f"""
        <h2>Your Proposal Has Been Rejected</h2>
        <p>Dear {recipient_name},</p>
        <p>Unfortunately, your proposal "<strong>{proposal_title}</strong>" has been rejected.</p>
        {remarks_section}
        <p>You can resubmit your proposal after addressing the feedback. Log into the Event Approval System to proceed.</p>
        <p>Best regards,<br/>Event Approval Team</p>
        """

        return self._send_email(recipient_email, subject, content)

    def send_proposal_submitted_email(
        self, recipient_email: str, proposal_title: str, recipient_name: str = "User"
    ) -> bool:
        """Send confirmation email when proposal is submitted."""
        if not self.is_configured():
            logger.warning("Email service not configured, skipping send")
            return False

        subject = f"Proposal Submitted: {proposal_title}"
        content = f"""
        <h2>Proposal Submitted Successfully</h2>
        <p>Dear {recipient_name},</p>
        <p>Your proposal "<strong>{proposal_title}</strong>" has been submitted successfully.</p>
        <p>Your proposal is now under review. You will receive an email notification once a decision has been made.</p>
        <p>Thank you for using the Event Approval System!</p>
        <p>Best regards,<br/>Event Approval Team</p>
        """

        return self._send_email(recipient_email, subject, content)

    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Internal method to send email via SendGrid."""
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content,
            )
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            logger.info(f"Email sent to {to_email} with status {response.status_code}")
            return response.status_code in [200, 201, 202]
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}", exc_info=True)
            return False


# Create singleton instance
email_service = EmailService()

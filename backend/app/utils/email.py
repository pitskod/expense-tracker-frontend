import asyncio
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging
from app.config.config import app_config
from jinja2 import Template

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        # Email configuration from app config
        self.smtp_server = app_config.email.smtp_server
        self.smtp_port = app_config.email.smtp_port
        self.sender_email = app_config.email.sender_email
        self.sender_password = app_config.email.sender_password
        self.sender_name = app_config.email.sender_name

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """Send an email asynchronously."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.sender_name} <{self.sender_email}>"
            message["To"] = to_email

            # Add text and HTML parts
            if text_body:
                text_part = MIMEText(text_body, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_body, "html")
            message.attach(html_part)

            # Send email in a thread to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, self._send_smtp_email, message
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def _send_smtp_email(self, message: MIMEMultipart):
        """Send email using SMTP (blocking operation)."""
        context = ssl.create_default_context()
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                # Enable debug output for troubleshooting
                server.set_debuglevel(1) if logger.isEnabledFor(logging.DEBUG) else None
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
                logger.info(f"SMTP email sent successfully using {self.sender_email}")
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed for {self.sender_email}: {str(e)}")
            logger.error("Please check your email credentials and ensure you're using an App Password for Gmail")
            raise
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            raise

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_code: str,
        reset_link: str,
        user_name: str
    ) -> bool:
        """Send password reset email with code and link."""
        subject = "Password Reset - Expense Tracker"
        
        # HTML template for the email
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .code-box { background-color: #e7f3ff; border: 1px solid #b3d7ff; padding: 15px; margin: 20px 0; text-align: center; }
                .code { font-size: 24px; font-weight: bold; color: #2c5aa0; letter-spacing: 2px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
                .warning { color: #d32f2f; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello {{ user_name }},</p>
                    <p>We received a request to reset your password for your Expense Tracker account.</p>
                    
                    <div class="code-box">
                        <p>Your reset code is:</p>
                        <div class="code">{{ reset_code }}</div>
                    </div>
                    
                    <p>You can also click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="{{ reset_link }}" class="button">Reset Password</a>
                    </p>
                    
                    <p class="warning">This code will expire in 10 minutes.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2025 Expense Tracker. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        # Text template for email clients that don't support HTML
        text_template = Template("""
        Password Reset - Expense Tracker
        
        Hello {{ user_name }},
        
        We received a request to reset your password for your Expense Tracker account.
        
        Your reset code is: {{ reset_code }}
        
        You can also use this link to reset your password: {{ reset_link }}
        
        This code will expire in 10 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        © 2025 Expense Tracker. All rights reserved.
        """)
        
        html_body = html_template.render(
            user_name=user_name,
            reset_code=reset_code,
            reset_link=reset_link
        )
        
        text_body = text_template.render(
            user_name=user_name,
            reset_code=reset_code,
            reset_link=reset_link
        )
        
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
            text_body=text_body
        )


# Singleton instance
email_service = EmailService()
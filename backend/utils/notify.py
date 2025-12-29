import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path

def send_notification(user_id: str, message: str):
    """Legacy placeholder for backward compatibility."""
    print(f"Sending notification to {user_id}: {message}")
    return True

def notify_authorities(report_data: dict) -> None:
    """
    Notify authorities (NGOs/Government) about a high-confidence pollution report.
    
    Args:
        report_data: Dictionary containing report details including:
            - ai_class: Detected pollution type
            - ai_confidence: Confidence score (0.0 to 1.0)
            - latitude, longitude: Location
            - description: Report description
            - id: Report ID
    """
    try:
        ai_class = report_data.get("ai_class", "unknown")
        ai_confidence = report_data.get("ai_confidence", 0.0)
        
        # Only notify if confidence is above threshold
        if ai_confidence < 0.90:
            print(f"Skipping notification: confidence {ai_confidence:.2%} below threshold (90%)")
            return
        
        # Prepare notification message
        subject = f"🚨 High-Confidence Pollution Alert: {ai_class.upper()}"
        
        body = f"""
POLLUTION ALERT - IMMEDIATE ATTENTION REQUIRED

Pollution Type: {ai_class.upper()}
AI Confidence: {ai_confidence:.1%}

Location: 
  Latitude: {report_data.get('latitude', 'N/A')}
  Longitude: {report_data.get('longitude', 'N/A')}

Description: {report_data.get('description', 'No description provided')}

Report ID: {report_data.get('id', 'N/A')}
Severity: {report_data.get('severity', 'N/A')}/10
Status: {report_data.get('status', 'pending')}

Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

This is an automated alert from the Aqua Guardian monitoring system.
Please take appropriate action as soon as possible.
"""
        
        # Try to send email if configured
        email_sent = False
        smtp_host = os.getenv("SMTP_HOST")
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        govt_email = os.getenv("GOVT_EMAIL")
        ngo_email = os.getenv("NGO_EMAIL")
        
        if smtp_host and smtp_user and smtp_password and (govt_email or ngo_email):
            try:
                recipients = []
                if govt_email:
                    recipients.append(govt_email)
                if ngo_email:
                    recipients.append(ngo_email)
                
                msg = MIMEMultipart()
                msg['From'] = smtp_user
                msg['To'] = ", ".join(recipients)
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'plain'))
                
                smtp_port = int(os.getenv("SMTP_PORT", "587"))
                server = smtplib.SMTP(smtp_host, smtp_port)
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
                server.quit()
                
                email_sent = True
                print(f"✅ Email notification sent to: {', '.join(recipients)}")
                
            except Exception as email_error:
                print(f"⚠️ Email sending failed: {email_error}")
        
        # Always log to file as backup
        log_dir = Path(__file__).parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        log_file = log_dir / "notifications.log"
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\n{'='*80}\n")
            f.write(f"Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
            f.write(f"Email Sent: {email_sent}\n")
            f.write(f"{subject}\n")
            f.write(f"{body}\n")
        
        print(f"📝 Notification logged to: {log_file}")
        
        if not email_sent:
            print(f"⚠️ Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, GOVT_EMAIL, NGO_EMAIL in .env")
        
    except Exception as e:
        print(f"❌ Notification failed: {e}")

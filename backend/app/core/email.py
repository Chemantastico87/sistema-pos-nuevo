import os
import logging
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("POS_SaaS_Email")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAILS_FROM_EMAIL = os.getenv("EMAILS_FROM_EMAIL", "no-reply@vendixpos.com")
EMAILS_FROM_NAME = os.getenv("EMAILS_FROM_NAME", "VENDIX POS SaaS")

def _send_email_sync(to_email: str, subject: str, html_content: str):
    """Función síncrona para enviar correo usando SMTP o fallback en logs."""
    if not to_email or "@" not in to_email:
        logger.warning(f"⚠️ Dirección de correo inválida: {to_email}")
        return False

    if not SMTP_HOST or not SMTP_USER:
        logger.info(
            f"📧 [SIMULADOR DE EMAIL] Credenciales SMTP no configuradas. Correo simulado correctamente para <{to_email}> | Asunto: '{subject}'"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{EMAILS_FROM_NAME} <{EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email

        part_html = MIMEText(html_content, "html", "utf-8")
        msg.attach(part_html)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(EMAILS_FROM_EMAIL, [to_email], msg.as_string())
        
        logger.info(f"✅ Correo enviado exitosamente a <{to_email}>")
        return True
    except Exception as e:
        logger.error(f"❌ Error enviando correo a <{to_email}>: {str(e)}")
        # Mantenemos log de simulación limpia como fallback para evitar interrumpir al usuario
        logger.info(f"📧 [FALLBACK EMAIL LOG] Para: {to_email} | Asunto: {subject}")
        return False

async def send_email_async(to_email: str, subject: str, html_content: str):
    """Ejecuta el envío de correo en un hilo secundario sin bloquear el bucle de eventos."""
    return await asyncio.to_thread(_send_email_sync, to_email, subject, html_content)

async def send_welcome_account_email(to_email: str, owner_name: str, company_name: str):
    """Envía el correo de bienvenida al registrar una nueva cuenta/empresa."""
    subject = f"¡Bienvenido a VENDIX POS, {owner_name}! Tu cuenta de {company_name} está lista"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; shadow: 0 10px 25px rgba(0,0,0,0.5); }}
            .logo {{ color: #6366f1; font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 24px; text-transform: uppercase; }}
            .badge {{ background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }}
            h1 {{ color: #f8fafc; font-size: 22px; margin-top: 16px; font-weight: 800; }}
            p {{ color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }}
            .card {{ background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #334155; margin: 24px 0; }}
            .card-title {{ color: #818cf8; font-weight: 700; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin-top: 12px; text-align: center; }}
            .footer {{ border-top: 1px solid #334155; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="logo">⚡ VENDIX POS</div>
                <span class="badge">Cuenta Activada</span>
            </div>
            <h1>¡Hola, {owner_name}!</h1>
            <p>Te damos la bienvenida oficial a <strong>VENDIX POS SaaS Enterprise</strong>. Tu empresa <strong>{company_name}</strong> ha sido registrada con éxito y ya puedes gestionar ventas, caja e inventario en tiempo real.</p>
            
            <div class="card">
                <div class="card-title">Resumen de tu Suscripción Starter</div>
                <p style="margin: 0; color: #cbd5e1;">• <strong>Empresa:</strong> {company_name}<br>• <strong>Plan:</strong> Starter (14 Días de Prueba Gratuita)<br>• <strong>Estado:</strong> Activo & Saludable<br>• <strong>Email de Acceso:</strong> {to_email}</p>
            </div>
            
            <p>Accede ahora a tu panel de control y configura tus productos y puntos de venta:</p>
            <a href="http://localhost:5173" class="btn">Ingresar al Sistema POS</a>
            
            <div class="footer">
                © 2026 VENDIX POS SaaS System. Todos los derechos reservados.<br>
                Si no solicitaste esta cuenta, puedes ignorar este mensaje.
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email_async(to_email, subject, html_content)

async def send_welcome_customer_email(to_email: str, customer_name: str, company_name: str, initial_points: int = 0):
    """Envía el correo de bienvenida cuando se crea un cliente en el sistema POS."""
    subject = f"¡Bienvenido/a a {company_name}! Tu cuenta de cliente está activa"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }}
            .logo {{ color: #818cf8; font-size: 24px; font-weight: 800; margin-bottom: 20px; }}
            h1 {{ color: #f8fafc; font-size: 20px; margin-top: 10px; font-weight: 800; }}
            p {{ color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }}
            .points-box {{ background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%); border: 1px solid #4338ca; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0; }}
            .points-number {{ font-size: 36px; font-weight: 900; color: #fbbf24; margin-top: 4px; }}
            .footer {{ border-top: 1px solid #334155; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🛍️ {company_name}</div>
            <h1>¡Hola, {customer_name}!</h1>
            <p>Gracias por registrarte como cliente en <strong>{company_name}</strong>. Has sido dado de alta exitosamente en nuestro sistema de fidelidad.</p>
            
            <div class="points-box">
                <div style="color: #c7d2fe; font-size: 13px; font-weight: 700; text-transform: uppercase;">Saldo Actual de Puntos de Fidelidad</div>
                <div class="points-number">⭐ {initial_points} PTS</div>
                <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Acumulas puntos con cada compra realizada en tienda.</div>
            </div>
            
            <p>Presenta tu correo o número de teléfono en tu próxima compra para acumular y canjear puntos de beneficio.</p>
            
            <div class="footer">
                Notificación enviada por {company_name} a través de VENDIX POS System.
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email_async(to_email, subject, html_content)

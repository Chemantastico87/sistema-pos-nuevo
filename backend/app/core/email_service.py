import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("email_service")

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """
        Envía un correo electrónico SMTP asíncrono o síncrono.
        Si las credenciales SMTP no están configuradas en entorno de prueba/sandbox,
        registra el envío en logs de auditoría sin romper la experiencia.
        """
        if not getattr(settings, "SMTP_HOST", None) or not getattr(settings, "SMTP_USER", None):
            logger.info(f"[EMAIL SIMULATION] Para: {to_email} | Asunto: '{subject}'")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"VENDIX POS <{settings.SMTP_USER}>"
            msg["To"] = to_email

            part = MIMEText(html_content, "html", "utf-8")
            msg.attach(part)

            server = smtplib.SMTP(settings.SMTP_HOST, getattr(settings, "SMTP_PORT", 587))
            server.starttls()
            server.login(settings.SMTP_USER, getattr(settings, "SMTP_PASSWORD", ""))
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
            server.quit()
            logger.info(f"Correo enviado exitosamente a {to_email}")
            return True
        except Exception as e:
            logger.error(f"Error enviando correo a {to_email}: {e}")
            return False

    @classmethod
    def send_welcome_verification_email(
        cls,
        to_email: str,
        full_name: str,
        company_name: str,
        verification_url: str,
        plan_name: str = "Starter",
        trial_days: int = 14
    ):
        subject = f"¡Bienvenido a VENDIX POS! Confirma tu cuenta para {company_name}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 40px; text-align: center; }}
            .logo {{ font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #818cf8; margin-bottom: 20px; }}
            .badge {{ display: inline-block; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(129, 140, 248, 0.4); color: #c7d2fe; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 8px; margin-bottom: 20px; }}
            h1 {{ font-size: 22px; margin-bottom: 10px; color: #ffffff; }}
            p {{ font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: left; }}
            .details-box {{ background: #0f172a; border-radius: 12px; padding: 15px 20px; margin: 25px 0; text-align: left; border-left: 4px solid #6366f1; }}
            .btn {{ display: inline-block; background: linear-gradient(to right, #4f46e5, #7c3aed); color: #ffffff !important; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 12px; margin-top: 20px; font-size: 14px; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); }}
            .footer {{ margin-top: 30px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">VENDIX POS</div>
            <div class="badge">PLATAFORMA TPV MULTI-TENANT Enterprise v5.0</div>
            <h1>¡Hola, {full_name}!</h1>
            <p>Tu empresa <strong>{company_name}</strong> ha sido creada exitosamente en VENDIX POS. Para comenzar a operar tu punto de venta e inventario, por favor confirma tu dirección de correo electrónico.</p>
            
            <div class="details-box">
              <p style="margin: 4px 0;">🏢 <strong>Empresa:</strong> {company_name}</p>
              <p style="margin: 4px 0;">👤 <strong>Administrador:</strong> {full_name}</p>
              <p style="margin: 4px 0;">📧 <strong>Correo Registrado:</strong> {to_email}</p>
              <p style="margin: 4px 0;">🎁 <strong>Plan Asignado:</strong> {plan_name} ({trial_days} Días de Prueba Activos)</p>
            </div>

            <a href="{verification_url}" class="btn">Verificar Mi Correo Electrónico</a>

            <p style="font-size: 12px; color: #64748b; margin-top: 25px;">Por motivos de seguridad, la contraseña que ingresaste no se incluye en este mensaje. Este enlace de verificación caducará en 24 horas.</p>
            
            <div class="footer">
              &copy; 2026 VENDIX Commercial Systems. Todos los derechos reservados.
            </div>
          </div>
        </body>
        </html>
        """
        return cls.send_email(to_email, subject, html_content)

    @classmethod
    def send_password_reset_email(cls, to_email: str, full_name: str, reset_url: str):
        subject = "Instrucciones para restablecer tu contraseña de VENDIX POS"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 40px; text-align: center; }}
            .btn {{ display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 12px; margin-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #818cf8;">Restablecer Contraseña VENDIX POS</h2>
            <p>Hola, {full_name}. Hemos recibido una solicitud para restablecer la contraseña de tu cuenta ({to_email}).</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña segura:</p>
            <a href="{reset_url}" class="btn">Restablecer Mi Contraseña</a>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Este enlace es de uso único y vencerá en 30 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          </div>
        </body>
        </html>
        """
        return cls.send_email(to_email, subject, html_content)

    @classmethod
    def send_account_locked_email(cls, to_email: str, full_name: str, ip_address: str, date_str: str):
        subject = "⚠️ Alerta de Seguridad: Tu cuenta VENDIX ha sido bloqueada temporalmente"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #ef4444; padding: 40px; text-align: left; }}
            .alert-box {{ background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 12px; padding: 15px; margin: 20px 0; color: #fca5a5; font-size: 13px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #ef4444;">⚠️ Alerta de Seguridad VENDIX POS</h2>
            <p>Hola, {full_name}. Te informamos que tu cuenta ha sido bloqueada temporalmente durante 15 minutos debido a 5 intentos fallidos consecutivos de inicio de sesión.</p>
            <div class="alert-box">
              <p style="margin:2px 0;">🌐 <strong>Dirección IP:</strong> {ip_address}</p>
              <p style="margin:2px 0;">🕒 <strong>Fecha y Hora:</strong> {date_str}</p>
            </div>
            <p>Si fuiste tú, podrás intentar nuevamente pasados los 15 minutos. Si no reconoces esta actividad, te recomendamos restablecer tu contraseña inmediatamente.</p>
          </div>
        </body>
        </html>
        """
        return cls.send_email(to_email, subject, html_content)

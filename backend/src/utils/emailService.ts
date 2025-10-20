import nodemailer, { Transporter } from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'ÖDP-MD² <noreply@oedp.de>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    const subject = 'Bitte verifizieren Sie Ihre E-Mail-Adresse';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Willkommen bei ÖDP-MD², ${firstName}!</h2>
        <p>Vielen Dank für Ihre Registrierung beim ÖDP Mitgliederportal für Direkte Demokratie.</p>
        <p>Bitte verifizieren Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #2e7d32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            E-Mail verifizieren
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Oder kopieren Sie diesen Link in Ihren Browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Dieser Link ist 24 Stunden gültig. Falls Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.
        </p>
        <p>Mit freundlichen Grüßen,<br>Ihr ÖDP-MD² Team</p>
      </div>
    `;
    const text = `Willkommen bei ÖDP-MD², ${firstName}! Bitte verifizieren Sie Ihre E-Mail: ${verificationUrl}`;

    return this.sendEmail({ to, subject, html, text });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const subject = 'Willkommen bei ÖDP-MD²';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Willkommen bei ÖDP-MD², ${firstName}!</h2>
        <p>Ihre E-Mail-Adresse wurde erfolgreich verifiziert!</p>
        <p>Sie können jetzt:</p>
        <ul>
          <li>Mitgliederanträge einreichen und unterstützen</li>
          <li>An Mitgliederbefragungen teilnehmen</li>
          <li>Transparente Entscheidungsprozesse mitgestalten</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Jetzt anmelden</a></p>
        <p>Bei Fragen wenden Sie sich bitte an: <a href="mailto:it-support@oedp.de">it-support@oedp.de</a></p>
        <p>Mit freundlichen Grüßen,<br>Ihr ÖDP-MD² Team</p>
      </div>
    `;
    const text = `Willkommen bei ÖDP-MD², ${firstName}! Ihre E-Mail wurde verifiziert.`;

    return this.sendEmail({ to, subject, html, text });
  }

  async sendMotionSignedNotification(
    to: string,
    motionTitle: string,
    currentSignatures: number
  ): Promise<boolean> {
    const subject = `Ihr Antrag "${motionTitle}" hat eine neue Unterschrift`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Neue Unterstützung für Ihren Antrag</h2>
        <p>Ihr Mitgliederantrag "<strong>${motionTitle}</strong>" hat eine neue Unterschrift erhalten.</p>
        <p><strong>Aktuelle Unterschriften:</strong> ${currentSignatures} / 80</p>
        ${
          currentSignatures >= 80
            ? '<p style="color: green; font-weight: bold;">✓ Ihr Antrag hat die erforderliche Anzahl von 80 Unterschriften erreicht!</p>'
            : `<p>Noch benötigt: ${80 - currentSignatures} Unterschriften</p>`
        }
        <p><a href="${process.env.FRONTEND_URL}/motions/${motionTitle}" style="background: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Antrag anzeigen</a></p>
      </div>
    `;
    const text = `Ihr Antrag "${motionTitle}" hat eine neue Unterschrift. Aktuell: ${currentSignatures}/80`;

    return this.sendEmail({ to, subject, html, text });
  }

  async sendMotionValidatedNotification(
    to: string,
    motionTitle: string,
    isApproved: boolean
  ): Promise<boolean> {
    const subject = isApproved
      ? `Ihr Antrag "${motionTitle}" wurde genehmigt`
      : `Ihr Antrag "${motionTitle}" benötigt Überarbeitung`;

    const html = isApproved
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: green;">✓ Antrag genehmigt</h2>
        <p>Ihr Mitgliederantrag "<strong>${motionTitle}</strong>" wurde von der Bundesgeschäftsstelle geprüft und genehmigt.</p>
        <p>Der Antrag wird zur nächsten Bundesparteitag-Sitzung eingereicht.</p>
        <p><a href="${process.env.FRONTEND_URL}/motions/${motionTitle}" style="background: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Antrag anzeigen</a></p>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: orange;">⚠ Antrag benötigt Überarbeitung</h2>
        <p>Ihr Mitgliederantrag "<strong>${motionTitle}</strong>" wurde geprüft und benötigt Anpassungen.</p>
        <p>Bitte überprüfen Sie die Hinweise im Portal und nehmen Sie die erforderlichen Änderungen vor.</p>
        <p><a href="${process.env.FRONTEND_URL}/motions/${motionTitle}" style="background: #f57c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Antrag anzeigen</a></p>
      </div>
    `;

    const text = isApproved
      ? `Ihr Antrag "${motionTitle}" wurde genehmigt.`
      : `Ihr Antrag "${motionTitle}" benötigt Überarbeitung.`;

    return this.sendEmail({ to, subject, html, text });
  }

  async sendSurveyInvitation(to: string, surveyTitle: string, surveyId: string): Promise<boolean> {
    const subject = `Neue Mitgliederbefragung: ${surveyTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Neue Mitgliederbefragung</h2>
        <p>Eine neue Mitgliederbefragung wurde gestartet: "<strong>${surveyTitle}</strong>"</p>
        <p>Ihre Meinung ist wichtig! Nehmen Sie jetzt an der Befragung teil.</p>
        <p><a href="${process.env.FRONTEND_URL}/surveys/${surveyId}" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Jetzt teilnehmen</a></p>
      </div>
    `;
    const text = `Neue Mitgliederbefragung: ${surveyTitle}. Nehmen Sie jetzt teil.`;

    return this.sendEmail({ to, subject, html, text });
  }
}

export const emailService = new EmailService();

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole, MembershipStatus } from '../entities/User.entity';
import { AuditLog, AuditAction } from '../entities/AuditLog.entity';
import { emailService } from '../utils/emailService';
import { logger } from '../utils/logger';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
} from '../validators/auth.validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  async register(req: Request, res: Response): Promise<void> {
    const validatedData = registerSchema.parse(req.body) as RegisterInput;

    // Check if email domain is @oedp.de
    if (!validatedData.email.toLowerCase().endsWith('@oedp.de')) {
      throw new AppError(400, 'Nur E-Mail-Adressen mit der Domain @oedp.de sind erlaubt');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      parseInt(process.env.BCRYPT_ROUNDS || '12')
    );

    // Generate email verification token
    const verificationToken = jwt.sign(
      { email: validatedData.email },
      process.env.JWT_SECRET || 'development-secret',
      { expiresIn: '24h' }
    );

    // Create user (not verified yet)
    const user = this.userRepository.create({
      ...validatedData,
      password: hashedPassword,
      role: UserRole.MEMBER,
      membershipStatus: MembershipStatus.ACTIVE,
      isActive: false, // Inactive until email verified
      emailVerified: false,
      resetPasswordToken: verificationToken, // Temporarily store verification token
      resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await this.userRepository.save(user);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.USER_CREATED,
      userId: user.id,
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

    logger.info(`New user registered (pending verification): ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail (@oedp.de) zur Verifizierung.',
      data: {
        email: user.email,
        verificationRequired: true,
      },
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const validatedData = loginSchema.parse(req.body) as LoginInput;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new AppError(401, 'Ungültige Anmeldedaten');
    }

    if (!user.emailVerified) {
      throw new AppError(403, 'Bitte verifizieren Sie zuerst Ihre E-Mail-Adresse');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Ihr Konto wurde deaktiviert');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Ungültige Anmeldedaten');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'development-secret'
    );

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.USER_LOGIN,
      userId: user.id,
      entityType: 'User',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User logged in: ${user.email}`);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Anmeldung erfolgreich',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    if (req.user) {
      await this.auditLogRepository.save({
        action: AuditAction.USER_LOGOUT,
        userId: req.user.id,
        entityType: 'User',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.clearCookie('token');

    res.json({
      success: true,
      message: 'Abmeldung erfolgreich',
    });
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
    });
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const validatedData = changePasswordSchema.parse(req.body) as ChangePasswordInput;

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      req.user.password
    );

    if (!isPasswordValid) {
      throw new AppError(401, 'Aktuelles Passwort ist falsch');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      validatedData.newPassword,
      parseInt(process.env.BCRYPT_ROUNDS || '12')
    );

    // Update password
    req.user.password = hashedPassword;
    await this.userRepository.save(req.user);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.USER_UPDATED,
      userId: req.user.id,
      entityType: 'User',
      entityId: req.user.id,
      metadata: { action: 'password_changed' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User changed password: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Passwort erfolgreich geändert',
    });
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError(401, 'Nicht authentifiziert');
    }

    const { firstName, lastName, landesverband, kreisverband, postalCode, city } = req.body;

    // Update user
    if (firstName) req.user.firstName = firstName;
    if (lastName) req.user.lastName = lastName;
    if (landesverband !== undefined) req.user.landesverband = landesverband;
    if (kreisverband !== undefined) req.user.kreisverband = kreisverband;
    if (postalCode !== undefined) req.user.postalCode = postalCode;
    if (city !== undefined) req.user.city = city;

    await this.userRepository.save(req.user);

    // Create audit log
    await this.auditLogRepository.save({
      action: AuditAction.USER_UPDATED,
      userId: req.user.id,
      entityType: 'User',
      entityId: req.user.id,
      metadata: { action: 'profile_updated' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Profil erfolgreich aktualisiert',
      data: {
        user: req.user.toJSON(),
      },
    });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    if (!token) {
      throw new AppError(400, 'Verifizierungstoken fehlt');
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'development-secret'
      ) as { email: string };

      // Find user
      const user = await this.userRepository.findOne({
        where: { 
          email: decoded.email,
          resetPasswordToken: token,
        },
      });

      if (!user) {
        throw new AppError(404, 'Ungültiger oder abgelaufener Verifizierungslink');
      }

      // Check if token expired
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        throw new AppError(400, 'Verifizierungslink ist abgelaufen');
      }

      // Verify email
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      user.isActive = true;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await this.userRepository.save(user);

      // Create audit log
      await this.auditLogRepository.save({
        action: AuditAction.USER_UPDATED,
        userId: user.id,
        entityType: 'User',
        entityId: user.id,
        metadata: { action: 'email_verified' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName);

      logger.info(`Email verified for user: ${user.email}`);

      res.json({
        success: true,
        message: 'E-Mail erfolgreich verifiziert! Sie können sich jetzt anmelden.',
        data: {
          email: user.email,
          verified: true,
        },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(400, 'Ungültiger Verifizierungslink');
      }
      throw error;
    }
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw new AppError(400, 'E-Mail-Adresse fehlt');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      res.json({
        success: true,
        message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine Verifizierungs-E-Mail gesendet.',
      });
      return;
    }

    if (user.emailVerified) {
      throw new AppError(400, 'E-Mail-Adresse ist bereits verifiziert');
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || 'development-secret',
      { expiresIn: '24h' }
    );

    user.resetPasswordToken = verificationToken;
    user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.userRepository.save(user);

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

    logger.info(`Verification email resent to: ${user.email}`);

    res.json({
      success: true,
      message: 'Verifizierungs-E-Mail wurde erneut gesendet.',
    });
  }
}

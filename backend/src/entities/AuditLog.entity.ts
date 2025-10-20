import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';

export enum AuditAction {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  MOTION_CREATED = 'motion.created',
  MOTION_UPDATED = 'motion.updated',
  MOTION_SUBMITTED = 'motion.submitted',
  MOTION_VALIDATED = 'motion.validated',
  MOTION_REJECTED = 'motion.rejected',
  MOTION_SCHEDULED = 'motion.scheduled',
  SIGNATURE_ADDED = 'signature.added',
  SIGNATURE_REMOVED = 'signature.removed',
  SURVEY_CREATED = 'survey.created',
  SURVEY_STARTED = 'survey.started',
  SURVEY_COMPLETED = 'survey.completed',
  VOTE_CAST = 'vote.cast',
  ROLE_CHANGED = 'role.changed',
  SETTINGS_CHANGED = 'settings.changed',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Index()
  action!: AuditAction;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  entityType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  // Immutable - no updates or deletes allowed
}

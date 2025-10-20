import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Vote } from './Vote.entity';

export enum SurveyStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RANKED_CHOICE = 'ranked_choice',
  FREE_TEXT = 'free_text',
  YES_NO = 'yes_no',
}

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  questionType!: QuestionType;

  @Column({ type: 'jsonb' })
  options!: string[];

  @Column({
    type: 'enum',
    enum: SurveyStatus,
    default: SurveyStatus.DRAFT,
  })
  @Index()
  status!: SurveyStatus;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creatorId' })
  creator!: User;

  @Column()
  creatorId!: string;

  @Column({ type: 'simple-array' })
  coInitiatorIds!: string[];

  @Column({ type: 'int', default: 7 })
  durationDays!: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: true })
  isAnonymous!: boolean;

  @Column({ type: 'boolean', default: false })
  isBinding!: boolean;

  @OneToMany(() => Vote, (vote) => vote.survey)
  votes!: Vote[];

  @Column({ type: 'int', default: 0 })
  participantCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  results?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @Column({ nullable: true })
  approvedById?: string;

  @Column({ type: 'text', nullable: true })
  approvalNotes?: string;

  @Column({ type: 'boolean', default: false })
  resultsPublished!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resultsPublishedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get isActive(): boolean {
    const now = new Date();
    return (
      this.status === SurveyStatus.ACTIVE &&
      !!this.startDate &&
      this.startDate <= now &&
      !!this.endDate &&
      this.endDate >= now
    );
  }

  get hasEnded(): boolean {
    return !!this.endDate && this.endDate < new Date();
  }
}

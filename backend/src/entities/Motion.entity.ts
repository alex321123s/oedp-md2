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
import { Signature } from './Signature.entity';

export enum MotionType {
  // S-Antrag: Satzungsänderung (Constitutional Amendment) - 2/3 majority
  SATZUNGSAENDERUNG = 'satzungsaenderung',
  
  // F-Antrag: Finanzordnung (Financial Regulation) - Simple majority
  FINANZORDNUNG = 'finanzordnung',
  
  // SGO-Antrag: Schiedsgerichtsordnung (Arbitration Rules) - 2/3 majority
  SCHIEDSGERICHTSORDNUNG = 'schiedsgerichtsordnung',
  
  // GO-Antrag: Geschäftsordnung BPT/BHA (Rules of Procedure) - Simple majority
  GESCHAEFTSORDNUNG = 'geschaeftsordnung',
  
  // BAK-GO-Antrag: Geschäftsordnung für Bundesarbeitskreise - Simple majority
  BAK_GESCHAEFTSORDNUNG = 'bak_geschaeftsordnung',
  
  // B-Antrag/P-Antrag: Bundesprogramm/Positionsantrag (Policy Platform) - Simple majority
  PROGRAMMAENDERUNG = 'programmaenderung',
  
  // E-Antrag: Entschließungsantrag (Resolution) - Simple majority
  ENTSCHLIESSUNG = 'entschliessung',
  
  // M-Antrag: Sonstiges (Miscellaneous) - Simple majority
  SONSTIGES = 'sonstiges',
  
  // Legacy types (kept for compatibility)
  GRUNDSATZANTRAG = 'grundsatzantrag',
  SACHANTRAG = 'sachantrag',
  DRINGLICHKEITSANTRAG = 'dringlichkeitsantrag',
}

export enum MotionStatus {
  DRAFT = 'draft',
  COLLECTING = 'collecting',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

@Entity('motions')
export class Motion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  fullText!: string;

  @Column({
    type: 'enum',
    enum: MotionType,
  })
  type!: MotionType;

  @Column({
    type: 'enum',
    enum: MotionStatus,
    default: MotionStatus.DRAFT,
  })
  @Index()
  status!: MotionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetParagraph?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetSection?: string;

  // Legal reference (e.g., "§10.1", "§15", "Finanzordnung §3")
  @Column({ type: 'varchar', length: 255, nullable: true })
  legalReference?: string;

  // Majority requirement: 'simple' or 'two_thirds'
  @Column({ type: 'varchar', length: 20, default: 'simple' })
  majorityRequired!: string;

  // Target group (e.g., "Bundesparteitag", "Bundeshauptausschuss")
  @Column({ type: 'varchar', length: 100, default: 'Bundesparteitag' })
  targetGroup!: string;

  // Creator
  @ManyToOne(() => User, (user) => user.motionsCreated, { eager: true })
  @JoinColumn({ name: 'creatorId' })
  creator!: User;

  @Column()
  creatorId!: string;

  // Vertrauensperson (trust person with speaking rights)
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'trustPersonId' })
  trustPerson?: User;

  @Column({ nullable: true })
  trustPersonId?: string;

  // Ersatzperson (backup trust person)
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'backupTrustPersonId' })
  backupTrustPerson?: User;

  @Column({ nullable: true })
  backupTrustPersonId?: string;

  // Signatures
  @OneToMany(() => Signature, (signature) => signature.motion, { cascade: true })
  signatures!: Signature[];

  @Column({ type: 'int', default: 0 })
  signatureCount!: number;

  @Column({ type: 'int', default: 80 })
  signatureThreshold!: number;

  // Submission details
  @Column({ type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  validatedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'validatedById' })
  validatedBy?: User;

  @Column({ nullable: true })
  validatedById?: string;

  @Column({ type: 'text', nullable: true })
  validationNotes?: string;

  // BPT Scheduling
  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  bptAgendaItem?: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bptVenue?: string;

  // Final outcome
  @Column({ type: 'timestamp', nullable: true })
  votedAt?: Date;

  @Column({ type: 'int', nullable: true })
  votesFor?: number;

  @Column({ type: 'int', nullable: true })
  votesAgainst?: number;

  @Column({ type: 'int', nullable: true })
  votesAbstain?: number;

  @Column({ type: 'text', nullable: true })
  outcomeNotes?: string;

  // Visibility
  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived!: boolean;

  // Tags and metadata
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Virtual fields
  get hasRequiredSignatures(): boolean {
    return this.signatureCount >= this.signatureThreshold;
  }

  get canBeSubmitted(): boolean {
    return (
      this.status === MotionStatus.COLLECTING &&
      this.hasRequiredSignatures &&
      !!this.trustPersonId
    );
  }

  get isValidated(): boolean {
    return this.status === MotionStatus.APPROVED && !!this.validatedAt;
  }
}

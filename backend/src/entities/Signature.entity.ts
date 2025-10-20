import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './User.entity';
import { Motion } from './Motion.entity';

@Entity('signatures')
@Unique(['motionId', 'signerId'])
@Index(['motionId', 'signerId'])
export class Signature {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Motion, (motion) => motion.signatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'motionId' })
  motion!: Motion;

  @Column()
  @Index()
  motionId!: string;

  @ManyToOne(() => User, (user) => user.signatures, { eager: true })
  @JoinColumn({ name: 'signerId' })
  signer!: User;

  @Column()
  @Index()
  signerId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'boolean', default: true })
  isValid!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  signedAt!: Date;

  // Virtual fields
  get signerName(): string {
    return this.signer ? this.signer.fullName : 'Unknown';
  }

  get signerMemberId(): string | undefined {
    return this.signer?.memberId;
  }
}

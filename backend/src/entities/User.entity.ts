import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Motion } from './Motion.entity';
import { Signature } from './Signature.entity';
import { Vote } from './Vote.entity';

export enum UserRole {
  MEMBER = 'member',
  DELEGATE = 'delegate',
  BGST = 'bgst',
  BANTRK = 'bantrk',
  BUVO = 'buvo',
  ADMIN = 'admin',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  @Index()
  memberId?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  membershipStatus!: MembershipStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  landesverband?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kreisverband?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Motion, (motion) => motion.creator)
  motionsCreated!: Motion[];

  @OneToMany(() => Signature, (signature) => signature.signer)
  signatures!: Signature[];

  @OneToMany(() => Vote, (vote) => vote.voter)
  votes!: Vote[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isBGSt(): boolean {
    return this.role === UserRole.BGST || this.isAdmin;
  }

  get isBAntrK(): boolean {
    return this.role === UserRole.BANTRK || this.isAdmin;
  }

  get isBuVo(): boolean {
    return this.role === UserRole.BUVO || this.isAdmin;
  }

  // Exclude password from JSON
  toJSON() {
    const { password, emailVerificationToken, resetPasswordToken, ...user } = this as any;
    return user;
  }
}

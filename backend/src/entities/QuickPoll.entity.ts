import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Motion } from './Motion.entity';

@Entity('quick_polls')
export class QuickPoll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  motionId: string;

  @ManyToOne(() => Motion)
  @JoinColumn({ name: 'motionId' })
  motion: Motion;

  @Column({ length: 255 })
  question: string;

  @Column('simple-array') // Stores array as comma-separated string
  options: string[];

  @Column('jsonb', { default: {} })
  votes: Record<string, number>; // { "option1": 5, "option2": 3 }

  @Column('uuid')
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  allowMultipleVotes: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

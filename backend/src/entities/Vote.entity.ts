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
import { Survey } from './Survey.entity';

@Entity('votes')
@Unique(['surveyId', 'voterId'])
@Index(['surveyId', 'voterId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Survey, (survey) => survey.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'surveyId' })
  survey!: Survey;

  @Column()
  @Index()
  surveyId!: string;

  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: 'voterId' })
  voter!: User;

  @Column()
  @Index()
  voterId!: string;

  @Column({ type: 'jsonb' })
  voteValue!: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  votedAt!: Date;
}

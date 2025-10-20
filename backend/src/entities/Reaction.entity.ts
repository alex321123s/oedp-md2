import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from './User.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export enum ReactionEntityType {
  MOTION = 'motion',
  SURVEY = 'survey',
  COMMENT = 'comment',
}

@Entity('reactions')
@Unique(['userId', 'entityType', 'entityId']) // One reaction per user per entity
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ReactionEntityType,
  })
  entityType: ReactionEntityType;

  @Column('uuid')
  entityId: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  reactionType: ReactionType;

  @CreateDateColumn()
  createdAt: Date;
}

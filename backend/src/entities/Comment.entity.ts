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

export enum CommentType {
  MOTION = 'motion',
  SURVEY = 'survey',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CommentType,
  })
  entityType: CommentType;

  @Column('uuid')
  entityId: string;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('text')
  content: string;

  @Column('uuid', { nullable: true })
  parentId: string | null; // For threaded replies

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  dislikesCount: number;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

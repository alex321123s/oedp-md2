import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.entity';
import { Motion } from '../entities/Motion.entity';
import { Signature } from '../entities/Signature.entity';
import { AuditLog } from '../entities/AuditLog.entity';
import { Survey } from '../entities/Survey.entity';
import { Vote } from '../entities/Vote.entity';
import { Comment } from '../entities/Comment.entity';
import { Reaction } from '../entities/Reaction.entity';
import { QuickPoll } from '../entities/QuickPoll.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Motion, Signature, AuditLog, Survey, Vote, Comment, Reaction, QuickPoll],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
});

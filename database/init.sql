-- ÖDP-MD² Database Initialization Script
-- PostgreSQL 15+

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set timezone
SET timezone = 'Europe/Berlin';

-- Create custom types (these will be synced by TypeORM)
-- Just ensuring the database is ready

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE oedp_md2 TO oedp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO oedp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO oedp_user;

-- Create indexes for performance (TypeORM will create these, but we can prepare)
-- These are just preparation comments

-- Comments for documentation
COMMENT ON DATABASE oedp_md2 IS 'ÖDP Mitgliederportal für Direkte Demokratie - Database';

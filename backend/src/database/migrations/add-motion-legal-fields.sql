-- Add legal reference, majority requirement, and target group fields to motions table
-- Migration: add-motion-legal-fields

-- Add new motion types to enum
ALTER TYPE motions_type_enum ADD VALUE IF NOT EXISTS 'finanzordnung';
ALTER TYPE motions_type_enum ADD VALUE IF NOT EXISTS 'schiedsgerichtsordnung';
ALTER TYPE motions_type_enum ADD VALUE IF NOT EXISTS 'geschaeftsordnung';
ALTER TYPE motions_type_enum ADD VALUE IF NOT EXISTS 'bak_geschaeftsordnung';
ALTER TYPE motions_type_enum ADD VALUE IF NOT EXISTS 'entschliessung';
ALTER TYPE motions_type_enum ADD VALUE IF NOT EXISTS 'sonstiges';

-- Add new columns
ALTER TABLE motions 
ADD COLUMN IF NOT EXISTS "legalReference" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "majorityRequired" VARCHAR(20) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS "targetGroup" VARCHAR(100) DEFAULT 'Bundesparteitag';

-- Update existing motions based on their type
UPDATE motions SET "majorityRequired" = 'two_thirds' 
WHERE type IN ('satzungsaenderung', 'schiedsgerichtsordnung');

UPDATE motions SET "majorityRequired" = 'simple' 
WHERE type NOT IN ('satzungsaenderung', 'schiedsgerichtsordnung');

-- Add comments for documentation
COMMENT ON COLUMN motions."legalReference" IS 'Legal reference (e.g., §10.1, §15, Finanzordnung §3)';
COMMENT ON COLUMN motions."majorityRequired" IS 'Majority requirement: simple or two_thirds';
COMMENT ON COLUMN motions."targetGroup" IS 'Target decision body (e.g., Bundesparteitag, Bundeshauptausschuss)';

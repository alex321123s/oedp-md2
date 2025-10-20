-- Trigger to automatically update signature count
-- This ensures the count is ALWAYS accurate, even if application code fails

-- Function to update signature count
CREATE OR REPLACE FUNCTION update_motion_signature_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the motion's signature count based on actual valid signatures
    UPDATE motions
    SET "signatureCount" = (
        SELECT COUNT(*)
        FROM signatures
        WHERE "motionId" = COALESCE(NEW."motionId", OLD."motionId")
        AND "isValid" = true
    )
    WHERE id = COALESCE(NEW."motionId", OLD."motionId");
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS signature_added_trigger ON signatures;
DROP TRIGGER IF EXISTS signature_removed_trigger ON signatures;
DROP TRIGGER IF EXISTS signature_updated_trigger ON signatures;

-- Trigger when signature is added
CREATE TRIGGER signature_added_trigger
AFTER INSERT ON signatures
FOR EACH ROW
EXECUTE FUNCTION update_motion_signature_count();

-- Trigger when signature is removed
CREATE TRIGGER signature_removed_trigger
AFTER DELETE ON signatures
FOR EACH ROW
EXECUTE FUNCTION update_motion_signature_count();

-- Trigger when signature is updated (e.g., isValid changed)
CREATE TRIGGER signature_updated_trigger
AFTER UPDATE ON signatures
FOR EACH ROW
WHEN (OLD."isValid" IS DISTINCT FROM NEW."isValid")
EXECUTE FUNCTION update_motion_signature_count();

-- Fix all existing counts
UPDATE motions
SET "signatureCount" = (
    SELECT COUNT(*)
    FROM signatures
    WHERE "motionId" = motions.id
    AND "isValid" = true
);

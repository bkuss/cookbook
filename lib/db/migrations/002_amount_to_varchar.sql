-- Migration: Convert amount column from DECIMAL(10,2) to VARCHAR(50)
-- This allows storing fractions (e.g., "1/2", "1 1/2") and preserves exact format.
-- Existing decimal values are converted to strings with trailing zeros removed.

ALTER TABLE recipes_ingredients
ALTER COLUMN amount TYPE VARCHAR(50)
USING CASE
  WHEN amount IS NULL THEN NULL
  WHEN amount = FLOOR(amount) THEN CAST(CAST(amount AS INTEGER) AS VARCHAR)
  ELSE RTRIM(RTRIM(CAST(amount AS TEXT), '0'), '.')
END;

-- App settings (stores hashed PIN)
CREATE TABLE IF NOT EXISTS recipes_app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    servings INTEGER DEFAULT 4,
    image_data TEXT,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table (normalized)
CREATE TABLE IF NOT EXISTS recipes_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes_recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2),
    unit VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_recipes_title ON recipes_recipes USING gin(to_tsvector('german', title));
CREATE INDEX IF NOT EXISTS idx_recipes_recipes_created_at ON recipes_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_ingredients_recipe_id ON recipes_ingredients(recipe_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION recipes_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_recipes_recipes_updated_at ON recipes_recipes;
CREATE TRIGGER update_recipes_recipes_updated_at
    BEFORE UPDATE ON recipes_recipes
    FOR EACH ROW EXECUTE FUNCTION recipes_update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_settings_updated_at ON recipes_app_settings;
CREATE TRIGGER update_recipes_settings_updated_at
    BEFORE UPDATE ON recipes_app_settings
    FOR EACH ROW EXECUTE FUNCTION recipes_update_updated_at_column();

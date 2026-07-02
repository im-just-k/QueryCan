-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 1. Enable Row Level Security
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows anyone to read the faculty data for now
CREATE POLICY "Allow public read access" ON faculty
    FOR SELECT USING (true);

-- Create a trigger function to automatically handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the faculty table (Fixed syntax)
CREATE TRIGGER update_faculty_modtime
    BEFORE UPDATE ON faculty
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
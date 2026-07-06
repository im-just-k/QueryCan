-- Create a table to hold the top 15 Canadian Universities
CREATE TABLE IF NOT EXISTS universities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    province VARCHAR(50) NOT NULL
);

-- Enable RLS for universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for universities" ON universities FOR SELECT USING (true);

-- Populate the Top 15 Canadian CS Institutions (based on Maclean's/QS data)
INSERT INTO universities (name, province) VALUES
    ('University of Toronto', 'ON'),
    ('University of Waterloo', 'ON'),
    ('University of British Columbia', 'BC'),
    ('McGill University', 'QC'),
    ('University of Alberta', 'AB'),
    ('Université de Montréal', 'QC'),
    ('Simon Fraser University', 'BC'),
    ('McMaster University', 'ON'),
    ('University of Ottawa', 'ON'),
    ('Carleton University', 'ON'),
    ('University of Calgary', 'AB'),
    ('Queen''s University', 'ON'),
    ('University of Victoria', 'BC'),
    ('Western University', 'ON'),
    ('York University', 'ON')
ON CONFLICT (name) DO NOTHING;

-- Faculty table restricted to CS departments only
CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    university_id BIGINT REFERENCES universities(id) ON DELETE SET NULL,
    department VARCHAR(100) DEFAULT 'Computer Science',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT check_cs_only CHECK (department IN ('Computer Science', 'School of Computer Science', 'Computer Science Department'))
);

-- Enable RLS for faculty
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for faculty" ON faculty FOR SELECT USING (true);

-- 3. Attach modified timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faculty_modtime
    BEFORE UPDATE ON faculty
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
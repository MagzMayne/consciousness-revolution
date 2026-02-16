-- SQL sample for GitHub language detection
-- BarbrickDesign - Complete Language Portfolio

-- Create table
CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    paradigm VARCHAR(50),
    typing VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO languages (name, paradigm, typing) VALUES
    ('SQL', 'Declarative', 'Static'),
    ('Python', 'Multi-paradigm', 'Dynamic'),
    ('Java', 'Object-oriented', 'Static');

-- Select with join
SELECT 
    l.name,
    l.paradigm,
    l.typing,
    COUNT(*) as count
FROM languages l
GROUP BY l.name, l.paradigm, l.typing
HAVING count > 0
ORDER BY l.name;

-- Update
UPDATE languages 
SET paradigm = 'Declarative' 
WHERE name = 'SQL';

-- View
CREATE VIEW IF NOT EXISTS language_summary AS
SELECT name, paradigm, typing
FROM languages
ORDER BY name;

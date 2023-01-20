create TABLE tasks(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
)
ALTER TABLE tasks ADD COLUMN done boolean
ALTER TABLE tasks ADD COLUMN descriptions TEXT
ALTER TABLE tasks ADD COLUMN deadlines DATE
ALTER TABLE tasks ADD COLUMN prioritys TEXT
ALTER TABLE users ADD COLUMN login TEXT
ALTER TABLE users ADD COLUMN password TEXT


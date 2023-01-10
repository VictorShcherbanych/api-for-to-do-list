create TABLE tasks(
    id SERIAL PRIMARY KEY,
    name VARCHAR(300),
)
ALTER TABLE tasks ADD COLUMN done boolean
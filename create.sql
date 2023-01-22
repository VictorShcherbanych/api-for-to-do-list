create TABLE tasks(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    done boolean,
    descriptions TEXT,
    deadlines DATE,
    prioritys TEXT,
    user_id TEXT
);

create TABLE users(
    id SERIAL PRIMARY KEY,
    login TEXT,
    password TEXT,
    name TEXT,
    lastname TEXT,
    token TEXT
);
ALTER TABLE tasks ADD COLUMN done boolean



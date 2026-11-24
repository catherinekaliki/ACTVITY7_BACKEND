CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 80),
    category TEXT NOT NULL
        CHECK (category IN ('Network', 'Software', 'Hardware')),
    description TEXT NOT NULL
        CHECK(length(description) BETWEEN 5 AND 300),
    status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'In progress', 'Completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
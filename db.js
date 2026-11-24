const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'it_support_desk.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Create the records table
const schema = fs.readFileSync(
    path.join(__dirname, 'schema.sql'),
    'utf8'
);
db.exec(schema);

// Insert sample records only if the table is empty
const count = db.prepare(
    'SELECT COUNT(*) AS count FROM records'
).get();

if (count.count === 0) {
    const seed = fs.readFileSync(
        path.join(__dirname, 'seed.sql'),
        'utf8'
    );
    db.exec(seed);
}

console.log('Connected to SQLite database successfully');

module.exports = db;
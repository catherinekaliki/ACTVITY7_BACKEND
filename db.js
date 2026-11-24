require('dotenv').config();

const { Pool } = require('pg');

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

db.on('connect', () => {
    console.log('Connected to PostgreSQL database successfully');
});

db.on('error', (error) => {
    console.error('Unexpected database error:', error);
});

module.exports = db;
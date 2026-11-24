const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDatabase() {
    try {
        // Create the records table
        const schema = fs.readFileSync(
            path.join(__dirname, 'schema.sql'),
            'utf8'
        );

        await db.query(schema);

        // Check whether sample records already exist
        const result = await db.query(
            'SELECT COUNT(*) FROM records'
        );

        if (Number(result.rows[0].count) === 0) {
            const seed = fs.readFileSync(
                path.join(__dirname, 'seed.sql'),
                'utf8'
            );

            await db.query(seed);
            console.log('Eight sample records inserted successfully');
        }

        console.log('Database initialised successfully');

    } catch (error) {
        console.error('Database initialisation failed:', error);
        throw error;
    }
}

module.exports = initDatabase;
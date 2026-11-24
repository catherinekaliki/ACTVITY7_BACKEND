const express = require('express');
const router = express.Router();
const db = require('../db');

const validCategories = ['Network', 'Software', 'Hardware'];
const validStatuses = ['Pending', 'In progress', 'Completed'];

// Validate record information
function validateRecord(data = {}) {
    const { title, category, description, status } = data;

    if (
        typeof title !== 'string' ||
        title.trim().length < 3 ||
        title.trim().length > 80
    ) {
        return 'Title must be between 3 and 80 characters.';
    }

    if (!validCategories.includes(category)) {
        return 'Invalid category.';
    }

    if (
        typeof description !== 'string' ||
        description.trim().length < 5 ||
        description.trim().length > 300
    ) {
        return 'Description must be between 5 and 300 characters.';
    }

    if (!validStatuses.includes(status)) {
        return 'Invalid status.';
    }

    return null;
}

// Validate record ID
function validateId(id) {
    const number = Number(id);

    if (!Number.isSafeInteger(number) || number <= 0) {
        return null;
    }

    return number;
}

// GET: Retrieve all records
router.get('/', (req, res, next) => {
    try {
        const records = db.prepare(
            'SELECT * FROM records ORDER BY id ASC'
        ).all();

        res.status(200).json(records);
    } catch (error) {
        next(error);
    }
});

// GET: Retrieve one record
router.get('/:id', (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: 'ID must be a positive whole number.'
            });
        }

        const record = db.prepare(
            'SELECT * FROM records WHERE id = ?'
        ).get(id);

        if (!record) {
            return res.status(404).json({
                message: 'Record not found.'
            });
        }

        res.status(200).json(record);
    } catch (error) {
        next(error);
    }
});

// POST: Create a new record
router.post('/', (req, res, next) => {
    try {
        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = db.prepare(`
            INSERT INTO records
            (title, category, description, status)
            VALUES (?, ?, ?, ?)
        `).run(
            title.trim(),
            category,
            description.trim(),
            status
        );

        const record = db.prepare(
            'SELECT * FROM records WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json(record);
    } catch (error) {
        next(error);
    }
});

// PUT: Update an existing record
router.put('/:id', (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: 'ID must be a positive whole number.'
            });
        }

        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = db.prepare(`
            UPDATE records
            SET title = ?,
                category = ?,
                description = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            title.trim(),
            category,
            description.trim(),
            status,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: 'Record not found.'
            });
        }

        const record = db.prepare(
            'SELECT * FROM records WHERE id = ?'
        ).get(id);

        res.status(200).json(record);
    } catch (error) {
        next(error);
    }
});

// DELETE: Delete a record
router.delete('/:id', (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: 'ID must be a positive whole number.'
            });
        }

        const result = db.prepare(
            'DELETE FROM records WHERE id = ?'
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: 'Record not found.'
            });
        }

        res.status(200).json({
            message: 'Record deleted.'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');

const validCategories = ['Network', 'Software', 'Hardware'];
const validStatuses = ['Pending', 'In progress', 'Completed'];

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

function validateId(id) {
    if (!/^[1-9]\d*$/.test(id)) {
        return null;
    }

    const number = Number(id);

    return Number.isSafeInteger(number) ? number : null;
}

// GET ALL RECORDS
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT * FROM records ORDER BY id ASC'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET ONE RECORD
router.get('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: 'ID must be a positive whole number.'
            });
        }

        const result = await db.query(
            'SELECT * FROM records WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Record not found.'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// CREATE RECORD
router.post('/', async (req, res, next) => {
    try {
        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = await db.query(
            `INSERT INTO records
            (title, category, description, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [title.trim(), category, description.trim(), status]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// UPDATE RECORD
router.put('/:id', async (req, res, next) => {
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

        const result = await db.query(
            `UPDATE records
            SET title = $1,
                category = $2,
                description = $3,
                status = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *`,
            [title.trim(), category, description.trim(), status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Record not found.'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE RECORD
router.delete('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: 'ID must be a positive whole number.'
            });
        }

        const result = await db.query(
            'DELETE FROM records WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
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
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const recordsRoutes = require('./routes/records');

// CORS configuration
const origins = (process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: origins.length ? origins : true
}));

app.use(express.json());

// Home route - API Guide
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>IT Support Desk API</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 30px;
                    background: #f4f4f4;
                    color: #333;
                }
                main {
                    max-width: 900px;
                    margin: auto;
                    background: white;
                    padding: 25px;
                    border-radius: 8px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background: #e5eaf0;
                }
                code {
                    background: #eee;
                    padding: 3px;
                }
            </style>
        </head>
        <body>
            <main>
                <h1>IT Support Desk API</h1>
                <p>Student Name: Catherine Kaliki</p>
                <p>Student Number: 202508939</p>
                <p>
                    This API manages IT support requests
                    for the IT Support Desk system.
                </p>

                <h2>API Links</h2>
                <p><a href="/health">Health Check</a></p>
                <p><a href="/api/records">View All Records</a></p>

                <h2>Available Endpoints</h2>
                <table>
                    <tr><th>Method</th><th>Endpoint</th><th>Purpose</th></tr>
                    <tr><td>GET</td><td>/</td><td>API Guide</td></tr>
                    <tr><td>GET</td><td>/health</td><td>Health Check</td></tr>
                    <tr><td>GET</td><td>/api/records</td><td>Get All Records</td></tr>
                    <tr><td>GET</td><td>/api/records/:id</td><td>Get One Record</td></tr>
                    <tr><td>POST</td><td>/api/records</td><td>Create Record</td></tr>
                    <tr><td>PUT</td><td>/api/records/:id</td><td>Update Record</td></tr>
                    <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete Record</td></tr>
                </table>

                <h2>Input Fields</h2>
                <p>title, category, description and status</p>
                <p>Allowed statuses: Pending, In progress, Completed</p>

                <h2>Example JSON Body</h2>
                <pre>{
  "title": "Broken classroom computer",
  "category": "Hardware",
  "description": "The computer fails to start.",
  "status": "Pending"
}</pre>

                <h2>Response Status Codes</h2>
                <p>200: Successful request</p>
                <p>201: Record created</p>
                <p>400: Invalid input</p>
                <p>404: Record or route not found</p>
                <p>500: Server error</p>
                <p>503: Database unavailable</p>

                <p>Note: An idle hosted service may need time to start.</p>
            </main>
        </body>
        </html>
    `);
});

// Health check - checks database connection
app.get('/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();

        res.status(200).json({
            status: 'OK',
            message: 'IT Support Desk API and database are healthy'
        });
    } catch (error) {
        res.status(503).json({
            message: 'Database connection failed'
        });
    }
});

// Records API
app.use('/api/records', recordsRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Handle malformed JSON and other errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            message: 'Invalid JSON format'
        });
    }

    console.error(error);

    res.status(500).json({
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`IT Support Desk API running on port ${PORT}`);
});
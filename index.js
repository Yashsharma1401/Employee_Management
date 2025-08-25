const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Employee Management System</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                h1 { color: #333; }
                .status { background: #d4edda; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Employee Management System</h1>
                <div class="status">
                    <p>🎉 Server is running successfully!</p>
                    <p>Ready to build your employee management application.</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// API routes placeholder
app.get('/api/employees', (req, res) => {
    res.json({ message: 'Employee API endpoint ready' });
});

app.listen(PORT, () => {
    console.log(`Employee Management System running on http://localhost:${PORT}`);
});

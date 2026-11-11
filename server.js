const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 1. GET: Sabhi students ki list laane ke liye
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Search student by name ya roll_no
app.get('/api/students/search/:query', async (req, res) => {
    const { query } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM students WHERE roll_no LIKE ? OR name LIKE ?',
            [`%${query}%`, `%${query}%`]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. POST: Naya student add karne ke liye
app.post('/api/students', async (req, res) => {
    const { name, roll_no, email, course } = req.body;

    if (!name || !roll_no || !email || !course) {
        return res.status(400).json({ message: "Sabhi fields bharna zaroori hai!" });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO students (name, roll_no, email, course) VALUES (?, ?, ?, ?)',
            [name, roll_no, email, course]
        );
        res.status(201).json({ 
            message: "Student successfully add ho gaya!", 
            studentId: result.insertId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Yeh Roll Number pehle se registered hai!" });
        }
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT: Student update karne ke liye
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, roll_no, email, course } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE students SET name = ?, roll_no = ?, email = ?, course = ? WHERE id = ?',
            [name, roll_no, email, course, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student nahi mila!" });
        }

        res.status(200).json({ message: "Student details update ho gayi!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. DELETE: Student delete karne ke liye
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM students WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student nahi mila!" });
        }

        res.status(200).json({ message: "Student successfully delete ho gaya!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Server Start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

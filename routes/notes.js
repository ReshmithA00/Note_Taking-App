// routes/notes.js
const express = require('express');
const Note = require('../models/Note');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    jwt.verify(token.split(' ')[1], 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }
        req.user = decoded;
        next();
    });
});

router.post('/', async (req, res) => {
    const { title, content } = req.body;
    const note = new Note({
        userId: req.user.id,
        title,
        content
    });
    try {
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(500).send('Error creating note');
    }
});

router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id });
        res.json(notes);
    } catch (err) {
        res.status(500).send('Error fetching notes');
    }
});

router.put('/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, content },
            { new: true }
        );
        if (!note) {
            return res.status(404).send('Note not found');
        }
        res.json(note);
    } catch (err) {
        res.status(500).send('Error updating note');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!note) {
            return res.status(404).send('Note not found');
        }
        res.send('Note deleted');
    } catch (err) {
        res.status(500).send('Error deleting note');
    }
});

module.exports = router;

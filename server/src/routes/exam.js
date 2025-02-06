const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Exam = require('../models/Exam');

// Create a new exam
router.post('/', auth, authorize('examiner', 'coaching_admin'), async (req, res) => {
    try {
        const exam = new Exam({
            ...req.body,
            creator: req.user._id
        });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all exams (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.category) {
            match.category = req.query.category;
        }

        if (req.query.isPublished) {
            match.isPublished = req.query.isPublished === 'true';
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }

        const exams = await Exam.find(match)
            .sort(sort)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .populate('creator', 'username');

        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('creator', 'username')
            .populate('participants.user', 'username');

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update exam
router.patch('/:id', auth, authorize('examiner', 'coaching_admin'), async (req, res) => {
    try {
        const exam = await Exam.findOne({
            _id: req.params.id,
            creator: req.user._id
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = [
            'title', 'description', 'questions', 'duration',
            'startTime', 'endTime', 'totalMarks', 'passingMarks',
            'category', 'subCategory', 'price', 'isPublished', 'settings'
        ];

        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        updates.forEach(update => exam[update] = req.body[update]);
        await exam.save();
        res.json(exam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Submit exam
router.post('/:id/submit', auth, authorize('examinee'), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check if exam is still open
        const now = new Date();
        if (now < exam.startTime || now > exam.endTime) {
            return res.status(400).json({ error: 'Exam is not currently open' });
        }

        // Check if user has already submitted
        const existingSubmission = exam.participants.find(
            p => p.user.toString() === req.user._id.toString()
        );

        if (existingSubmission) {
            return res.status(400).json({ error: 'You have already submitted this exam' });
        }

        // Calculate score
        let score = 0;
        const answers = req.body.answers.map(answer => {
            const question = exam.questions[answer.questionId];
            const isCorrect = question.options[answer.selectedOption].isCorrect;
            const marksObtained = isCorrect ? question.marks : -question.negativeMarks;
            score += marksObtained;
            
            return {
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                marksObtained
            };
        });

        // Add submission
        exam.participants.push({
            user: req.user._id,
            score,
            submittedAt: now,
            answers
        });

        await exam.save();
        res.json({ score, answers });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get exam results
router.get('/:id/results', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('participants.user', 'username email profile');

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check if user has permission to view results
        if (req.user.role === 'examinee' && 
            exam.creator.toString() !== req.user._id.toString() &&
            !exam.participants.some(p => p.user._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const results = exam.participants.map(participant => ({
            user: participant.user,
            score: participant.score,
            submittedAt: participant.submittedAt,
            answers: participant.answers
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

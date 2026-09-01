const express = require('express');
const { body } = require('express-validator');
const {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

const habitValidation = [
  body('name').trim().notEmpty().withMessage('Habit name is required'),
  body('frequency')
    .optional()
    .isIn(['Daily', 'Weekdays', 'Weekends', 'Custom'])
    .withMessage('Invalid frequency'),
  body('goal').optional().isInt({ min: 1 }).withMessage('Goal must be a positive number'),
];

router.route('/').get(getHabits).post(habitValidation, createHabit);

router.route('/:id').get(getHabitById).put(habitValidation, updateHabit).delete(deleteHabit);

module.exports = router;

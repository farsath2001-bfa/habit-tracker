const express = require('express');
const { body } = require('express-validator');
const { upsertCompletion, getCompletions } = require('../controllers/completionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('habitId').notEmpty().withMessage('habitId is required'),
    body('date').notEmpty().withMessage('date is required'),
    body('completed').optional().isBoolean().withMessage('completed must be a boolean'),
    body('note')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Note must be 500 characters or fewer'),
  ],
  upsertCompletion
);

router.get('/', getCompletions);

module.exports = router;
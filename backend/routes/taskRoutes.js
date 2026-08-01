const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);

router.route('/')
  .get(protect, getTasks)
  .post(protect, adminOnly, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;

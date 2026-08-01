const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks (admin: all, member: assigned)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let filter = {};

    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('projectId', 'name color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'name color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'projectId', select: 'name color' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task (admin: full update, member: status only)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status of their assigned tasks
    if (req.user.role === 'member') {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      task.status = req.body.status || task.status;
    } else {
      // Admin can update all fields
      Object.assign(task, req.body);
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('projectId', 'name color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'member') filter.assignedTo = req.user._id;

    const now = new Date();
    const [total, completed, inProgress, todo, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'done' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: 'todo' }),
      Task.countDocuments({
        ...filter,
        dueDate: { $lt: now },
        status: { $ne: 'done' },
      }),
    ]);

    res.json({ total, completed, inProgress, todo, overdue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
};

import React, { useEffect, useState } from 'react';
import { fetchTasks, fetchProjects, fetchUsers, createTask, updateTask, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const STATUS_FILTERS = ['all', 'todo', 'in-progress', 'done', 'overdue'];

const PRIORITY_COLORS = {
  high: { bg: '#fee2e2', color: '#b91c1c' },
  medium: { bg: '#fef3c7', color: '#92400e' },
  low: { bg: '#dcfce7', color: '#166534' },
};

const STATUS_COLORS = {
  todo: { bg: '#f1f5f9', color: '#475569' },
  'in-progress': { bg: '#dbeafe', color: '#1d4ed8' },
  done: { bg: '#dcfce7', color: '#166534' },
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [form, setForm]           = useState({
    title: '', description: '', priority: 'medium',
    status: 'todo', dueDate: '', projectId: '', assignedTo: '',
  });

  const load = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([fetchTasks(), fetchProjects()]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      if (user?.role === 'admin') {
        const usersRes = await fetchUsers();
        setUsers(usersRes.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createTask(form);
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', projectId: '', assignedTo: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (e) { console.error(e); }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done';
    return t.status === filter;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted-soft">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 py-lg-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4">
        <div>
          <h1 className="h2 fw-bold page-title mb-1">Tasks</h1>
          <p className="text-muted-soft mb-0">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} mt-3 mt-lg-0`} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Task'}
          </button>
        )}
      </div>

      {showForm && user?.role === 'admin' && (
        <div className="card border-0 shadow-sm page-card mb-4">
          <div className="card-body p-4">
            <h3 className="h5 fw-bold mb-3">Create New Task</h3>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate} className="d-grid gap-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">Task Title</label>
                  <input type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Design homepage" required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">Project</label>
                  <select className="form-select" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                    <option value="">Select project...</option>
                    {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">Assign To</label>
                  <select className="form-select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">Due Date</label>
                  <input type="date" className="form-control" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">Priority</label>
                  <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label fw-semibold small">Description</label>
                <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task details..." />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}>
            {f === 'all' ? 'All' : f === 'todo' ? 'Todo' : f === 'in-progress' ? 'In Progress' : f === 'done' ? 'Done' : 'Overdue'}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card border-0 shadow-sm page-card text-center py-5">
          <div className="fs-1 mb-2">📭</div>
          <div className="text-muted-soft">No tasks found for this filter.</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredTasks.map((task) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task._id} className="card border-0 shadow-sm page-card list-card" style={{ borderLeft: `4px solid ${isOverdue ? '#ef4444' : task.projectId?.color || '#6366f1'}` }}>
                <div className="card-body p-4 d-flex flex-column flex-lg-row justify-content-between gap-3">
                  <div>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <div className="fw-bold">{task.title}</div>
                      <span className="badge rounded-pill px-3 py-2" style={{ background: PRIORITY_COLORS[task.priority].bg, color: PRIORITY_COLORS[task.priority].color }}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-2 text-muted-soft small">
                      {task.projectId?.name && <span>📁 {task.projectId.name}</span>}
                      {task.assignedTo?.name && <span>👤 {task.assignedTo.name}</span>}
                      {task.dueDate && <span className={isOverdue ? 'text-danger fw-semibold' : ''}>📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <select className="form-select form-select-sm" value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} style={{ minWidth: '140px' }}>
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {user?.role === 'admin' && <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(task._id)}>Delete</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
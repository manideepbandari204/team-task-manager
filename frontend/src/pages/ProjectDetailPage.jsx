import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject, fetchTasks, fetchUsers, createTask, updateTask, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const PRIORITY_COLORS = {
  high:   { bg: '#fee2e2', color: '#b91c1c' },
  medium: { bg: '#fef3c7', color: '#92400e' },
  low:    { bg: '#d1fae5', color: '#065f46' },
};

const STATUS_COLORS = {
  todo:          { bg: '#f1f5f9', color: '#475569' },
  'in-progress': { bg: '#dbeafe', color: '#1d4ed8' },
  done:          { bg: '#d1fae5', color: '#065f46' },
};

export default function ProjectDetailPage() {
  const { id }              = useParams();
  const { user }            = useAuth();
  const navigate            = useNavigate();
  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');
  const [form, setForm]         = useState({
    title: '', description: '', priority: 'medium',
    status: 'todo', dueDate: '', assignedTo: '',
  });

  const load = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        fetchProject(id),
        fetchTasks({ projectId: id }),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      if (user?.role === 'admin') {
        const usersRes = await fetchUsers();
        setUsers(usersRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createTask({ ...form, projectId: id });
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
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

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (e) { console.error(e); }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done';
    return t.status === filter;
  });

  const inputStyle = {
    padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', color: '#1e293b', background: '#f8fafc',
    outline: 'none', width: '100%', fontFamily: 'inherit',
  };

  const totalTasks     = tasks.length;
  const doneTasks      = tasks.filter((t) => t.status === 'done').length;
  const progressPct    = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8', fontSize: '15px' }}>
      ⏳ Loading project...
    </div>
  );

  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#ef4444', fontSize: '15px' }}>
      ❌ Project not found.
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        style={{
          padding: '8px 16px', background: '#f1f5f9', color: '#64748b',
          border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
          cursor: 'pointer', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}
      >
        ← Back to Projects
      </button>

      {/* Project Header */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        marginBottom: '24px', border: '1px solid #f1f5f9',
        borderTop: `5px solid ${project.color || '#6366f1'}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: project.color || '#6366f1' }} />
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{project.name}</h1>
              <span style={{ padding: '3px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700', background: '#d1fae5', color: '#065f46' }}>
                {project.status}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>{project.description || 'No description provided.'}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', background: '#f1f5f9', color: '#64748b' }}>
                👤 {project.createdBy?.name}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', background: '#f1f5f9', color: '#64748b' }}>
                🧑‍🤝‍🧑 {project.members?.length || 0} members
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', background: '#f1f5f9', color: '#64748b' }}>
                📋 {totalTasks} tasks
              </span>
            </div>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '11px 22px',
                background: showForm ? '#f1f5f9' : 'linear-gradient(135deg, #6366f1, #764ba2)',
                color: showForm ? '#64748b' : 'white',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                cursor: 'pointer', boxShadow: showForm ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              {showForm ? '✕ Cancel' : '+ Add Task'}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Progress</span>
              <span style={{ color: '#6366f1' }}>{progressPct}% ({doneTasks}/{totalTasks})</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Create Task Form */}
      {showForm && user?.role === 'admin' && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '28px',
          marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>✅ Add New Task</h3>
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Task Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Design homepage" style={inputStyle} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Assign To</label>
                <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} style={inputStyle}>
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Task details..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #764ba2)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.65 : 1, boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}>
              {saving ? '⏳ Adding...' : '✅ Add Task'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'todo', 'in-progress', 'done', 'overdue'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: '700',
            border: 'none', cursor: 'pointer',
            background: filter === f ? 'linear-gradient(135deg, #6366f1, #764ba2)' : 'white',
            color: filter === f ? 'white' : '#64748b',
            boxShadow: filter === f ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            textTransform: 'capitalize',
          }}>
            {f === 'all' ? '🗂 All' : f === 'todo' ? '📋 Todo' : f === 'in-progress' ? '🔄 In Progress' : f === 'done' ? '✅ Done' : '⚠️ Overdue'}
          </button>
        ))}
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: '#94a3b8', fontSize: '15px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div>No tasks found. {user?.role === 'admin' ? 'Add a task above.' : ''}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.map((task) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div key={task._id} style={{
                background: 'white', borderRadius: '14px', padding: '20px 24px',
                border: `1px solid ${isOverdue ? '#fecaca' : '#f1f5f9'}`,
                borderLeft: `4px solid ${isOverdue ? '#ef4444' : project.color || '#6366f1'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{task.title}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', ...PRIORITY_COLORS[task.priority] }}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px', lineHeight: '1.5' }}>{task.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {task.assignedTo?.name && (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>👤 {task.assignedTo.name}</span>
                    )}
                    {task.dueDate && (
                      <span style={{ fontSize: '12px', fontWeight: '600', color: isOverdue ? '#ef4444' : '#94a3b8' }}>
                        📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}{isOverdue && ' — Overdue!'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    style={{
                      padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', outline: 'none',
                      ...STATUS_COLORS[task.status],
                    }}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(task._id)} style={{
                      padding: '6px 12px', background: '#fee2e2', color: '#ef4444',
                      border: 'none', borderRadius: '8px', fontSize: '12px',
                      fontWeight: '700', cursor: 'pointer',
                    }}>🗑</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
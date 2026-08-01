import React, { useEffect, useState } from 'react';
import { fetchStats, fetchTasks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const badgeMap = {
  todo: { bg: '#f1f5f9', color: '#475569' },
  'in-progress': { bg: '#dbeafe', color: '#1d4ed8' },
  done: { bg: '#dcfce7', color: '#166534' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, todo: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([fetchStats(), fetchTasks()]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Tasks',  value: stats.total,      color: 'blue',  icon: '📋' },
    { label: 'Completed',    value: stats.completed,  color: 'green', icon: '✅' },
    { label: 'In Progress',  value: stats.inProgress, color: 'amber', icon: '🔄' },
    { label: 'Overdue',      value: stats.overdue,    color: 'red',   icon: '⚠️' },
  ];

  const statusBadge = (status) => {
    const style = badgeMap[status] || badgeMap.todo;
    return <span className="badge rounded-pill px-3 py-2" style={{ background: style.bg, color: style.color, fontWeight: 600 }}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted-soft">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="py-3 py-lg-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4">
        <div>
          <h1 className="h2 fw-bold page-title mb-1">Dashboard</h1>
          <p className="text-muted-soft mb-0">Welcome back, <strong>{user?.name}</strong> 👋</p>
        </div>
        <div className="text-muted-soft small mt-2 mt-lg-0">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
      </div>

      <div className="row g-3 mb-4">
        {statCards.map((s) => (
          <div key={s.label} className="col-12 col-md-6 col-xl-3">
            <div className={`card border-0 shadow-sm h-100 stat-card ${s.color === 'green' ? 'success' : s.color === 'amber' ? 'warning' : s.color === 'red' ? 'danger' : ''}`}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="display-6 fw-bold">{s.value}</div>
                    <div className="text-muted-soft small text-uppercase fw-semibold mt-2">{s.label}</div>
                  </div>
                  <div className="fs-3">{s.icon}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.total > 0 && (
        <div className="card border-0 shadow-sm mb-4 page-card">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fw-semibold">Overall Progress</div>
              <div className="fw-bold text-primary">{progressPct}%</div>
            </div>
            <div className="progress" style={{ height: '10px' }}>
              <div className="progress-bar" role="progressbar" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm page-card">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-bold mb-0">Recent Tasks</h2>
            <span className="small text-muted-soft">Latest updates</span>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-5 text-muted-soft">
              <div className="fs-1 mb-2">📭</div>
              <div>No tasks yet. Start by creating a project.</div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {recentTasks.map((task) => (
                <div key={task._id} className="d-flex justify-content-between align-items-center p-3 rounded-3 list-card" style={{ background: '#f8fafc' }}>
                  <div>
                    <div className="fw-semibold">{task.title}</div>
                    {task.projectId?.name && <div className="small text-primary mt-1">{task.projectId.name}</div>}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {task.dueDate && (
                      <span className={`small fw-semibold ${isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'text-danger' : 'text-muted-soft'}`}>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    {statusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
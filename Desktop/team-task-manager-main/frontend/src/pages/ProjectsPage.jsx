import React, { useEffect, useState } from 'react';
import { fetchProjects, createProject, deleteProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProjectsPage() {
  const { user }                = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', description: '', color: COLORS[0] });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [hovered, setHovered]   = useState(null);

  const load = async () => {
    try {
      const { data } = await fetchProjects();
      setProjects(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createProject(form);
      setForm({ name: '', description: '', color: COLORS[0] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete project and all its tasks?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted-soft">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 py-lg-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4">
        <div>
          <h1 className="h2 fw-bold page-title mb-1">Projects</h1>
          <p className="text-muted-soft mb-0">{projects.length} active project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} mt-3 mt-lg-0`} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm page-card mb-4">
          <div className="card-body p-4">
            <h3 className="h5 fw-bold mb-3">Create New Project</h3>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate} className="d-grid gap-3">
              <div>
                <label className="form-label fw-semibold small">Project Name</label>
                <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website Redesign" required />
              </div>
              <div>
                <label className="form-label fw-semibold small">Description</label>
                <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
              </div>
              <div>
                <label className="form-label fw-semibold small">Color</label>
                <div className="d-flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" className={`border-0 rounded-circle ${form.color === c ? 'border border-3 border-dark' : ''}`} style={{ width: '30px', height: '30px', background: c }} onClick={() => setForm({ ...form, color: c })} />
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card border-0 shadow-sm page-card text-center py-5">
          <div className="fs-1 mb-2">📭</div>
          <div className="text-muted-soft">
            {user?.role === 'admin' ? 'No projects yet. Create your first one above.' : 'No projects yet. Ask an admin to add you to a project.'}
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {projects.map((project) => (
            <div key={project._id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100 page-card list-card" style={{ borderTop: `4px solid ${project.color}` }} onMouseEnter={() => setHovered(project._id)} onMouseLeave={() => setHovered(null)}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="rounded-circle" style={{ width: '12px', height: '12px', background: project.color }} />
                    <h3 className="h5 fw-bold mb-0">{project.name}</h3>
                  </div>
                  <p className="text-muted-soft mb-3">{project.description || 'No description provided.'}</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge rounded-pill bg-light text-dark">👤 {project.createdBy?.name}</span>
                    <span className="badge rounded-pill bg-light text-dark">👥 {project.members?.length || 0} members</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/projects/${project._id}`} className="btn btn-outline-primary btn-sm">View Tasks</Link>
                    {user?.role === 'admin' && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(project._id)}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
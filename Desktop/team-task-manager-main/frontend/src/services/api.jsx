import axios from 'axios';

const API = axios.create({
  baseURL: 'https://team-task-manager-iuya.onrender.com/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);
export const getMyProfile  = ()     => API.get('/auth/me');

// Projects
export const fetchProjects    = ()       => API.get('/projects');
export const fetchProject     = (id)     => API.get(`/projects/${id}`);
export const createProject    = (data)   => API.post('/projects', data);
export const updateProject    = (id, d)  => API.put(`/projects/${id}`, d);
export const deleteProject    = (id)     => API.delete(`/projects/${id}`);

// Tasks
export const fetchTasks       = (params) => API.get('/tasks', { params });
export const fetchTask        = (id)     => API.get(`/tasks/${id}`);
export const createTask       = (data)   => API.post('/tasks', data);
export const updateTask       = (id, d)  => API.put(`/tasks/${id}`, d);
export const deleteTask       = (id)     => API.delete(`/tasks/${id}`);
export const fetchStats       = ()       => API.get('/tasks/stats');

// Users
export const fetchUsers = () => API.get('/users');

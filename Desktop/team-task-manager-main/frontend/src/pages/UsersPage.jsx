import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../services/api';

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchUsers();
        setUsers(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
  const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length] || '#6366f1';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#94a3b8', fontSize: '15px' }}>
      ⏳ Loading users...
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Users</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              padding: '10px 14px 10px 38px',
              border: '1.5px solid #e2e8f0', borderRadius: '10px',
              fontSize: '14px', color: '#1e293b', background: 'white',
              outline: 'none', width: '240px',
            }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Users',   value: users.length,                                         color: '#6366f1', icon: '👥' },
          { label: 'Admins',        value: users.filter((u) => u.role === 'admin').length,       color: '#f59e0b', icon: '👑' },
          { label: 'Members',       value: users.filter((u) => u.role === 'member').length,      color: '#10b981', icon: '👤' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'white', borderRadius: '14px', padding: '20px',
            border: '1px solid #f1f5f9', borderTop: `4px solid ${stat.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: '#94a3b8', fontSize: '15px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div>No users found matching your search.</div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
            padding: '14px 24px', background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
          }}>
            {['User', 'Email', 'Role', 'Joined'].map((h) => (
              <div key={h} style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

          {/* Table Rows */}
          {filtered.map((u, i) => (
            <div
              key={u._id}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
                padding: '16px 24px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              {/* Name + Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: getAvatarColor(u.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '14px', color: 'white', flexShrink: 0,
                }}>
                  {getInitials(u.name)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{u.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>ID: {u._id.slice(-6)}</div>
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: '14px', color: '#64748b' }}>{u.email}</div>

              {/* Role Badge */}
              <div>
                <span style={{
                  padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700',
                  background: u.role === 'admin' ? '#fef3c7' : '#dbeafe',
                  color: u.role === 'admin' ? '#92400e' : '#1d4ed8',
                  textTransform: 'capitalize',
                }}>
                  {u.role === 'admin' ? '👑 Admin' : '👤 Member'}
                </span>
              </div>

              {/* Joined Date */}
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
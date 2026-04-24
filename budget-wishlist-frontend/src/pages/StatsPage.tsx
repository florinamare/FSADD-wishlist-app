import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { statsApi } from '../api/WishlistApi';
import type { StatsData } from '../types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#E24B4A',
  medium: '#EF9F27',
  low: '#639922',
};

function SkeletonBlock({ height = 200 }: { height?: number }) {
  return <div className="skeleton" style={{ height, borderRadius: 12, marginBottom: 16 }} />;
}

export function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const spentData = stats?.spentPerMonth.map((m) => ({
    name: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
    spent: m.totalSpent,
    count: m.count,
  })) ?? [];

  const priorityData = stats?.itemsByPriority.map((p) => ({
    name: p._id,
    total: p.count,
    purchased: p.purchasedCount,
    value: p.totalValue,
  })) ?? [];

  const pieData = priorityData.map((p) => ({ name: p.name, value: p.total }));

  return (
    <main className="app">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button className="btn-edit-budget" onClick={() => navigate('/')}>← back</button>
        <span className="section-label" style={{ margin: 0 }}>statistics</span>
      </div>

      {loading && (
        <>
          <SkeletonBlock height={80} />
          <SkeletonBlock height={220} />
          <SkeletonBlock height={220} />
        </>
      )}

      {error && !loading && (
        <p className="state-msg">Failed to load stats.</p>
      )}

      {stats && !loading && (
        <>
          {/* Summary cards */}
          <div className="stats-summary-grid">
            <div className="stats-card">
              <span className="stats-card-value">{stats.summary.totalItems}</span>
              <span className="stats-card-label">total wishes</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-value" style={{ color: '#639922' }}>{stats.summary.purchasedItems}</span>
              <span className="stats-card-label">purchased</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-value" style={{ color: '#EF9F27' }}>{stats.summary.pendingItems}</span>
              <span className="stats-card-label">pending</span>
            </div>
            <div className="stats-card">
              <span className="stats-card-value">{stats.summary.activeFriends}</span>
              <span className="stats-card-label">active friends</span>
            </div>
          </div>

          {/* Spending over time */}
          {spentData.length > 0 && (
            <div className="stats-chart-box">
              <p className="stats-chart-title">spending last 6 months (RON)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={spentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                    formatter={(v) => [`${Number(v).toFixed(0)} RON`, 'spent']}
                  />
                  <Line type="monotone" dataKey="spent" stroke="#185FA5" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Items by priority bar chart */}
          {priorityData.length > 0 && (
            <div className="stats-chart-box">
              <p className="stats-chart-title">items by priority</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  />
                  <Bar dataKey="total" name="total" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#999'} />
                    ))}
                  </Bar>
                  <Bar dataKey="purchased" name="purchased" fill="#185FA5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie chart distribution */}
          {pieData.length > 0 && (
            <div className="stats-chart-box">
              <p className="stats-chart-title">priority distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#999'} />
                    ))}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ color: 'var(--color-text)', fontSize: 13 }}>{v}</span>} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </main>
  );
}

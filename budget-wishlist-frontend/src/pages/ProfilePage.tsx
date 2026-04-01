import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, wishlistApi } from '../api/WishlistApi';
import type { UserProfile } from '../api/WishlistApi';
import type { WishlistItem } from '../types';
import { formatCurrency, getItemSpent, getFieldLabel, getFieldIcon } from '../utils/BugetUtils';

// ─── Insights helpers ─────────────────────────────────────────

function computeInsights(items: WishlistItem[]) {
  let totalSpent = 0;
  let giftedCount = 0;
  const categorySpending: Record<string, number> = {};

  for (const item of items) {
    const spent = getItemSpent(item);
    totalSpent += spent;

    if (item.boughtBy) giftedCount++;

    if (item.breakdown) {
      for (const b of item.breakdown) {
        if (b.purchased) {
          categorySpending[b.key] = (categorySpending[b.key] || 0) + b.amount;
        }
      }
    } else if (item.purchased) {
      categorySpending['other'] = (categorySpending['other'] || 0) + item.price;
    }
  }

  return { totalSpent, giftedCount, categorySpending };
}

// ─── Bar Chart ────────────────────────────────────────────────

function CategoryChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="state-msg">no spending data yet</p>;

  const max = entries[0][1];

  return (
    <div className="profile-chart">
      {entries.map(([key, amount]) => {
        const pct = max > 0 ? (amount / max) * 100 : 0;
        const label = key === 'other' ? 'Other' : getFieldLabel(key);
        const icon = key === 'other' ? '•' : getFieldIcon(key);
        return (
          <div key={key} className="chart-row">
            <div className="chart-label">
              <span className="chart-icon">{icon}</span>
              <span>{label}</span>
            </div>
            <div className="chart-bar-wrap">
              <div className="chart-bar" style={{ width: `${pct}%` }} />
            </div>
            <span className="chart-amount">{formatCurrency(amount)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Password Change Form ─────────────────────────────────────

function PasswordForm({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await profileApi.updatePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <p className="profile-pw-success">Password updated successfully.</p>;
  }

  return (
    <form className="profile-pw-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Current password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <div className="field">
        <label>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="field">
        <label>Confirm new password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="profile-pw-actions">
        <button type="button" className="btn-edit-budget" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-add" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ─── Profile Page ─────────────────────────────────────────────

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPwForm, setShowPwForm] = useState(false);

  useEffect(() => {
    Promise.all([profileApi.get(), wishlistApi.getItems()])
      .then(([p, it]) => {
        setProfile(p);
        setItems(it);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="app"><p className="state-msg">loading…</p></main>;

  const initials = profile
    ? profile.username.slice(0, 2).toUpperCase()
    : '??';

  const { totalSpent, giftedCount, categorySpending } = computeInsights(items);

  return (
    <main className="app">
      <div className="page-nav">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← înapoi
        </button>
      </div>

      {/* ─── Profile Card ─── */}
      <div className="profile-card">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <span className="profile-username">{profile?.username}</span>
          <span className="profile-email">{profile?.email}</span>
        </div>
        <button
          className="btn-edit-budget"
          onClick={() => setShowPwForm((p) => !p)}
        >
          {showPwForm ? 'Cancel' : 'Change password'}
        </button>
      </div>

      {showPwForm && (
        <div className="profile-pw-wrap">
          <PasswordForm onClose={() => setShowPwForm(false)} />
        </div>
      )}

      {/* ─── Insights ─── */}
      <section className="profile-insights">
        <span className="section-label">insights</span>

        <div className="budget-stats-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="budget-stat">
            <span className="budget-stat-label">total spent</span>
            <span className="budget-stat-value">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">items gifted</span>
            <span className="budget-stat-value">{giftedCount}</span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat-label">wishlist items</span>
            <span className="budget-stat-value">{items.length}</span>
          </div>
        </div>

        <span className="section-label">spending by category</span>
        <div className="profile-chart-card">
          <CategoryChart data={categorySpending} />
        </div>
      </section>
    </main>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/WishlistApi';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, updateUsername } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState('');
  const [usernameMsg, setUsernameMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    profileApi.get()
      .then((data) => {
        setUsername(data.username);
        setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  const handleUpdateUsername = async () => {
    const trimmed = username.trim();
    if (!trimmed || trimmed === user?.username) return;
    setUsernameLoading(true);
    setUsernameMsg(null);
    try {
      const data = await profileApi.updateUsername(trimmed);
      updateUsername(data.username);
      setUsernameMsg({ text: 'Username actualizat cu succes!', ok: true });
    } catch (e: unknown) {
      setUsernameMsg({
        text: e instanceof Error ? e.message : 'Eroare la actualizarea username-ului.',
        ok: false,
      });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordMsg({ text: 'Completează ambele câmpuri.', ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Parolele noi nu se potrivesc.', ok: false });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Parola nouă trebuie să aibă minim 6 caractere.', ok: false });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await profileApi.updatePassword(oldPassword, newPassword);
      setPasswordMsg({ text: 'Parola a fost schimbată cu succes!', ok: true });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      setPasswordMsg({
        text: e instanceof Error ? e.message : 'Eroare la schimbarea parolei.',
        ok: false,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="app">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button className="btn-edit-budget" onClick={() => navigate('/')}>← înapoi</button>
        <span className="section-label" style={{ margin: 0 }}>profil</span>
      </div>

      {/* Username */}
      <div className="profile-card">
        <span className="section-label">cont</span>
        {email && (
          <p className="profile-email">{email}</p>
        )}
        <div className="field" style={{ marginTop: 10 }}>
          <label>username</label>
          <div className="field-row">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameMsg(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
            />
            <button
              className="btn-confirm confirm-add"
              onClick={handleUpdateUsername}
              disabled={usernameLoading || !username.trim() || username.trim() === user?.username}
            >
              {usernameLoading ? '...' : 'salvează'}
            </button>
          </div>
          {usernameMsg && (
            <p className={`profile-msg ${usernameMsg.ok ? 'profile-msg-ok' : 'profile-msg-err'}`}>
              {usernameMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="profile-card">
        <span className="section-label">schimbă parola</span>
        <div className="field" style={{ marginTop: 10 }}>
          <label>parola curentă</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => { setOldPassword(e.target.value); setPasswordMsg(null); }}
            autoComplete="current-password"
          />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>parola nouă</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null); }}
            autoComplete="new-password"
          />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>confirmă parola nouă</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(null); }}
            autoComplete="new-password"
            onKeyDown={(e) => e.key === 'Enter' && handleUpdatePassword()}
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <button
            className="btn-confirm confirm-add"
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'se actualizează...' : 'actualizează parola'}
          </button>
        </div>
        {passwordMsg && (
          <p className={`profile-msg ${passwordMsg.ok ? 'profile-msg-ok' : 'profile-msg-err'}`}>
            {passwordMsg.text}
          </p>
        )}
      </div>
    </main>
  );
}

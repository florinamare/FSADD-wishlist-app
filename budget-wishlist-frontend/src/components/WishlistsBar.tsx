import { useState, useEffect } from 'react';
import { wishlistsApi } from '../api/WishlistApi';
import type { Wishlist } from '../types';

interface Props {
  activeId: string | undefined;
  onChange: (id: string | undefined) => void;
}

export function WishlistsBar({ activeId, onChange }: Props) {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    wishlistsApi.getAll().then(setWishlists).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const w = await wishlistsApi.create(newName.trim());
      setWishlists((prev) => [...prev, w]);
      onChange(w._id);
      setNewName('');
      setCreating(false);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this wishlist and all its items?')) return;
    try {
      await wishlistsApi.delete(id);
      setWishlists((prev) => prev.filter((w) => w._id !== id));
      if (activeId === id) onChange(undefined);
    } catch {
      // ignore
    }
  };

  return (
    <div className="wishlists-bar">
      <button
        className={`wl-tab${!activeId ? ' wl-tab-active' : ''}`}
        onClick={() => onChange(undefined)}
      >
        all
      </button>
      {wishlists.map((w) => (
        <button
          key={w._id}
          className={`wl-tab${activeId === w._id ? ' wl-tab-active' : ''}`}
          onClick={() => onChange(w._id)}
        >
          {w.name}
          {!w.isDefault && (
            <span
              className="wl-tab-del"
              role="button"
              onClick={(e) => handleDelete(w._id, e)}
              title="Delete wishlist"
            >
              ✕
            </span>
          )}
        </button>
      ))}

      {creating ? (
        <div className="wl-create-row">
          <input
            className="wl-create-input"
            autoFocus
            placeholder="wishlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setCreating(false); setNewName(''); }
            }}
          />
          <button className="wl-create-btn" onClick={handleCreate} disabled={loading}>
            {loading ? '...' : 'add'}
          </button>
          <button className="wl-create-cancel" onClick={() => { setCreating(false); setNewName(''); }}>
            ✕
          </button>
        </div>
      ) : (
        <button className="wl-tab wl-tab-new" onClick={() => setCreating(true)}>
          + new
        </button>
      )}
    </div>
  );
}

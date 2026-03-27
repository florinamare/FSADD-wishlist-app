import { useState } from 'react';
import { NewWishlistItem, Priority, BreakdownItem } from '../types';
import { BD_LABELS } from '../utils/BugetUtils';

interface Props {
  onAdd: (item: NewWishlistItem) => Promise<void>;
}

const BREAKDOWN_KEYS = ['accommodation', 'flights', 'food', 'activities'] as const;

export const AddItemForm = ({ onAdd }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [hasBreakdown, setHasBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<Record<string, string>>({
    accommodation: '', flights: '', food: '', activities: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !price || parseFloat(price) <= 0) return;

    let parsedBreakdown: BreakdownItem[] | null = null;
    if (hasBreakdown) {
      const rows = BREAKDOWN_KEYS
        .map((key) => ({ key, amount: parseFloat(breakdown[key]) || 0, purchased: false }))
        .filter((b) => b.amount > 0);
      if (rows.length > 0) parsedBreakdown = rows;
    }

    try {
      setLoading(true);
      await onAdd({
        name: name.trim(),
        price: parseFloat(price),
        priority,
        breakdown: parsedBreakdown,
      });
      setName('');
      setPrice('');
      setPriority('medium');
      setHasBreakdown(false);
      setBreakdown({ accommodation: '', flights: '', food: '', activities: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <div className="form-main-row">
        <div className="field">
          <label>nume item</label>
          <input
            type="text"
            placeholder="ex: Vacanță Tokyo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field" style={{ maxWidth: 110 }}>
          <label>preț (RON)</label>
          <input
            type="number"
            placeholder="1200"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="field" style={{ maxWidth: 110 }}>
          <label>prioritate</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="high">înaltă</option>
            <option value="medium">medie</option>
            <option value="low">scăzută</option>
          </select>
        </div>
      </div>

      <div className="form-bottom-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={hasBreakdown}
            onChange={(e) => setHasBreakdown(e.target.checked)}
          />
          item complex (cu breakdown)
        </label>
        <button className="btn-add" onClick={handleSubmit} disabled={loading}>
          {loading ? 'se adaugă...' : '+ adaugă ↗'}
        </button>
      </div>

      {hasBreakdown && (
        <div className="breakdown-grid">
          {BREAKDOWN_KEYS.map((key) => (
            <div className="field" key={key}>
              <label>{BD_LABELS[key]} (RON)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={breakdown[key]}
                onChange={(e) => setBreakdown((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
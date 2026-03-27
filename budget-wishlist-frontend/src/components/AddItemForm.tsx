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

  const breakdownTotal = BREAKDOWN_KEYS.reduce(
    (sum, key) => sum + (parseFloat(breakdown[key]) || 0),
    0
  );

  const effectivePrice = hasBreakdown ? breakdownTotal : parseFloat(price);

  const handleSubmit = async () => {
    if (!name.trim() || effectivePrice <= 0) return;

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
        price: effectivePrice,
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
          <label>item name</label>
          <input
            type="text"
            placeholder="e.g. Tokyo Vacation"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field" style={{ maxWidth: 110 }}>
          <label>price (RON)</label>
          <input
            type="number"
            placeholder="1200"
            min="0"
            value={hasBreakdown ? (breakdownTotal > 0 ? breakdownTotal : '') : price}
            onChange={(e) => { if (!hasBreakdown) setPrice(e.target.value); }}
            readOnly={hasBreakdown}
            style={hasBreakdown ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          />
        </div>
        <div className="field" style={{ maxWidth: 110 }}>
          <label>priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
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
          complex item (with breakdown)
        </label>
        <button className="btn-add" onClick={handleSubmit} disabled={loading}>
          {loading ? 'adding...' : '+ add ↗'}
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
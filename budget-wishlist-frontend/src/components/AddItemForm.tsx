import { useState } from 'react';
import { NewWishlistItem, Priority, BreakdownItem } from '../types';
import { CATEGORY_TEMPLATES, CategoryType } from '../utils/BugetUtils';

interface Props {
  onAdd: (item: NewWishlistItem) => Promise<void>;
}

interface CustomField {
  id: string;
  label: string;
  amount: string;
}

export const AddItemForm = ({ onAdd }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const template = category && category !== 'custom' ? CATEGORY_TEMPLATES[category] : null;

  const breakdownTotal = template
    ? template.fields.reduce((sum, f) => sum + (parseFloat(breakdown[f.key]) || 0), 0)
    : customFields.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

  const effectivePrice = category ? breakdownTotal : parseFloat(price);

  const handleCategorySelect = (cat: CategoryType) => {
    setCategory((prev) => (prev === cat ? null : cat));
    setBreakdown({});
    setCustomFields([]);
  };

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      { id: Date.now().toString(), label: newFieldLabel.trim(), amount: '' },
    ]);
    setNewFieldLabel('');
  };

  const handleSubmit = async () => {
    if (!name.trim() || effectivePrice <= 0) return;

    let parsedBreakdown: BreakdownItem[] | null = null;

    if (template) {
      const rows = template.fields
        .map((f) => ({ key: f.key, amount: parseFloat(breakdown[f.key]) || 0, purchased: false }))
        .filter((b) => b.amount > 0);
      if (rows.length > 0) parsedBreakdown = rows;
    } else if (category === 'custom') {
      const rows = customFields
        .filter((f) => parseFloat(f.amount) > 0)
        .map((f) => ({
          key: f.label.toLowerCase().replace(/\s+/g, '_'),
          amount: parseFloat(f.amount),
          purchased: false,
        }));
      if (rows.length > 0) parsedBreakdown = rows;
    }

    try {
      setLoading(true);
      await onAdd({ name: name.trim(), price: effectivePrice, priority, breakdown: parsedBreakdown });
      setName('');
      setPrice('');
      setPriority('medium');
      setCategory(null);
      setBreakdown({});
      setCustomFields([]);
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
            value={category ? (breakdownTotal > 0 ? breakdownTotal : '') : price}
            onChange={(e) => { if (!category) setPrice(e.target.value); }}
            readOnly={!!category}
            style={category ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
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
        <div className="category-toggles">
          {(Object.keys(CATEGORY_TEMPLATES) as CategoryType[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn-category ${category === cat ? 'btn-category-active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {CATEGORY_TEMPLATES[cat].icon} {CATEGORY_TEMPLATES[cat].label}
            </button>
          ))}
        </div>
        <button className="btn-add" onClick={handleSubmit} disabled={loading}>
          {loading ? 'adding...' : '+ add ↗'}
        </button>
      </div>

      {template && (
        <div className="breakdown-grid">
          {template.fields.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.icon} {f.label} (RON)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={breakdown[f.key] || ''}
                onChange={(e) => setBreakdown((prev) => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}

      {category === 'custom' && (
        <div className="breakdown-grid">
          {customFields.map((f) => (
            <div className="field" key={f.id}>
              <label>{f.label} (RON)</label>
              <div className="field-row">
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={f.amount}
                  onChange={(e) =>
                    setCustomFields((prev) =>
                      prev.map((x) => (x.id === f.id ? { ...x, amount: e.target.value } : x))
                    )
                  }
                />
                <button
                  className="btn-field-remove"
                  onClick={() => setCustomFields((prev) => prev.filter((x) => x.id !== f.id))}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <div className="field">
            <label>new field</label>
            <div className="field-row">
              <input
                type="text"
                placeholder="e.g. transport"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
              />
              <button className="btn-field-add" onClick={addCustomField}>+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

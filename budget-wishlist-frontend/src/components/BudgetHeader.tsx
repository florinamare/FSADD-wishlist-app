import { useState } from 'react';
import { AdjustType, BudgetAdjustment } from '../types';
import { formatCurrency } from '../utils/BugetUtils';

interface Props {
  budget: number;
  totalSpent: number;
  remaining: number;
  budgetHistory: BudgetAdjustment[];
  onAdjust: (type: AdjustType, amount: number, note?: string) => void;
}

export const BudgetHeader = ({ budget, totalSpent, remaining, budgetHistory, onAdjust }: Props) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<AdjustType>('add');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const pct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
  const progressColor = pct > 85 ? 'red' : pct > 60 ? 'yellow' : 'green';
  const remainingColor = remaining < 0 ? 'red' : remaining < budget * 0.3 ? 'yellow' : 'green';

  const handleAdjust = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Introdu o sumă validă.');
      return;
    }
    if (adjustType === 'subtract' && value > budget) {
      setError('Nu poți scoate mai mult decât bugetul total.');
      return;
    }
    onAdjust(adjustType, value, note.trim() || undefined);
    setAmount('');
    setNote('');
    setError('');
  };

  return (
    <div className="budget-header">
      <div className="budget-title-row">
        <span className="budget-title">✦ budget wishlist</span>
        <button className="btn-edit-budget" onClick={() => setPanelOpen((p) => !p)}>
          {panelOpen ? '✕ închide' : '✎ ajustează buget'}
        </button>
      </div>

      <div className="budget-stats-grid">
        <div className="budget-stat">
          <span className="budget-stat-label">buget total</span>
          <span className="budget-stat-value">{formatCurrency(budget)}</span>
        </div>
        <div className="budget-stat">
          <span className="budget-stat-label">cheltuit</span>
          <span className="budget-stat-value">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="budget-stat">
          <span className="budget-stat-label">rămas</span>
          <span className={`budget-stat-value ${remainingColor}`}>{formatCurrency(remaining)}</span>
        </div>
      </div>

      <div className="progress-wrap">
        <div className={`progress-bar ${progressColor}`} style={{ width: `${pct}%` }} />
      </div>

      {panelOpen && (
        <div className="adjust-panel">
          <span className="adjust-label">sumă de ajustat</span>
          <div className="adjust-row">
            <div className="type-toggle">
              <button
                className={adjustType === 'add' ? 'active-add' : ''}
                onClick={() => setAdjustType('add')}
              >
                + adaugă
              </button>
              <button
                className={adjustType === 'subtract' ? 'active-sub' : ''}
                onClick={() => setAdjustType('subtract')}
              >
                − scoate
              </button>
            </div>
            <input
              className={`adjust-input ${adjustType === 'add' ? 'input-green' : 'input-red'}`}
              type="number"
              placeholder="ex: 500"
              min="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
            />
            <input
              className="adjust-input"
              type="text"
              placeholder="motiv (opțional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ maxWidth: 140 }}
            />
            <button
              className={`btn-confirm ${adjustType === 'add' ? 'confirm-add' : 'confirm-sub'}`}
              onClick={handleAdjust}
            >
              aplică ↗
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}

          {budgetHistory.length > 0 && (
            <div className="history-list">
              {[...budgetHistory].reverse().map((h, i) => (
                <div key={i} className="history-entry">
                  <span className="history-note">
                    {h.note || (h.type === 'add' ? 'buget adăugat' : 'buget retras')}
                  </span>
                  <span className={`history-amount ${h.type === 'add' ? 'history-add' : 'history-sub'}`}>
                    {h.type === 'add' ? '+' : '−'}{formatCurrency(h.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
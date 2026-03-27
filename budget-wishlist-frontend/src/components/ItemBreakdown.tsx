import { BreakdownItem } from '../types';
import { BD_ICONS, BD_LABELS, formatCurrency } from '../utils/BugetUtils';

interface Props {
  breakdown: BreakdownItem[];
  onToggle: (key: string) => void;
}

export const ItemBreakdown = ({ breakdown, onToggle }: Props) => {
  const total = breakdown.reduce((s, b) => s + b.amount, 0);
  const paid = breakdown.reduce((s, b) => s + (b.purchased ? b.amount : 0), 0);
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="breakdown-panel">
      {breakdown.map((b) => (
        <div key={b.key} className="breakdown-row">
          <button
            className={`bd-check ${b.purchased ? 'bd-check-done' : ''}`}
            onClick={() => onToggle(b.key)}
            aria-label={`Mark ${BD_LABELS[b.key]} as ${b.purchased ? 'unpaid' : 'paid'}`}
          >
            {b.purchased && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1.5,5 4,7.5 8.5,2.5" />
              </svg>
            )}
          </button>
          <span className="bd-icon">{BD_ICONS[b.key]}</span>
          <span className={`bd-label ${b.purchased ? 'bd-done' : ''}`}>
            {BD_LABELS[b.key]}
          </span>
          <span className={`bd-amount ${b.purchased ? 'bd-done' : ''}`}>
            {formatCurrency(b.amount)}
          </span>
        </div>
      ))}

      <div className="bd-progress">
        <div className="bd-progress-meta">
          <span>{pct}% paid</span>
          <span>{formatCurrency(paid)} of {formatCurrency(total)}</span>
        </div>
        <div className="bd-progress-bar-wrap">
          <div className="bd-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { WishlistItem as IWishlistItem } from '../types';
import { formatCurrency, getItemHighlight, getItemPurchasedState, getItemSpent } from '../utils/BugetUtils';
import { ItemBreakdown } from './ItemBreakdown';

interface Props {
  item: IWishlistItem;
  remainingBudget: number;
  onToggle: (id: string) => void;
  onToggleBreakdown: (itemId: string, key: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_LABEL: Record<string, string> = {
  high: 'înaltă',
  medium: 'medie',
  low: 'scăzută',
};

export const WishlistItem = ({ item, remainingBudget, onToggle, onToggleBreakdown, onDelete }: Props) => {
  const [showBreakdown, setShowBreakdown] = useState(!!item.breakdown);

  const state = getItemPurchasedState(item);
  const highlight = getItemHighlight(item, remainingBudget);
  const spent = getItemSpent(item);
  const remaining = item.price - spent;

  return (
    <div className={`item-card highlight-${highlight} ${state === 'full' ? 'fully-done' : ''}`}>
      <div className="item-top">
        <button
          className={`check-btn ${state === 'full' ? 'check-done' : ''}`}
          onClick={() => onToggle(item._id)}
          aria-label={`Marchează ${item.name}`}
        >
          {state === 'full' && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1.5,5 4,7.5 8.5,2.5" />
            </svg>
          )}
        </button>

        <div className={`item-dot dot-${highlight}`} />

        <div className="item-info">
          <div className={`item-name ${state === 'full' ? 'item-name-done' : ''}`}>
            {item.name}
          </div>
          <div className="item-meta">
            <span className={`badge badge-${item.priority}`}>
              {PRIORITY_LABEL[item.priority]}
            </span>
            {state === 'partial' && (
              <span className="badge badge-partial">parțial achitat</span>
            )}
            {item.breakdown && (
              <button className="toggle-link" onClick={() => setShowBreakdown((p) => !p)}>
                {showBreakdown ? '▲ ascunde' : '▼ detalii'}
              </button>
            )}
          </div>
        </div>

        <div className="item-price-col">
          {state === 'partial' ? (
            <>
              <div className="price-paid">
                {formatCurrency(spent)} <span className="price-paid-label">plătit</span>
              </div>
              <div className="price-remaining">{formatCurrency(remaining)} rămas</div>
            </>
          ) : (
            <div className={`item-price ${state === 'full' ? 'price-done' : ''}`}>
              {formatCurrency(item.price)}
            </div>
          )}
        </div>

        <button className="btn-delete" onClick={() => onDelete(item._id)} aria-label="Șterge">
          ✕
        </button>
      </div>

      {item.breakdown && showBreakdown && (
        <ItemBreakdown
          breakdown={item.breakdown}
          onToggle={(key) => onToggleBreakdown(item._id, key)}
        />
      )}
    </div>
  );
};
import { useState, useRef } from 'react';
import { WishlistItem as IWishlistItem } from '../types';
import { formatCurrency, getItemHighlight, getItemPurchasedState, getItemSpent } from '../utils/BugetUtils';
import { ItemBreakdown } from './ItemBreakdown';
import { wishlistApi } from '../api/WishlistApi';

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3000';

interface Props {
  item: IWishlistItem;
  remainingBudget: number;
  onToggle: (id: string) => void;
  onToggleBreakdown: (itemId: string, key: string) => void;
  onDelete: (id: string) => void;
  onImageUploaded: (id: string, imageUrl: string) => void;
}

const PRIORITY_LABEL: Record<string, string> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

export const WishlistItem = ({ item, remainingBudget, onToggle, onToggleBreakdown, onDelete, onImageUploaded }: Props) => {
  const [showBreakdown, setShowBreakdown] = useState(!!item.breakdown);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const state = getItemPurchasedState(item);
  const highlight = getItemHighlight(item, remainingBudget);
  const spent = getItemSpent(item);
  const remaining = item.price - spent;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await wishlistApi.uploadImage(item._id, file);
      if (updated.imageUrl) onImageUploaded(item._id, updated.imageUrl);
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const imageUrl = item.imageUrl
    ? item.imageUrl.startsWith('http')
      ? item.imageUrl
      : `${BASE_URL}${item.imageUrl}`
    : null;

  return (
    <div className={`item-card highlight-${highlight} ${state === 'full' ? 'fully-done' : ''}`}>
      <div className="item-top">
        <button
          className={`check-btn ${state === 'full' ? 'check-done' : ''}`}
          onClick={() => onToggle(item._id)}
          aria-label={`Mark ${item.name}`}
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
              <span className="badge badge-partial">partially paid</span>
            )}
            {item.breakdown && (
              <button className="toggle-link" onClick={() => setShowBreakdown((p) => !p)}>
                {showBreakdown ? '▲ hide' : '▼ details'}
              </button>
            )}
          </div>
        </div>

        <div className="item-price-col">
          {state === 'partial' ? (
            <>
              <div className="price-paid">
                {formatCurrency(spent)} <span className="price-paid-label">paid</span>
              </div>
              <div className="price-remaining">{formatCurrency(remaining)} left</div>
            </>
          ) : (
            <div className={`item-price ${state === 'full' ? 'price-done' : ''}`}>
              {formatCurrency(item.price)}
            </div>
          )}
        </div>

        {/* Image upload button */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id={`img-${item._id}`}
          onChange={handleImageUpload}
        />
        <label
          htmlFor={`img-${item._id}`}
          className="btn-img-upload"
          title={uploading ? 'uploading...' : 'Upload image'}
          style={{ opacity: uploading ? 0.5 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          {imageUrl ? '🖼' : '📷'}
        </label>

        <button className="btn-delete" onClick={() => onDelete(item._id)} aria-label="Delete">
          ✕
        </button>
      </div>

      {imageUrl && (
        <div className="item-image-wrap">
          <img src={imageUrl} alt={item.name} className="item-image" />
        </div>
      )}

      {item.breakdown && showBreakdown && (
        <ItemBreakdown
          breakdown={item.breakdown}
          onToggle={(key) => onToggleBreakdown(item._id, key)}
        />
      )}
    </div>
  );
};

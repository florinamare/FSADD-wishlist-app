import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sharedApi, friendsApi } from '../api/WishlistApi';
import { useAuth } from '../context/AuthContext';
import { WishlistItem } from '../types';
import { formatCurrency, getItemPurchasedState, getItemSpent, getFieldIcon, getFieldLabel } from '../utils/BugetUtils';

export function SharedPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { isAuthenticated, user } = useAuth();

  const [username, setUsername] = useState('');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // whole-item buy state
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState<Record<string, string>>({});
  const [showBuyerInput, setShowBuyerInput] = useState<string | null>(null);

  // breakdown buy state
  const [pendingBreakdown, setPendingBreakdown] = useState<string | null>(null); // "itemId:key"

  // add friend state
  const [friendAdded, setFriendAdded] = useState(false);
  const [friendPending, setFriendPending] = useState(false);

  const isOwnWishlist = isAuthenticated && user?.shareToken === shareToken;

  useEffect(() => {
    if (!shareToken) return;
    sharedApi.getWishlist(shareToken)
      .then((data) => {
        setUsername(data.username);
        setItems(data.items);
      })
      .catch(() => setError('Wishlist-ul nu a fost găsit.'))
      .finally(() => setIsLoading(false));
  }, [shareToken]);

  const handleAddFriend = async () => {
    if (!shareToken || friendPending) return;
    setFriendPending(true);
    try {
      await friendsApi.addFriend(shareToken);
      setFriendAdded(true);
    } catch {
      setError('Nu s-a putut adăuga prietenul.');
    } finally {
      setFriendPending(false);
    }
  };

  const handleToggle = async (item: WishlistItem) => {
    if (!shareToken || pendingId) return;
    if (!item.purchased) {
      setShowBuyerInput(item._id);
      return;
    }
    setPendingId(item._id);
    try {
      const updated = await sharedApi.updateItem(shareToken, item._id, false);
      setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    } catch {
      setError('Nu s-a putut actualiza itemul.');
    } finally {
      setPendingId(null);
    }
  };

  const handleConfirmBuy = async (item: WishlistItem) => {
    if (!shareToken || pendingId) return;
    setPendingId(item._id);
    setShowBuyerInput(null);
    try {
      const name = buyerName[item._id]?.trim() || undefined;
      const updated = await sharedApi.updateItem(shareToken, item._id, true, name);
      setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    } catch {
      setError('Nu s-a putut actualiza itemul.');
    } finally {
      setPendingId(null);
      setBuyerName((prev) => { const n = { ...prev }; delete n[item._id]; return n; });
    }
  };

  const handleToggleBreakdown = async (item: WishlistItem, key: string) => {
    if (!shareToken) return;
    const bdKey = `${item._id}:${key}`;
    if (pendingBreakdown === bdKey) return;
    const bd = item.breakdown?.find((b) => b.key === key);
    if (!bd) return;

    setPendingBreakdown(bdKey);
    try {
      const updated = await sharedApi.updateBreakdownItem(shareToken, item._id, key, !bd.purchased);
      setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    } catch {
      setError('Nu s-a putut actualiza elementul.');
    } finally {
      setPendingBreakdown(null);
    }
  };

  if (isLoading) {
    return <main className="app"><p className="state-msg">se încarcă...</p></main>;
  }

  if (error && items.length === 0) {
    return <main className="app"><p className="state-msg error">{error}</p></main>;
  }

  return (
    <main className="app">
      <div className="shared-header">
        <span className="budget-title">✦ wishlist</span>
        <span className="shared-owner">al lui {username}</span>
        {isAuthenticated && !isOwnWishlist && (
          <button
            className={`btn-add-friend ${friendAdded ? 'btn-add-friend-done' : ''}`}
            onClick={handleAddFriend}
            disabled={friendAdded || friendPending}
          >
            {friendAdded ? '✓ prieten adăugat' : '+ adaugă prieten'}
          </button>
        )}
      </div>

      {error && <p className="state-msg error" style={{ marginBottom: '0.75rem' }}>{error}</p>}

      <section>
        <span className="section-label">dorințe</span>

        {items.length === 0 && (
          <p className="state-msg">nicio dorință adăugată</p>
        )}

        {items.map((item) => {
          const state = getItemPurchasedState(item);
          const spent = getItemSpent(item);
          const remaining = item.price - spent;
          const isWaiting = showBuyerInput === item._id;
          const hasBreakdown = Array.isArray(item.breakdown) && item.breakdown.length > 0;

          return (
            <div
              key={item._id}
              className={`item-card highlight-${state === 'full' ? 'green' : 'red'} ${state === 'full' ? 'fully-done' : ''}`}
            >
              <div className="item-top">
                {!hasBreakdown && (
                  <button
                    className={`check-btn ${state === 'full' ? 'check-done' : ''}`}
                    onClick={() => handleToggle(item)}
                    disabled={pendingId === item._id}
                    aria-label={`Mark ${item.name}`}
                  >
                    {state === 'full' && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    )}
                  </button>
                )}

                <div className="item-info">
                  <div className={`item-name ${state === 'full' ? 'item-name-done' : ''}`}>
                    {item.name}
                  </div>
                  <div className="item-meta">
                    <span className={`badge badge-${item.priority}`}>{item.priority}</span>
                    {state === 'partial' && <span className="badge badge-partial">parțial plătit</span>}
                    {item.boughtBy && (
                      <span className="shared-badge-buyer">cumpărat de {item.boughtBy}</span>
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
              </div>

              {isWaiting && (
                <div className="shared-buyer-row">
                  <input
                    className="adjust-input"
                    type="text"
                    placeholder="numele tău (opțional)"
                    value={buyerName[item._id] ?? ''}
                    onChange={(e) => setBuyerName((prev) => ({ ...prev, [item._id]: e.target.value }))}
                    autoFocus
                  />
                  <button className="btn-confirm confirm-add" onClick={() => handleConfirmBuy(item)}>
                    confirmă ✓
                  </button>
                  <button className="btn-edit-budget" onClick={() => setShowBuyerInput(null)}>
                    anulează
                  </button>
                </div>
              )}

              {hasBreakdown && (
                <div className="breakdown-panel">
                  {item.breakdown!.map((b) => {
                    const bdKey = `${item._id}:${b.key}`;
                    return (
                      <div key={b.key} className="breakdown-row">
                        <button
                          className={`bd-check ${b.purchased ? 'bd-check-done' : ''}`}
                          onClick={() => handleToggleBreakdown(item, b.key)}
                          disabled={pendingBreakdown === bdKey}
                          aria-label={`${b.purchased ? 'Anulează' : 'Cumpără'} ${getFieldLabel(b.key)}`}
                        >
                          {b.purchased && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1.5,5 4,7.5 8.5,2.5" />
                            </svg>
                          )}
                        </button>
                        <span className="bd-icon">{getFieldIcon(b.key)}</span>
                        <span className={`bd-label ${b.purchased ? 'bd-done' : ''}`}>
                          {getFieldLabel(b.key)}
                        </span>
                        <span className={`bd-amount ${b.purchased ? 'bd-done' : ''}`}>
                          {formatCurrency(b.amount)}
                        </span>
                      </div>
                    );
                  })}

                  {(() => {
                    const total = item.breakdown!.reduce((s, b) => s + b.amount, 0);
                    const paid = item.breakdown!.reduce((s, b) => s + (b.purchased ? b.amount : 0), 0);
                    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                    return (
                      <div className="bd-progress">
                        <div className="bd-progress-meta">
                          <span>{pct}% plătit</span>
                          <span>{formatCurrency(paid)} din {formatCurrency(total)}</span>
                        </div>
                        <div className="bd-progress-bar-wrap">
                          <div className="bd-progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}

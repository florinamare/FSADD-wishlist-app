import { BudgetHeader } from '../components/BudgetHeader';
import { AddItemForm } from '../components/AddItemForm';
import { WishlistItem } from '../components/WishlistItem';
import { Toast } from '../components/Toast';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user, logout } = useAuth();

  const {
    items,
    budget,
    budgetHistory,
    totalSpent,
    remaining,
    isLoading,
    error,
    addItem,
    togglePurchased,
    toggleBreakdownItem,
    deleteItem,
    adjustBudget,
  } = useWishlist();

  return (
    <main className="app">
      <Toast message={error} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginRight: '10px', alignSelf: 'center' }}>
          {user?.username}
        </span>
        <button className="btn-edit-budget" onClick={logout}>
          Sign out
        </button>
      </div>

      <BudgetHeader
        budget={budget}
        totalSpent={totalSpent}
        remaining={remaining}
        budgetHistory={budgetHistory}
        onAdjust={adjustBudget}
        shareToken={user?.shareToken}
      />

      <AddItemForm onAdd={addItem} />

      <section>
        <span className="section-label">wishes</span>

        {isLoading && <p className="state-msg">loading...</p>}
        {!isLoading && items.length === 0 && (
          <p className="state-msg">no wishes added yet</p>
        )}

        {items.map((item) => (
          <WishlistItem
            key={item._id}
            item={item}
            remainingBudget={remaining}
            onToggle={togglePurchased}
            onToggleBreakdown={toggleBreakdownItem}
            onDelete={deleteItem}
          />
        ))}
      </section>
    </main>
  );
}

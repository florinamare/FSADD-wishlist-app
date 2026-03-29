import { BudgetHeader } from './components/BudgetHeader';
import { AddItemForm } from './components/AddItemForm';
import { WishlistItem } from './components/WishlistItem';
import { Toast } from './components/Toast';
import { AuthPage } from './components/AuthPage';
import { useWishlist } from './hooks/useWishlist';
import { useAuth } from './hooks/useAuth';
import './App.css';

export default function App() {
  const { token, username, logout, error: authError, isLoading: authLoading, login, register } = useAuth();

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

  if (!token) {
    return (
      <AuthPage
        error={authError}
        isLoading={authLoading}
        onLogin={login}
        onRegister={register}
      />
    );
  }

  return (
    <main className="app">
      <Toast message={error} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginRight: '10px', alignSelf: 'center' }}>
          {username}
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

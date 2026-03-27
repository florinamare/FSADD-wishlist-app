import { BudgetHeader } from './components/BudgetHeader';
import { AddItemForm } from './components/AddItemForm';
import { WishlistItem } from './components/WishlistItem';
import { Toast } from './components/Toast';
import { useWishlist } from './hooks/useWishlist';
import './App.css';

export default function App() {
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
function calculateRemainingBudget(totalBudget, spentAmount) {
  return totalBudget - spentAmount;
}

function isOverspent(totalBudget, spentAmount) {
  return spentAmount > totalBudget;
}

function getPurchasedItems(items) {
  return items.filter((item) => item.purchased === true);
}

module.exports = { calculateRemainingBudget, isOverspent, getPurchasedItems };

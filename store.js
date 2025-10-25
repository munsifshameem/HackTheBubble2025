// Mock points storage (you could use localStorage or sessionStorage here)
let userPoints = 120; // Example value, replace with dynamic points from the user's journey data

// Update points display
function updatePointsDisplay() {
  document.getElementById('points').innerText = userPoints;
}

// Purchase an item
function purchaseItem(itemCost) {
  if (userPoints >= itemCost) {
    userPoints -= itemCost;
    alert(`Item purchased! You spent ${itemCost} points.`);
    updatePointsDisplay();
  } else {
    alert(`You don't have enough points to purchase this item. You need ${itemCost - userPoints} more points.`);
  }
}

// On page load, update the points display
window.onload = function() {
  updatePointsDisplay();
};

const CAT_COLORS = {
  Food: '#e8854a',
  Transport: '#5b9cf6',
  Shopping: '#c47fd4',
  Bills: '#f0c040',
  Other: '#5fc48a'
};

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let nextId = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

// Set today's date as default
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('exp-date').value = today;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function saveToStorage() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function addExpense() {
  const name = document.getElementById('exp-name').value.trim();
  const amount = parseFloat(document.getElementById('exp-amount').value);
  const category = document.getElementById('exp-category').value;
  const date = document.getElementById('exp-date').value;

  // Validation
  if (!name || isNaN(amount) || amount <= 0 || !date) {
    alert('Please fill in all fields correctly!');
    return;
  }

  // Add to list
  expenses.unshift({ id: nextId++, name, amount, category, date });

  // Save to localStorage
  saveToStorage();

  // Clear inputs
  document.getElementById('exp-name').value = '';
  document.getElementById('exp-amount').value = '';
  setDefaultDate();

  render();
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveToStorage();
  render();
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function render() {
  // Filter today's expenses
  const todayStr = getTodayStr();
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // All time total
  const allTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Update totals
  document.getElementById('total-amount').textContent =
    '₹' + allTotal.toLocaleString('en-IN');
  document.getElementById('today-amount').textContent =
    '₹' + todayTotal.toLocaleString('en-IN');

  // Update list
  const list = document.getElementById('expense-list');

  if (expenses.length === 0) {
    list.innerHTML = `
      <li style="text-align:center; color:#bbb; font-size:13px; padding:24px 0;">
        No expenses yet. Add one above!
      </li>`;
    return;
  }

  // Group expenses by date
  const grouped = {};
  expenses.forEach(e => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  // Sort dates newest first
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  list.innerHTML = sortedDates.map(date => {
    const dayTotal = grouped[date].reduce((sum, e) => sum + e.amount, 0);
    const isToday = date === todayStr;

    return `
      <li class="date-group-header">
        <span>${isToday ? 'Today' : formatDate(date)}</span>
        <span>₹${dayTotal.toLocaleString('en-IN')}</span>
      </li>
      ${grouped[date].map(e => `
        <li class="expense-item">
          <div class="cat-dot" style="background:${CAT_COLORS[e.category]}"></div>
          <div class="expense-info">
            <span class="exp-name">${e.name}</span>
            <span class="exp-cat">${e.category}</span>
          </div>
          <span class="expense-amount">₹${e.amount.toLocaleString('en-IN')}</span>
          <button class="delete-btn" onclick="deleteExpense(${e.id})">✕</button>
        </li>
      `).join('')}
    `;
  }).join('');
}

// Enter key support
document.getElementById('exp-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('exp-amount').focus();
});
document.getElementById('exp-amount').addEventListener('keydown', e => {
  if (e.key === 'Enter') addExpense();
});

// Init
setDefaultDate();
render();
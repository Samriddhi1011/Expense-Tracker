const expenseForm = document.getElementById('expenseForm');
const expenseTitle = document.getElementById('expenseTitle');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');
const expenseList = document.getElementById('expenseList');
const totalAmountEl = document.getElementById('totalAmount');
const txCountEl = document.getElementById('txCount');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterPills = document.querySelectorAll('.pill');

let expenses = JSON.parse(localStorage.getItem('glow_expenses')) || [];
let currentFilter = 'All';

function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
}

function updateSummary() {
    const total = expenses.reduce((acc, item) => acc + item.amount, 0);
    totalAmountEl.textContent = formatINR(total);
    txCountEl.textContent = expenses.length;
}

function saveToLocalStorage() {
    localStorage.setItem('glow_expenses', JSON.stringify(expenses));
}

function renderExpenses() {
    expenseList.innerHTML = '';

    const filteredExpenses = currentFilter === 'All' 
        ? expenses 
        : expenses.filter(item => item.category === currentFilter);

    if (filteredExpenses.length === 0) {
        expenseList.innerHTML = `<div class="empty-state">No expenses found ✨</div>`;
        updateSummary();
        return;
    }

    filteredExpenses.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'expense-item';

        const formattedDate = new Date(item.id).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });

        div.innerHTML = `
            <div class="expense-info">
                <h4>${escapeHTML(item.title)}</h4>
                <div class="expense-meta">
                    <span>${item.category}</span> • <span>${formattedDate}</span>
                </div>
            </div>
            <div class="expense-right">
                <span class="expense-amount">-${formatINR(item.amount)}</span>
                <button class="delete-btn" onclick="deleteExpense(${item.id})" title="Delete item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        expenseList.appendChild(div);
    });

    updateSummary();
}

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = expenseTitle.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;

    if (!title || !amount || !category) return;

    const newExpense = {
        id: Date.now(), 
        title,
        amount,
        category
    };

    expenses.unshift(newExpense); 
    saveToLocalStorage();
    renderExpenses();

    expenseForm.reset();
});

function deleteExpense(id) {
    expenses = expenses.filter(item => item.id !== id);
    saveToLocalStorage();
    renderExpenses();
}

clearAllBtn.addEventListener('click', () => {
    if (expenses.length === 0) return;
    if (confirm('Are you sure you want to clear all expenses?')) {
        expenses = [];
        saveToLocalStorage();
        renderExpenses();
    }
});

filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.getAttribute('data-filter');
        renderExpenses();
    });
});

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

renderExpenses();
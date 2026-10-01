const API_URL = "http://localhost:3000/api/expenses";
let allExpenses = [];

// Spinner
const spinner = document.createElement('div');
spinner.className = 'spinner-border text-primary position-fixed top-50 start-50 d-none';
spinner.style.zIndex = '9999';
spinner.setAttribute('role', 'status');
spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
document.body.appendChild(spinner);

function showSpinner() { spinner.classList.remove('d-none'); }
function hideSpinner() { spinner.classList.add('d-none'); }

document.addEventListener("DOMContentLoaded", () => {
  loadExpenses();
  document.querySelector("#expense-form")?.addEventListener("submit", handleAddExpense);
  document.querySelector("#filter-category")?.addEventListener("change", (e) => filterExpenses(e.target.value));
  document.querySelector("#edit-form")?.addEventListener("submit", handleUpdateExpense);
});

async function loadExpenses() {
  showSpinner();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Network response was not ok");
    allExpenses = await res.json();
    renderAll(allExpenses);
  } catch (err) {
    console.error("Error loading data:", err);
    alert("Failed to load expenses. Please check if the server is running.");
  } finally {
    hideSpinner();
  }
}

function renderAll(expenses) {
  renderTable(expenses);
  updateStats(expenses);
}

function renderTable(expenses) {
  const tbody = document.querySelector("#expenses-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!expenses || expenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3">No expenses found</td></tr>`;
    return;
  }

  expenses.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>$${Number(item.amount).toFixed(2)}</td>
      <td><span class="badge ${getCategoryBadge(item.category)}">${item.category}</span></td>
      <td>${item.date ? item.date.split('T')[0] : ''}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="openEditModal(${item.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateStats(expenses) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  let highest = { amount: 0, title: "-" };
  if (count > 0) {
    highest = expenses.reduce((prev, curr) => (Number(curr.amount) > Number(prev.amount)) ? curr : prev, expenses[0]);
  }

  document.querySelector("#total-amount").textContent = total.toFixed(2);
  document.querySelector("#total-count").textContent = count;
  document.querySelector("#highest-amount").textContent = Number(highest.amount).toFixed(2);
  document.querySelector("#highest-title").textContent = highest.title;
}

async function handleAddExpense(e) {
  e.preventDefault();
  const title = document.querySelector("#title-input").value.trim();
  const amount = parseFloat(document.querySelector("#amount-input").value);
  const category = document.querySelector("#category-input").value;
  const date = document.querySelector("#date-input").value;

  if (!title || isNaN(amount) || amount <= 0 || !category || !date) {
    alert("Please fill all fields correctly (Amount must be > 0).");
    return;
  }

  showSpinner();
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date })
    });
    if (res.ok) {
      await loadExpenses();
      e.target.reset();
    } else {
      const errData = await res.json();
      alert(`Error: ${errData.message || "Failed to add"}`);
    }
  } catch (err) {
    console.error(err);
    alert("Network error.");
  } finally {
    hideSpinner();
  }
}

function openEditModal(id) {
  const item = allExpenses.find(e => e.id === id);
  if (!item) return;
  document.querySelector("#edit-id").value = item.id;
  document.querySelector("#edit-title").value = item.title;
  document.querySelector("#edit-amount").value = item.amount;
  document.querySelector("#edit-category").value = item.category;
  document.querySelector("#edit-date").value = item.date ? item.date.split('T')[0] : '';
  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

async function handleUpdateExpense(e) {
  e.preventDefault();
  const id = document.querySelector("#edit-id").value;
  const title = document.querySelector("#edit-title").value.trim();
  const amount = parseFloat(document.querySelector("#edit-amount").value);
  const category = document.querySelector("#edit-category").value;
  const date = document.querySelector("#edit-date").value;

  if (!title || isNaN(amount) || amount <= 0) {
    alert("Invalid data.");
    return;
  }

  showSpinner();
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date })
    });
    if (res.ok) {
      bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
      await loadExpenses();
    } else {
      alert("Failed to update");
    }
  } catch (err) {
    console.error(err);
    alert("Network error.");
  } finally {
    hideSpinner();
  }
}

async function deleteExpense(id) {
  if (!confirm("Are you sure?")) return;
  showSpinner();
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) await loadExpenses();
  } catch (err) {
    console.error(err);
  } finally {
    hideSpinner();
  }
}

function filterExpenses(category) {
  if (category === "All") renderTable(allExpenses);
  else renderTable(allExpenses.filter(e => e.category === category));
}

function getCategoryBadge(category) {
  switch (category) {
    case 'Food': return 'bg-success';
    case 'Transport': return 'bg-primary';
    case 'Bills': return 'bg-warning';
    case 'Entertainment': return 'bg-info';
    default: return 'bg-secondary';
  }
}

import { useEffect, useState } from "react";

import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function currentMonthState() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

const emptyTransaction = (kind = "expense") => ({
  title: "",
  amount: "",
  kind,
  transaction_date: new Date().toISOString().slice(0, 10),
  category_id: "",
  notes: "",
});

export default function DashboardPage() {
  const { session, logout } = useAuth();
  const token = session?.access_token;
  const [filters, setFilters] = useState(currentMonthState);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [transactionForm, setTransactionForm] = useState(emptyTransaction("expense"));
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ amount: "", month: filters.month, year: filters.year, category_id: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", kind: "expense" });

  const refreshData = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [nextCategories, nextTransactions, nextBudgets, nextAnalytics, nextReport] = await Promise.all([
        api.getCategories(token),
        api.getTransactions(token),
        api.getBudgets(token),
        api.getAnalytics(filters.month, filters.year, token),
        api.getMonthlyReport(filters.month, filters.year, token),
      ]);
      setCategories(nextCategories);
      setTransactions(nextTransactions);
      setBudgets(nextBudgets);
      setAnalytics(nextAnalytics);
      setReport(nextReport);
      const expenseCategories = nextCategories.filter((item) => item.kind === "expense");
      const incomeCategories = nextCategories.filter((item) => item.kind === "income");
      setTransactionForm((current) => ({
        ...current,
        category_id:
          current.kind === "income"
            ? current.category_id || incomeCategories[0]?.id || ""
            : current.category_id || expenseCategories[0]?.id || "",
      }));
      setBudgetForm((current) => ({
        ...current,
        month: filters.month,
        year: filters.year,
        category_id: current.category_id || expenseCategories[0]?.id || "",
      }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token, filters.month, filters.year]);

  const submitTransaction = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...transactionForm,
        amount: Number(transactionForm.amount),
        category_id: Number(transactionForm.category_id),
      };
      if (editingTransactionId) {
        await api.updateTransaction(editingTransactionId, payload, token);
      } else {
        await api.createTransaction(payload, token);
      }
      setEditingTransactionId(null);
      setTransactionForm(emptyTransaction(transactionForm.kind));
      refreshData();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const submitBudget = async (event) => {
    event.preventDefault();
    try {
      await api.createBudget(
        {
          ...budgetForm,
          amount: Number(budgetForm.amount),
          month: Number(budgetForm.month),
          year: Number(budgetForm.year),
          category_id: Number(budgetForm.category_id),
        },
        token,
      );
      setBudgetForm((current) => ({ ...current, amount: "" }));
      refreshData();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    try {
      await api.createCategory(categoryForm, token);
      setCategoryForm({ name: "", kind: "expense" });
      refreshData();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await api.deleteTransaction(transactionId, token);
      refreshData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const startEditingTransaction = (transaction) => {
    setEditingTransactionId(transaction.id);
    setTransactionForm({
      title: transaction.title,
      amount: String(transaction.amount),
      kind: transaction.kind,
      transaction_date: transaction.transaction_date,
      category_id: String(transaction.category.id),
      notes: transaction.notes || "",
    });
  };

  const filteredCategoryOptions = categories.filter((item) => item.kind === transactionForm.kind);
  const expenseCategories = categories.filter((item) => item.kind === "expense");

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{session?.user?.full_name}</h1>
          <p>Monitor your cash flow, category budgets, and monthly insights in one place.</p>
        </div>
        <div className="topbar-actions">
          <label className="mini-field">
            Month
            <input
              type="number"
              min="1"
              max="12"
              value={filters.month}
              onChange={(event) => setFilters({ ...filters, month: Number(event.target.value) })}
            />
          </label>
          <label className="mini-field">
            Year
            <input
              type="number"
              min="2000"
              max="2100"
              value={filters.year}
              onChange={(event) => setFilters({ ...filters, year: Number(event.target.value) })}
            />
          </label>
          <button className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="stats-grid">
        <StatCard label="Total Income" value={currency(analytics?.summary?.total_income)} tone="income" />
        <StatCard label="Total Expenses" value={currency(analytics?.summary?.total_expenses)} tone="expense" />
        <StatCard label="Net Savings" value={currency(analytics?.summary?.net_savings)} tone="savings" />
        <StatCard label="Savings Rate" value={`${analytics?.summary?.savings_rate || 0}%`} tone="neutral" />
      </div>

      <div className="content-grid">
        <SectionCard title="Add Transaction" subtitle="Record income and expenses with category mapping.">
          <form className="form-grid" onSubmit={submitTransaction}>
            <label>
              Type
              <select
                value={transactionForm.kind}
                onChange={(event) =>
                  setTransactionForm({
                    ...emptyTransaction(event.target.value),
                    category_id:
                      categories.find((item) => item.kind === event.target.value)?.id || "",
                    kind: event.target.value,
                  })
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label>
              Title
              <input
                value={transactionForm.title}
                onChange={(event) => setTransactionForm({ ...transactionForm, title: event.target.value })}
                required
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={transactionForm.amount}
                onChange={(event) => setTransactionForm({ ...transactionForm, amount: event.target.value })}
                required
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={transactionForm.transaction_date}
                onChange={(event) => setTransactionForm({ ...transactionForm, transaction_date: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={transactionForm.category_id}
                onChange={(event) => setTransactionForm({ ...transactionForm, category_id: event.target.value })}
                required
              >
                {filteredCategoryOptions.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width">
              Notes
              <textarea
                rows="3"
                value={transactionForm.notes}
                onChange={(event) => setTransactionForm({ ...transactionForm, notes: event.target.value })}
              />
            </label>
            <button className="primary-button">
              {editingTransactionId ? "Update transaction" : "Save transaction"}
            </button>
            {editingTransactionId ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingTransactionId(null);
                  setTransactionForm(emptyTransaction("expense"));
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </form>
        </SectionCard>

        <SectionCard title="Budget Planner" subtitle="Assign a monthly budget to expense categories.">
          <form className="form-grid" onSubmit={submitBudget}>
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={budgetForm.amount}
                onChange={(event) => setBudgetForm({ ...budgetForm, amount: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={budgetForm.category_id}
                onChange={(event) => setBudgetForm({ ...budgetForm, category_id: event.target.value })}
                required
              >
                {expenseCategories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Month
              <input
                type="number"
                min="1"
                max="12"
                value={budgetForm.month}
                onChange={(event) => setBudgetForm({ ...budgetForm, month: event.target.value })}
                required
              />
            </label>
            <label>
              Year
              <input
                type="number"
                min="2000"
                max="2100"
                value={budgetForm.year}
                onChange={(event) => setBudgetForm({ ...budgetForm, year: event.target.value })}
                required
              />
            </label>
            <button className="primary-button">Create budget</button>
          </form>
        </SectionCard>
      </div>

      <div className="content-grid">
        <SectionCard title="Custom Categories" subtitle="Create your own income or expense labels.">
          <form className="form-grid compact" onSubmit={submitCategory}>
            <label>
              Category name
              <input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Type
              <select
                value={categoryForm.kind}
                onChange={(event) => setCategoryForm({ ...categoryForm, kind: event.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <button className="primary-button">Add category</button>
          </form>
          <div className="pill-row">
            {categories.map((category) => (
              <span className={`pill ${category.kind}`} key={category.id}>
                {category.name}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Budget Health" subtitle="See which categories are near or over the monthly limit.">
          <div className="list-grid">
            {analytics?.budget_status?.length ? (
              analytics.budget_status.map((item) => (
                <div className={`budget-item ${item.alert_level}`} key={item.budget_id}>
                  <div>
                    <strong>{item.category_name}</strong>
                    <p>
                      {currency(item.spent_amount)} spent of {currency(item.budget_amount)}
                    </p>
                  </div>
                  <span>{item.usage_percent}%</span>
                </div>
              ))
            ) : (
              <p className="muted-text">No budgets defined for this month yet.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="content-grid">
        <SectionCard title="Transactions" subtitle="Recent financial activity with delete support.">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.title}</td>
                    <td>{transaction.kind}</td>
                    <td>{transaction.category.name}</td>
                    <td>{transaction.transaction_date}</td>
                    <td>{currency(transaction.amount)}</td>
                    <td>
                      <button className="link-button" onClick={() => startEditingTransaction(transaction)}>
                        Edit
                      </button>
                      {" "}
                      <button className="link-button" onClick={() => deleteTransaction(transaction.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recommendations" subtitle="Simple intelligent feedback based on savings and budget usage.">
          <div className="list-grid">
            {analytics?.recommendations?.map((item) => (
              <div className={`recommendation ${item.severity}`} key={`${item.title}-${item.description}`}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="content-grid">
        <SectionCard title="Spending Breakdown" subtitle="Top expense categories by amount.">
          <div className="bars">
            {analytics?.category_breakdown?.length ? (
              analytics.category_breakdown.map((item) => {
                const max = analytics.category_breakdown[0]?.amount || 1;
                return (
                  <div className="bar-row" key={item.category_name}>
                    <div className="bar-label">
                      <span>{item.category_name}</span>
                      <strong>{currency(item.amount)}</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(item.amount / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="muted-text">Add some expense transactions to unlock analytics.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Monthly Report" subtitle="A concise export-style summary from your selected period.">
          <div className="report-card">
            <p>
              Report for {report?.month}/{report?.year}
            </p>
            <p>Total income: {currency(report?.summary?.total_income)}</p>
            <p>Total expenses: {currency(report?.summary?.total_expenses)}</p>
            <p>Net savings: {currency(report?.summary?.net_savings)}</p>
            <p>Savings rate: {report?.summary?.savings_rate || 0}%</p>
          </div>
        </SectionCard>
      </div>

      {loading ? <p className="muted-text">Loading dashboard...</p> : null}
      <div className="footer-space">
        <p>{budgets.length} budgets configured.</p>
      </div>
    </div>
  );
}

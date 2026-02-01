import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCollection } from "../hooks/useCollection";
import TransactionForm from "../components/features/TransactionForm";
import TransactionList from "../components/features/TransactionList";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const query = useMemo(() => ["uid", "==", currentUser?.uid], [currentUser?.uid]);
    const order = useMemo(() => ["createdAt", "desc"], []);

    const { documents: transactions, error } = useCollection(
        "transactions",
        query,
        order
    );

    // Calculate totals
    const income = transactions
        ? transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
        : 0;
    const expense = transactions
        ? transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
        : 0;
    const balance = income - expense;

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch {
            console.error("Failed to log out");
        }
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>My Kakeibo</h1>
                <div className="user-info">
                    <span>{currentUser.email}</span>
                    <button onClick={handleLogout} className="btn-secondary">
                        Log Out
                    </button>
                </div>
            </header>
            <main className="dashboard-content">
                <div className="summary-cards">
                    <div className="card income">
                        <h3>Income</h3>
                        <p className="amount">¥{income.toLocaleString()}</p>
                    </div>
                    <div className="card expense">
                        <h3>Expense</h3>
                        <p className="amount">¥{expense.toLocaleString()}</p>
                    </div>
                    <div className="card balance">
                        <h3>Balance</h3>
                        <p className="amount">¥{balance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="layout-grid">
                    <div className="main-content">
                        <TransactionForm uid={currentUser.uid} />
                    </div>
                    <div className="sidebar-content">
                        <h2>Recent Transactions</h2>
                        {error && <p className="error">{error}</p>}
                        {transactions && <TransactionList transactions={transactions} />}
                    </div>
                </div>
            </main>
        </div>
    );
}

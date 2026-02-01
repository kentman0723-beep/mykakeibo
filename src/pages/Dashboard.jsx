import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCollection } from "../hooks/useCollection";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

import IncomeStep from "../components/features/dashboard/IncomeStep";
import FixedCostStep from "../components/features/dashboard/FixedCostStep";
import VariableCostStep from "../components/features/dashboard/VariableCostStep";
import ActionStep from "../components/features/dashboard/ActionStep";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    const query = useMemo(() => ["uid", "==", currentUser?.uid], [currentUser?.uid]);
    const order = useMemo(() => ["date", "desc"], []);

    // Note: Fetching all transactions and filtering client-side for now.
    // For scaling, we should query by date range.
    const { documents: allTransactions } = useCollection("transactions", query, order);

    const transactions = useMemo(() => {
        if (!allTransactions) return [];
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return allTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= start && date <= end;
        });
    }, [allTransactions, currentDate]);

    // Calculate totals
    const income = transactions.reduce((acc, t) => {
        if (t.type === 'income_main' || t.type === 'income_side' || t.type === 'income') return acc + t.amount;
        return acc;
    }, 0);

    const expense = transactions.reduce((acc, t) => {
        if (t.type === 'fixed_cost' || t.type === 'variable_cost' || t.type === 'expense') return acc + t.amount;
        return acc;
    }, 0);

    const balance = income - expense;

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch {
            console.error("Failed to log out");
        }
    }

    const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

    return (
        <div className="dashboard-container">
            <header className="dashboard-header-new">
                <div className="month-selector">
                    <button onClick={prevMonth}>&lt;</button>
                    <h2>{format(currentDate, "yyyy年 M月", { locale: ja })}</h2>
                    <button onClick={nextMonth}>&gt;</button>
                </div>
                <div className="header-actions">
                    <div className="user-display">
                        {currentUser.displayName || currentUser.email}
                    </div>
                    <button className="btn-icon" onClick={() => navigate("/settings")} title="Settings">⚙️</button>
                    <button className="btn-icon" onClick={handleLogout} title="Log Out">🚪</button>
                </div>
            </header>

            <div className="total-summary">
                <p className="label">今月の収支</p>
                <h1 className={balance >= 0 ? "plus" : "minus"}>¥{balance.toLocaleString()}</h1>
                <div className="sub-totals">
                    <span className="inc">収 ¥{income.toLocaleString()}</span> / <span className="exp">支 ¥{expense.toLocaleString()}</span>
                </div>
            </div>

            <main className="steps-wrapper">
                <IncomeStep uid={currentUser.uid} transactions={transactions} />
                <FixedCostStep uid={currentUser.uid} transactions={transactions} />
                <VariableCostStep uid={currentUser.uid} transactions={transactions} />
                <ActionStep uid={currentUser.uid} />
            </main>
        </div>
    );
}

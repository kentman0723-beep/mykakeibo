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

    // Fetch all transactions and filter client-side
    const { documents: allTransactions, error } = useCollection("transactions", query);

    const transactions = useMemo(() => {
        if (!allTransactions) return [];
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        return allTransactions
            .filter(t => {
                if (!t.date) return false;
                const date = parseISO(t.date);
                return date >= start && date <= end;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
    }, [allTransactions, currentDate]);

    // Calculate totals
    const income = transactions.reduce((acc, t) => {
        if (t.type === 'income_main' || t.type === 'income_side' || t.type === 'income') return acc + (t.amount || 0);
        return acc;
    }, 0);

    const expense = transactions.reduce((acc, t) => {
        if (t.type === 'fixed_cost' || t.type === 'variable_cost' || t.type === 'expense') return acc + (t.amount || 0);
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
            {error && <div className="alert error" style={{ marginBottom: '20px', color: 'red', padding: '10px', background: '#fee' }}>⚠️ データ取得エラー: {error}</div>}
            <header className="dashboard-header-new">
                <div className="month-selector">
                    <button onClick={prevMonth}>&lt;</button>
                    <h2>{format(currentDate, "yyyy年 M月", { locale: ja })}</h2>
                    <button onClick={nextMonth}>&gt;</button>
                </div>
                import {IconChart, IconSettings, IconLogOut} from "../components/common/Icons";

                // ... existing imports ...

                // Inside component ...
                <div className="header-actions">
                    <div className="user-display">
                        {currentUser?.displayName || currentUser?.email}
                    </div>
                    <button className="btn-icon" onClick={() => navigate("/yearly")} title="Yearly Report">
                        <IconChart size={20} color="#718096" />
                    </button>
                    <button className="btn-icon" onClick={() => navigate("/settings")} title="Settings">
                        <IconSettings size={20} color="#718096" />
                    </button>
                    <button className="btn-icon" onClick={handleLogout} title="Log Out">
                        <IconLogOut size={20} color="#718096" />
                    </button>
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
                <IncomeStep uid={currentUser?.uid} transactions={transactions} />
                <FixedCostStep uid={currentUser?.uid} transactions={transactions} />
                <VariableCostStep uid={currentUser?.uid} transactions={transactions} />
                <ActionStep uid={currentUser?.uid} />
            </main>


        </div>
    );
}

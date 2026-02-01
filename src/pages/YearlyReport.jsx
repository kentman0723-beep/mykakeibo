import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCollection } from "../hooks/useCollection";
import { format, startOfYear, endOfYear, addYears, subYears, parseISO, getMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function YearlyReport() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    const query = useMemo(() => ["uid", "==", currentUser?.uid], [currentUser?.uid]);
    const { documents: allTransactions } = useCollection("transactions", query);

    // Filter and Aggregate Data
    const { monthlyData, totalIncome, totalExpense, totalBalance } = useMemo(() => {
        if (!allTransactions) return { monthlyData: [], totalIncome: 0, totalExpense: 0, totalBalance: 0 };

        const start = startOfYear(currentDate);
        const end = endOfYear(currentDate);

        // Initialize 12 months data
        const data = Array.from({ length: 12 }, (_, i) => ({
            name: `${i + 1}月`,
            income: 0,
            expense: 0
        }));

        let inc = 0;
        let exp = 0;

        allTransactions.forEach(t => {
            const date = parseISO(t.date);
            if (date >= start && date <= end) {
                const month = getMonth(date); // 0-11
                if (t.type === 'income_main' || t.type === 'income_side' || t.type === 'income') {
                    data[month].income += t.amount;
                    inc += t.amount;
                } else if (t.type === 'fixed_cost' || t.type === 'variable_cost' || t.type === 'expense') {
                    data[month].expense += t.amount;
                    exp += t.amount;
                }
            }
        });

        return {
            monthlyData: data,
            totalIncome: inc,
            totalExpense: exp,
            totalBalance: inc - exp
        };
    }, [allTransactions, currentDate]);

    const prevYear = () => setCurrentDate(prev => subYears(prev, 1));
    const nextYear = () => setCurrentDate(prev => addYears(prev, 1));

    return (
        <div className="layout-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate("/")}>← Back</button>
                <h2>年間レポート</h2>
            </header>

            <div className="year-selector">
                <button onClick={prevYear}>&lt;</button>
                <h2>{format(currentDate, "yyyy年", { locale: ja })}</h2>
                <button onClick={nextYear}>&gt;</button>
            </div>

            <div className="summary-cards">
                <div className="card income">
                    <h3>年間収入</h3>
                    <p className="amount">¥{totalIncome.toLocaleString()}</p>
                </div>
                <div className="card expense">
                    <h3>年間支出</h3>
                    <p className="amount">¥{totalExpense.toLocaleString()}</p>
                </div>
                <div className="card balance">
                    <h3>年間収支</h3>
                    <p className="amount">¥{totalBalance.toLocaleString()}</p>
                </div>
            </div>

            <div className="chart-container">
                <h3>月別推移</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={monthlyData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="income" name="収入" fill="#82ca9d" />
                            <Bar dataKey="expense" name="支出" fill="#ff8042" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

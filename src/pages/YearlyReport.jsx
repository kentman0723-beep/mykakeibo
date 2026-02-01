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

    const query = useMemo(() => {
        if (!currentUser?.uid) return null; // Return null if no UID
        return ["uid", "==", currentUser.uid];
    }, [currentUser?.uid]);
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
            <header className="page-header-simple">
                <button className="btn-back-simple" onClick={() => navigate("/")}>
                    <span className="icon">←</span> ダッシュボード
                </button>
            </header>

            <div className="year-selector-refined">
                <button onClick={prevYear} className="btn-year-nav">
                    <span className="arrow">‹</span>
                </button>
                <div className="current-year">
                    <span className="label">対象年</span>
                    <span className="year-number">{format(currentDate, "yyyy")}</span>
                </div>
                <button onClick={nextYear} className="btn-year-nav">
                    <span className="arrow">›</span>
                </button>
            </div>

            <div className="summary-grid">
                <div className="summary-card income">
                    <div className="icon">💰</div>
                    <div className="content">
                        <h3>年間収入</h3>
                        <p className="amount">¥{totalIncome.toLocaleString()}</p>
                    </div>
                </div>
                <div className="summary-card expense">
                    <div className="icon">💸</div>
                    <div className="content">
                        <h3>年間支出</h3>
                        <p className="amount">¥{totalExpense.toLocaleString()}</p>
                    </div>
                </div>
                <div className="summary-card balance">
                    <div className="icon">⚖️</div>
                    <div className="content">
                        <h3>年間収支</h3>
                        <p className={`amount ${totalBalance >= 0 ? 'plus' : 'minus'}`}>
                            ¥{totalBalance.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="section-header">
                    <h3>月別推移</h3>
                    <p className="subtitle">{format(currentDate, "yyyy")}年の月別収支推移</p>
                </div>
                <div className="chart-container-refined">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={monthlyData}
                            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                            barSize={12}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#A0AEC0', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#A0AEC0', fontSize: 12 }}
                                tickFormatter={(value) => `¥${value / 10000}万`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                formatter={(value) => `¥${value.toLocaleString()}`}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="income" name="収入" fill="#8EB7F7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="支出" fill="#FF9AA2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

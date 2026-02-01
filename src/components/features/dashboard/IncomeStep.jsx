import { useState } from 'react';
import { useFirestore } from '../../../hooks/useFirestore';

export default function IncomeStep({ uid, transactions }) {
    const { addDocument } = useFirestore('transactions');
    const [isAdding, setIsAdding] = useState(null); // 'main' or 'side' or null
    const [amount, setAmount] = useState('');

    // Filter current month's income
    const currentMonthIncomeMain = transactions
        .filter(t => t.type === 'income_main')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const currentMonthIncomeSide = transactions
        .filter(t => t.type === 'income_side')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const handleAdd = async (type) => {
        if (!amount) return;
        await addDocument({
            uid,
            name: type === 'income_main' ? '本業給与' : '副業・その他',
            amount: parseInt(amount),
            type: type,
            date: new Date().toISOString()
        });
        setAmount('');
        setIsAdding(null);
    };

    return (
        <div className="step-container">
            <div className="step-header">
                <span className="step-label">STEP 1</span>
                <h2>収入の入力</h2>
            </div>

            <div className="income-cards">
                {/* Main Job Card */}
                <div className="income-card main">
                    <div className="card-icon">🏢</div>
                    <div className="card-content">
                        <h3>本業給与</h3>
                        <p className="amount">¥{currentMonthIncomeMain.toLocaleString()}</p>
                        {isAdding === 'income_main' ? (
                            <div className="quick-add">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="金額"
                                    autoFocus
                                />
                                <button onClick={() => handleAdd('income_main')}>確定</button>
                                <button className="cancel" onClick={() => setIsAdding(null)}>✕</button>
                            </div>
                        ) : (
                            <button className="btn-add" onClick={() => setIsAdding('income_main')}>+ 登録</button>
                        )}
                    </div>
                </div>

                {/* Side Job Card */}
                <div className="income-card side">
                    <div className="card-icon">💼</div>
                    <div className="card-content">
                        <h3>副業・その他</h3>
                        <p className="amount">¥{currentMonthIncomeSide.toLocaleString()}</p>
                        {isAdding === 'income_side' ? (
                            <div className="quick-add">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="金額"
                                    autoFocus
                                />
                                <button onClick={() => handleAdd('income_side')}>確定</button>
                                <button className="cancel" onClick={() => setIsAdding(null)}>✕</button>
                            </div>
                        ) : (
                            <button className="btn-add" onClick={() => setIsAdding('income_side')}>+ 登録</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

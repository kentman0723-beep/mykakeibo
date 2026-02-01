import { useState } from 'react';
import { format } from 'date-fns';
import { useFirestore } from '../../../hooks/useFirestore';

export default function IncomeStep({ uid, transactions }) {
    const { addDocument, error } = useFirestore('transactions');
    const [isAdding, setIsAdding] = useState(null); // 'main' or 'side' or null
    const [amount, setAmount] = useState('');

    // ... (filters)

    // ... (handleAdd)

    return (
        <div className="step-container">
            <div className="step-header">
                <span className="step-label">STEP 1</span>
                <h2>収入の入力</h2>
            </div>
            {error && <div className="alert error">保存エラー: {error}</div>}

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
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd('income_main')}
                                    placeholder=""
                                    className="input-large"
                                    autoFocus
                                />
                                <div className="quick-add-actions">
                                    <button className="btn-save" onClick={() => handleAdd('income_main')}>確定</button>
                                    <button className="btn-cancel" onClick={() => setIsAdding(null)}>キャンセル</button>
                                </div>
                            </div>
                        ) : (
                            <button className="btn-add" onClick={() => setIsAdding('income_main')}>+ 収入を追加</button>
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd('income_side')}
                                    placeholder=""
                                    className="input-large"
                                    autoFocus
                                />
                                <div className="quick-add-actions">
                                    <button className="btn-save" onClick={() => handleAdd('income_side')}>確定</button>
                                    <button className="btn-cancel" onClick={() => setIsAdding(null)}>キャンセル</button>
                                </div>
                            </div>
                        ) : (
                            <button className="btn-add" onClick={() => setIsAdding('income_side')}>+ 収入を追加</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

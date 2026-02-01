import { useState } from 'react';
import { format } from 'date-fns';
import { useFirestore } from '../../../hooks/useFirestore';

export default function VariableCostStep({ uid, transactions }) {
    const { addDocument } = useFirestore('transactions');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleAdd = async () => {
        if (!name || !amount) return;
        await addDocument({
            uid,
            name,
            amount: parseInt(amount),
            type: 'variable_cost',
            date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
        });
        setName('');
        setAmount('');
    };

    // Filter variable costs for this month (optional: just assume 'transactions' prop is passed correctly)
    const variableCosts = transactions ? transactions.filter(t => t.type === 'variable_cost') : [];

    return (
        <div className="step-container">
            <div className="step-header">
                <span className="step-label orange">STEP 3</span>
                <h2>変動費の入力</h2>
            </div>

            <div className="variable-cost-card">
                <div className="input-row">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="スーパーなど"
                        className="flex-grow input-name"
                    />
                    <div className="amount-input-group">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder="円"
                            className="input-amount"
                        />
                    </div>
                    <button className="btn-orange-plus" onClick={handleAdd}>+</button>
                </div>

                <div className="recent-variable-list">
                    {variableCosts.length === 0 ? (
                        <p className="empty-message">今月の入力はまだありません</p>
                    ) : (
                        <ul>
                            {variableCosts.slice(0, 5).map(item => (
                                <li key={item.id}>
                                    <span className="name">{item.name}</span>
                                    <span className="amount">¥{(item.amount || 0).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

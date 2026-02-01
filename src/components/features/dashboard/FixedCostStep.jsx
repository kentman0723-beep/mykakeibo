import { useState } from 'react';
import { useFirestore } from '../../../hooks/useFirestore';
import { useCollection } from '../../../hooks/useCollection';

export default function FixedCostStep({ uid, transactions }) {
    const { addDocument: addTransaction } = useFirestore('transactions');
    const { addDocument: addTemplate, deleteDocument: deleteTemplate } = useFirestore('user_settings');
    // We'll use 'user_settings' collection to store fixed cost templates with type='fixed_cost_template'

    // Fetch fixed cost templates
    const { documents: templates } = useCollection(
        'user_settings',
        ['uid', '==', uid]
    );

    const fixedCostTemplates = templates ? templates.filter(t => t.type === 'fixed_cost_template') : [];

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleAddTemplate = async () => {
        if (!name || !amount) return;
        await addTemplate({
            uid,
            type: 'fixed_cost_template',
            name,
            amount: parseInt(amount)
        });
        setName('');
        setAmount('');
    };

    const handleBulkAdd = async () => {
        if (fixedCostTemplates.length === 0) return;

        const promises = fixedCostTemplates.map(template => {
            return addTransaction({
                uid,
                name: template.name,
                amount: template.amount,
                type: 'fixed_cost',
                date: new Date().toISOString()
            });
        });

        await Promise.all(promises);
        alert('固定費を一括反映しました！');
    };

    // Check if fixed costs are already added for this month (simple check based on count or specific flag? 
    // For now showing the list allows duplicate addition, which is fine for MVP but maybe warn?)

    return (
        <div className="step-container">
            <div className="step-header">
                <span className="step-label purple">STEP 2</span>
                <h2>固定費の反映</h2>
            </div>

            <div className="fixed-cost-card">
                <p className="card-description">以下の内容で登録されます</p>

                <ul className="template-list">
                    {fixedCostTemplates.length === 0 && <li className="empty">登録なし</li>}
                    {fixedCostTemplates.map(item => (
                        <li key={item.id}>
                            <span>{item.name}</span>
                            <span>¥{item.amount.toLocaleString()}</span>
                            <button className="btn-delete-small" onClick={() => deleteTemplate(item.id)}>×</button>
                        </li>
                    ))}
                </ul>

                <div className="add-template-row">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="項目名 (例: 家賃)"
                        className="input-name"
                    />
                    <div className="amount-input-group">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTemplate()}
                            placeholder="円"
                            className="input-amount"
                        />
                    </div>
                    <button className="btn-plus" onClick={handleAddTemplate}>+</button>
                </div>

                <button
                    className="btn-bulk-reflect"
                    onClick={handleBulkAdd}
                    disabled={fixedCostTemplates.length === 0}
                >
                    ⬇ 一括反映する
                </button>
                <p className="note">※反映後も個別に削除可能です</p>
            </div>
        </div>
    );
}

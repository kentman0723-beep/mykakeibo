import { useState } from 'react';
import { format } from 'date-fns';
import { useFirestore } from '../../../hooks/useFirestore';
import EditTransactionModal from '../../common/EditTransactionModal';
import { IconPlus } from '../../common/Icons';

export default function VariableCostStep({ uid, transactions }) {
    const { addDocument, updateDocument, deleteDocument } = useFirestore('transactions');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

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

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleUpdate = async (id, updates) => {
        await updateDocument(id, updates);
    };

    // Filter variable costs for this month
    const variableCosts = transactions ? transactions.filter(t => t.type === 'variable_cost') : [];
    const totalAmount = variableCosts.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="step-container">
            <div className="step-header" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
                <span className="step-label orange">STEP 3</span>
                <h2>変動費の入力</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                    {totalAmount > 0 && (
                        <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '500' }}>
                            ¥{totalAmount.toLocaleString()}
                        </span>
                    )}
                    <span style={{ fontSize: '1.2rem', color: '#A0AEC0', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                        ▼
                    </span>
                </div>
            </div>

            {isExpanded && (
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
                        <button className="btn-orange-plus" onClick={handleAdd} title="追加">
                            <IconPlus size={14} />
                        </button>
                    </div>

                    <div className="recent-variable-list">
                        {variableCosts.length === 0 ? (
                            <p className="empty-message">今月の入力はまだありません</p>
                        ) : (
                            <ul>
                                {variableCosts.map(item => (
                                    <li key={item.id}>
                                        <span className="name">{item.name}</span>
                                        <span className="amount">¥{(item.amount || 0).toLocaleString()}</span>
                                        <div className="actions">
                                            <button className="btn-edit" onClick={() => openEditModal(item)} title="修正">✏️</button>
                                            <button className="btn-delete" onClick={() => deleteDocument(item.id)} title="削除">×</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            <EditTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transaction={editingItem}
                onUpdate={handleUpdate}
            />
        </div>
    );
}

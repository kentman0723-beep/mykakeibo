import { useState } from 'react';
import { format } from 'date-fns';
import { useFirestore } from '../../../hooks/useFirestore';
import { IconBuilding, IconBriefcase } from '../../common/Icons';
import EditTransactionModal from '../../common/EditTransactionModal';

export default function IncomeStep({ uid, transactions }) {
    const { addDocument, updateDocument, deleteDocument, error } = useFirestore('transactions');
    const [isAdding, setIsAdding] = useState(null); // 'main' or 'side' or null
    const [amount, setAmount] = useState('');

    // History & Edit State
    const [showHistory, setShowHistory] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);

    // Filter current month's income logic
    const mainIncomes = transactions.filter(t => t.type === 'income_main');
    const sideIncomes = transactions.filter(t => t.type === 'income_side');

    const currentMonthIncomeMain = mainIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const currentMonthIncomeSide = sideIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalIncome = currentMonthIncomeMain + currentMonthIncomeSide;

    const handleAdd = async (type) => {
        if (!amount) return;
        await addDocument({
            uid,
            name: type === 'income_main' ? '本業給与' : '副業・その他',
            amount: parseInt(amount),
            type: type,
            date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
        });
        setAmount('');
        setIsAdding(null);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="step-container">
            <div className="step-header" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
                <span className="step-label">STEP 1</span>
                <h2>収入の入力</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                    {totalIncome > 0 && (
                        <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '500' }}>
                            ¥{totalIncome.toLocaleString()}
                        </span>
                    )}
                    <span style={{ fontSize: '1.2rem', color: '#A0AEC0', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                        ▼
                    </span>
                </div>
            </div>
            {error && <div className="alert error">保存エラー: {error}</div>}

            {isExpanded && (
                <>
                    <div className="income-cards">
                        {/* Main Job Card */}
                        <div className="income-card main">
                            <div className="card-icon" style={{ background: '#EBF8FF', color: '#3182CE', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                <IconBuilding size={32} />
                            </div>
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
                            <div className="card-icon" style={{ background: '#FAF5FF', color: '#805AD5', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                <IconBriefcase size={32} />
                            </div>
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

                    <button
                        className="btn-history-toggle"
                        onClick={(e) => { e.stopPropagation(); setShowHistory(!showHistory); }}
                        style={{ marginTop: '15px' }}
                    >
                        {showHistory ? '▲ 閉じる' : '⚙️ 履歴・修正'}
                    </button>

                    {/* History List for Edit/Delete */}
                    {showHistory && (
                        <div className="income-history" style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>今月の収入履歴</p>
                            <ul className="history-list">
                                {[...mainIncomes, ...sideIncomes].map(item => (
                                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                                        <span>{item.name}: ¥{item.amount.toLocaleString()}</span>
                                        <div className="actions">
                                            <button className="btn-edit" onClick={() => openEditModal(item)} title="修正">✏️</button>
                                            <button className="btn-delete" onClick={() => deleteDocument(item.id)} title="削除">×</button>
                                        </div>
                                    </li>
                                ))}
                                {[...mainIncomes, ...sideIncomes].length === 0 && <p style={{ fontSize: '12px', color: '#999' }}>履歴はありません</p>}
                            </ul>
                        </div>
                    )}
                </>
            )}

            <EditTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transaction={editingItem}
                onUpdate={(id, data) => updateDocument(id, data)}
            />
        </div>
    );
}

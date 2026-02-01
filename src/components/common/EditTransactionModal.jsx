import React, { useState, useEffect } from 'react';

export default function EditTransactionModal({ isOpen, onClose, transaction, onUpdate }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setName(transaction.name || '');
            setAmount(transaction.amount || '');
        }
    }, [transaction]);

    if (!isOpen || !transaction) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate(transaction.id, {
                name,
                amount: parseInt(amount)
            });
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("更新に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px'
            }}>
                <h3>修正</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>項目名</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>金額</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', border: 'none', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>キャンセル</button>
                    <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', border: 'none', background: '#3182CE', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
}

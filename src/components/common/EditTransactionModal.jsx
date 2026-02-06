import React, { useState, useEffect } from 'react';

export default function EditTransactionModal({ isOpen, onClose, transaction, onUpdate }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setName(transaction.name || '');
            setAmount(transaction.amount || '');
            // Parse date from transaction
            if (transaction.date) {
                const date = new Date(transaction.date);
                setYear(date.getFullYear());
                setMonth(date.getMonth() + 1);
            }
        }
    }, [transaction]);

    if (!isOpen || !transaction) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            // Create new date with selected year/month but keep original day/time
            const originalDate = new Date(transaction.date);
            const newDate = new Date(year, month - 1, originalDate.getDate(), originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());

            await onUpdate(transaction.id, {
                name,
                amount: parseInt(amount),
                date: newDate.toISOString().replace('Z', '').split('.')[0]
            });
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("更新に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    // Generate year options (2024-2030)
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>金額</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>年月</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}年</option>
                            ))}
                        </select>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            {months.map(m => (
                                <option key={m} value={m}>{m}月</option>
                            ))}
                        </select>
                    </div>
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

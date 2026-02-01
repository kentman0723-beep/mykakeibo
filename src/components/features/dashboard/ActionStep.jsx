import { useState } from 'react';
import { useFirestore } from '../../../hooks/useFirestore';
import { useCollection } from '../../../hooks/useCollection';

export default function ActionStep({ uid }) {
    const { addDocument, deleteDocument, updateDocument } = useFirestore('monthly_actions');

    // Fetch actions
    const { documents: actions } = useCollection(
        'monthly_actions',
        ['uid', '==', uid]
    );

    const [task, setTask] = useState('');

    const handleAddTask = async () => {
        if (!task) return;
        await addDocument({
            uid,
            title: task,
            completed: false,
            createdAt: new Date().toISOString()
        });
        setTask('');
    };

    const toggleComplete = (action) => {
        updateDocument(action.id, { completed: !action.completed });
    };

    return (
        <div className="step-container">
            <div className="step-header">
                <span className="step-label green">STEP 4</span>
                <h2>今月のアクション</h2>
            </div>

            <div className="action-card">
                <button className="btn-set-default">+ 定型アクションをセットする</button>

                <div className="add-task-row">
                    <input
                        type="text"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="タスクを追加 (例: 振込)"
                    />
                    <button className="btn-green-plus" onClick={handleAddTask}>+</button>
                </div>

                <ul className="action-list">
                    {actions && actions.length === 0 && <li className="empty-message">タスクはありません</li>}
                    {actions && actions.map(action => (
                        <li key={action.id} className={action.completed ? 'completed' : ''}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={action.completed}
                                    onChange={() => toggleComplete(action)}
                                />
                                <span>{action.title}</span>
                            </label>
                            <button onClick={() => deleteDocument(action.id)} className="btn-delete-x">×</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

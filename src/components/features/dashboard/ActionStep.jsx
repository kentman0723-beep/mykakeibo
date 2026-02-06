import { useState, useMemo } from 'react';
import { useFirestore } from '../../../hooks/useFirestore';
import { useCollection } from '../../../hooks/useCollection';
import { IconPlus } from '../../common/Icons';

export default function ActionStep({ uid }) {
    const { addDocument, deleteDocument, updateDocument } = useFirestore('monthly_actions');
    const { addDocument: addTemplate, deleteDocument: deleteTemplate } = useFirestore('user_settings');

    // Fetch actions
    const actionsQuery = useMemo(() => ['uid', '==', uid], [uid]);
    const { documents: actions } = useCollection('monthly_actions', actionsQuery);

    // Fetch templates
    const settingsQuery = useMemo(() => ['uid', '==', uid], [uid]);
    const { documents: allSettings } = useCollection('user_settings', settingsQuery);
    const templates = allSettings ? allSettings.filter(s => s.type === 'action_template') : [];

    const [task, setTask] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

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

    const handleAddTemplate = async () => {
        if (!templateName) return;
        await addTemplate({
            uid,
            type: 'action_template',
            title: templateName
        });
        setTemplateName('');
    };

    const addFromTemplate = async (templateTitle) => {
        await addDocument({
            uid,
            title: templateTitle,
            completed: false,
            createdAt: new Date().toISOString()
        });
    };

    const toggleComplete = (action) => {
        updateDocument(action.id, { completed: !action.completed });
    };

    // Count completed/total tasks
    const completedCount = actions ? actions.filter(a => a.completed).length : 0;
    const totalCount = actions ? actions.length : 0;

    return (
        <div className="step-container action-section">
            <div className="step-header" style={{ cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
                <h2>今月のアクション</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                    {totalCount > 0 && (
                        <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '500' }}>
                            {completedCount}/{totalCount} 完了
                        </span>
                    )}
                    <span style={{ fontSize: '1.2rem', color: '#A0AEC0', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                        ▼
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="action-card">
                    <button
                        className="btn-set-default"
                        onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
                    >
                        {showTemplates ? "▲ 閉じる" : "+ 定型アクションをセットする"}
                    </button>

                    {showTemplates && (
                        <div className="template-area">
                            <div className="add-template-row">
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="新しい定型アクション..."
                                />
                                <button className="btn-green-plus" onClick={handleAddTemplate} title="登録">
                                    <IconPlus size={14} />
                                </button>
                            </div>
                            <ul className="template-list-simple">
                                {templates.map(tmpl => (
                                    <li key={tmpl.id}>
                                        <span>{tmpl.title}</span>
                                        <div className="template-actions">
                                            <button className="btn-use" onClick={() => addFromTemplate(tmpl.title)} title="リストに追加">＋</button>
                                            <button className="btn-del" onClick={() => deleteTemplate(tmpl.id)} title="削除">×</button>
                                        </div>
                                    </li>
                                ))}
                                {templates.length === 0 && <li className="empty-msg">定型アクションはまだありません</li>}
                            </ul>
                        </div>
                    )}

                    <div className="add-task-row">
                        <input
                            type="text"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            placeholder="タスクを追加 (例: 振込)"
                            className="input-task"
                        />
                        <button className="btn-green-plus" onClick={handleAddTask} title="追加">
                            <IconPlus size={14} />
                        </button>
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
            )}
        </div>
    );
}

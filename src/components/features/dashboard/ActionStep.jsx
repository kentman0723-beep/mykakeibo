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

    return (
        <div className="step-container">
            <div className="step-header">
                <span className="step-label green">STEP 4</span>
                <h2>今月のアクション</h2>
            </div>

            <div className="action-card">
                <button
                    className="btn-set-default"
                    onClick={() => setShowTemplates(!showTemplates)}
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
                                <IconPlus size={20} />
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



                // ... inside render (task add button) -> Remove this locally within search range if possible, or just overwrite the whole block.
                    <button className="btn-green-plus" onClick={handleAddTask} title="追加">
                        <IconPlus size={20} />
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
            );
}

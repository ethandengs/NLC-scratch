
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export const DebugEditor = ({ selectedSheepId, onClose }) => {
    const { sheep, updateSheep, prayForSheep, deleteSheep } = useGame();

    const target = (sheep || []).find(s => s.id === selectedSheepId);
    const [name, setName] = useState('');
    const [note, setNote] = useState('');

    // Admin States
    const [selectedType, setSelectedType] = useState('LAMB');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteNameInput, setDeleteNameInput] = useState('');
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

    useEffect(() => {
        if (target) {
            setName(target.name);
            setNote(target.note || '');
            setSelectedType(target.type || 'LAMB');
            // Reset delete state when opening new sheep
            setDeleteConfirmOpen(false);
            setDeleteNameInput('');
        }
    }, [target?.id]);

    if (!target) return null;

    const handleSave = () => {
        updateSheep(target.id, { name, note, type: selectedType });
        onClose();
    };

    const handleResetHealth = () => {
        updateSheep(target.id, { health: 100, status: 'healthy' });
    };

    const handleDelete = () => {
        if (deleteNameInput === target.name) {
            deleteSheep(target.id);
            onClose();
        }
    };

    const handlePray = () => {
        prayForSheep(target.id);
    };

    const isDead = target.status === 'dead';

    // Prayer / Resurrection Logic
    const today = new Date().toDateString();
    const currentCount = (target.lastPrayedDate === today) ? (target.prayedCount || 0) : 0;
    const isFull = !isDead && currentCount >= 3;

    // Button Text
    let buttonText = '';
    if (isDead) {
        buttonText = `🔮 迫切認領禱告 (${target.resurrectionProgress || 0}/5)`;
    } else {
        buttonText = isFull ? '🙏 今日禱告已達上限' : `🙏 為牠禱告 (今日: ${currentCount}/3)`;
    }

    // Status Text
    const getStatusText = (status) => {
        if (status === 'dead') return '已安息 🪦';
        if (status === 'sick') return '生病 (需禱告恢復)';
        if (status === 'injured') return '受傷 (需禱告恢復)';
        return '健康';
    };

    const hasChanges = target && (
        name !== target.name ||
        note !== (target.note || '') ||
        selectedType !== (target.type || 'LAMB')
    );

    return (
        <div className="debug-editor-overlay">
            <div className="debug-editor simple-editor" style={{ width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="editor-header">
                    <h3>{isDead ? '🪦 墓碑' : '📝 小羊資料'}</h3>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <div className="editor-form">
                    <div className="form-group">
                        <label>{isDead ? '墓誌銘 (姓名)' : '姓名'}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={10}
                            placeholder="名字..."
                        />
                    </div>

                    <div className="form-group">
                        <label>狀態</label>
                        <div style={{
                            padding: '8px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                            display: 'flex', flexDirection: 'column', gap: '5px',
                            color: isDead ? '#666' : (target.status === 'healthy' ? 'green' : 'red')
                        }}>
                            <div>
                                {getStatusText(target.status)}
                                {!isDead && <span style={{ marginLeft: '10px' }}>HP: {Math.round(target.health)}%</span>}
                            </div>

                        </div>
                    </div>

                    <div className="form-group">
                        <label>階段 (進化)</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            disabled={isDead}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', opacity: isDead ? 0.6 : 1 }}
                        >
                            <option value="LAMB">🥚 小羊</option>
                            <option value="STRONG">🐏 強壯的羊</option>
                            <option value="HUMAN">🧍 榮耀的羊</option>
                        </select>
                        {isDead && <small style={{ color: '#999', fontSize: '0.8rem' }}>* 復活後才能改變階段</small>}
                    </div>

                    <div className="form-group">
                        <label>備註 / 追憶</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                            placeholder={isDead ? "寫下對牠的負擔..." : "記錄這隻小羊的狀況..."}
                        />
                    </div>

                    <button
                        className="pray-action-btn"
                        onClick={handlePray}
                        disabled={!isDead && isFull}
                        style={{
                            opacity: (!isDead && isFull) ? 0.6 : 1,
                            cursor: (!isDead && isFull) ? 'not-allowed' : 'pointer',
                            background: isDead ? '#9c27b0' : undefined // Purple for magic
                        }}
                    >
                        {buttonText}
                    </button>

                    <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />

                    {/* Reset Confirmation Section */}
                    {resetConfirmOpen ? (
                        <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '8px', border: '1px solid #ffe0b2', marginBottom: '10px' }}>
                            <p style={{ color: '#e65100', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>確定要重置所有資料嗎？(將回到初始健康狀態)</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        updateSheep(target.id, {
                                            health: 100,
                                            status: 'healthy',
                                            type: 'LAMB',
                                            careLevel: 0,
                                            prayedCount: 0,
                                            resurrectionProgress: 0,
                                            note: '',
                                            lastPrayedDate: null
                                        });
                                        setSelectedType('LAMB');
                                        setNote('');
                                        setResetConfirmOpen(false);
                                        onClose();
                                    }}
                                    style={{
                                        flex: 1, padding: '6px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    確認重置
                                </button>
                                <button
                                    onClick={() => setResetConfirmOpen(false)}
                                    style={{
                                        flex: 1, padding: '6px', background: '#fff', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Delete Section */}
                    {deleteConfirmOpen ? (
                        <div style={{ background: '#ffebee', padding: '10px', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
                            <p style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>請問確定要刪除這隻小羊嗎？</p>
                            <p style={{ fontSize: '0.8rem', marginBottom: '8px' }}>請輸入 <strong>{target.name}</strong> 以確認：</p>
                            <input
                                type="text"
                                value={deleteNameInput}
                                onChange={(e) => setDeleteNameInput(e.target.value)}
                                placeholder="輸入名字..."
                                style={{ width: '100%', padding: '6px', marginBottom: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteNameInput !== target.name}
                                    style={{
                                        flex: 1, padding: '6px', background: deleteNameInput === target.name ? '#d32f2f' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    確認刪除
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmOpen(false)}
                                    style={{
                                        flex: 1, padding: '6px', background: '#fff', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Main Actions (Hide if any confirm is open) */}
                    {!deleteConfirmOpen && !resetConfirmOpen && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges}
                                style={{
                                    flex: 1.5, height: '36px', padding: '0 5px',
                                    background: hasChanges ? '#4caf50' : '#ccc',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    cursor: hasChanges ? 'pointer' : 'not-allowed',
                                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                                }}
                            >
                                儲存
                            </button>

                            <button
                                onClick={() => setResetConfirmOpen(true)}
                                style={{ flex: 2, height: '36px', padding: '0 5px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', gap: '5px', whiteSpace: 'nowrap' }}
                                title="重置資料"
                            >
                                🔄 重置資料
                            </button>

                            <button
                                onClick={() => setDeleteConfirmOpen(true)}
                                style={{ flex: 1.2, height: '36px', padding: '0 5px', background: '#ff5252', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                                title="刪除"
                            >
                                🗑️ 刪除
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

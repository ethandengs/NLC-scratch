
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export const DebugEditor = ({ selectedSheepId, onClose }) => {
    const { sheep, updateSheep } = useGame();

    const target = sheep.find(s => s.id === selectedSheepId);
    const [name, setName] = useState('');

    useEffect(() => {
        if (target) setName(target.name);
    }, [target]);

    if (!target) return null;

    const handleSave = () => {
        updateSheep(target.id, { name });
        onClose();
    };

    return (
        <div className="debug-editor-overlay">
            <div className="debug-editor simple-editor">
                <div className="editor-header">
                    <h3>📝 Sheep Details</h3>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <div className="editor-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={10}
                        />
                    </div>

                    <div className="form-group">
                        <label>Condition</label>
                        <select
                            value={target.status}
                            onChange={(e) => updateSheep(target.id, { status: e.target.value })}
                        >
                            <option value="healthy">Healthy (正常)</option>
                            <option value="sick">Sick (生病)</option>
                            <option value="injured">Injured (受傷)</option>
                        </select>
                    </div>

                    <div className="hint-text">
                        Health: {Math.round(target.health)}%
                    </div>

                    <button className="save-btn" onClick={handleSave}>Done</button>
                </div>
            </div>
        </div>
    );
};

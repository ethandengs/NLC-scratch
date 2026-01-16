
import React from 'react';

export const Guide = ({ onClose }) => {
    return (
        <div className="debug-editor-overlay">
            <div className="simple-editor" style={{ width: '400px', textAlign: 'left' }}>
                <div className="editor-header">
                    <h3>📖 Shepherd's Manual</h3>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <h4>1. Caring for your Flock</h4>
                    <p>Welcome, Shepherd! Your goal is to raise a happy, healthy flock.</p>

                    <h4>2. The Daily Prayer</h4>
                    <p><strong>Requirement:</strong> You must pray for each sheep at least <strong>once a day</strong>.</p>
                    <p>Sheep lose health over time. If you leave them alone for too long (24 hours+), they will become very weak!</p>

                    <h4>3. Health & Visuals</h4>
                    <p>Keep an eye on your sheep's appearance:</p>
                    <ul>
                        <li><strong>Healthy:</strong> Plump and happy.</li>
                        <li><strong>Weak:</strong> They will look visibly <strong>thinner</strong> and smaller.</li>
                        <li><strong>Sick:</strong> They turn pale and shake.</li>
                    </ul>

                    <h4>4. Consequences</h4>
                    <p>If a sheep is neglected for too long:</p>
                    <ul>
                        <li>It may get sick (🤢).</li>
                        <li>It may get injured (🤕).</li>
                        <li>In extreme cases, it will <strong>Run Away</strong> forever! 🏃</li>
                    </ul>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        <em>"A watchful shepherd brings peace to the pasture."</em>
                    </p>
                </div>

                <div className="editor-actions">
                    <button className="save-btn" onClick={onClose}>I Understand</button>
                </div>
            </div>
        </div>
    );
};

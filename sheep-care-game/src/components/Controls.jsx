
import React from 'react';
import { useGame } from '../context/GameContext';

export const Controls = () => {
    const { adoptSheep, prayerCount, inventory, sheep } = useGame();

    return (
        <div className="controls-container">
            <div className="stats-panel">
                <div>Prayers Offered: {prayerCount} 🙏</div>
                <div>Flock collected: {inventory.length} 📜</div>
            </div>

            <button
                className="action-btn adopt-btn"
                onClick={adoptSheep}
                disabled={sheep.length >= 3}
            >
                Summon Lamb 🔔
            </button>
        </div>
    );
};


import React from 'react';
import { useGame } from '../context/GameContext';
import { Sheep } from './Sheep';

export const Field = ({ onSelectSheep }) => {
    const { sheep, prayForSheep, shepherdSheep, message } = useGame();

    return (
        <div className="field-container">
            <div className="sky"></div>

            {message && (
                <div className="toast-message">
                    {message}
                </div>
            )}

            <div className="grass">
                {sheep.map(s => (
                    <Sheep
                        key={s.id}
                        sheep={s}
                        onPray={prayForSheep}
                        onShepherd={shepherdSheep}
                        onSelect={onSelectSheep}
                    />
                ))}
                {sheep.length === 0 && (
                    <div className="empty-state">
                        The pasture is quiet...<br />
                        (Sheep will run away if not cared for!)
                    </div>
                )}
            </div>
        </div>
    );
};

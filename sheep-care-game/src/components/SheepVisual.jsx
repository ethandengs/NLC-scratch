
import React from 'react';
import './SheepVisual.css';

export const SheepVisual = ({ type, state, status, health = 100 }) => {
    // Determine color/style based on type/status
    const isGolden = type === 'GOLDEN';
    const isSick = status === 'sick';
    const isInjured = status === 'injured';

    const bodyColor = isGolden ? '#ffd700' : isSick ? '#aaccbb' : '#ffffff';
    const woolClass = isGolden ? 'wool-golden' : 'wool-white';

    // Scale body width based on health
    // Range: 100 health -> 1.0 scale
    // Range: 0 health -> 0.7 scale (very skinny)
    const healthScale = 0.7 + (health / 100) * 0.3;

    return (
        <div className={`sheep-visual-comp ${state} ${status}`}>
            {/* Legs */}
            <div className="leg leg-fl"></div>
            <div className="leg leg-fr"></div>
            <div className="leg leg-bl"></div>
            <div className="leg leg-br"></div>

            {/* Body - Scaled horizontally for thinness */}
            <div
                className="body"
                style={{
                    backgroundColor: bodyColor,
                    transform: `scaleX(${healthScale}) scaleY(${healthScale > 0.9 ? 1 : 0.9})`, // Also slightly shorter if very weak
                    transformOrigin: 'center center'
                }}
            >
                <div className={`wool ${woolClass}`}></div>
            </div>

            {/* Head */}
            <div className="head" style={{ backgroundColor: bodyColor }}>
                <div className="eye eye-l"></div>
                <div className="eye eye-r"></div>
                <div className="ear ear-l"></div>
                <div className="ear ear-r"></div>
            </div>

            {/* Tail */}
            <div className="tail" style={{ backgroundColor: bodyColor }}></div>

            {/* VFX */}
            {isInjured && <div className="bandage">🤕</div>}
            {isSick && <div className="bubbles">🫧</div>}
        </div>
    );
};

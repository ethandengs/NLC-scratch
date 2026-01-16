
import React from 'react';
import { SheepVisual } from './SheepVisual';
import { SHEEP_TYPES } from '../data/sheepData';

export const Sheep = ({ sheep, onPray, onShepherd, onSelect }) => {
    const isGolden = sheep.type === 'GOLDEN';

    // Depth Logic
    // y = 0 -> Close (Bottom), y = 100 -> Far (Top of grass)
    // bottom%: 0% .. ~50% (Max grass height)
    // Let's assume Grass is bottom 60% of screen.
    // We want range: Bottom 5% to Bottom 50%
    const bottomPos = 5 + (sheep.y || 0) * 0.45;

    // Scale: Close = 1.0, Far = 0.6
    const depthScale = 1.0 - ((sheep.y || 0) / 250); // Minor scaling

    // Z-Index: Closer (lower Y) = Higher Z
    const zIdx = Math.floor(1000 - (sheep.y || 0));

    return (
        <div
            className="sheep-wrapper"
            style={{
                left: `${sheep.x}%`,
                bottom: `${bottomPos}%`,
                position: 'absolute',
                transition: 'left 0.5s linear, bottom 0.5s linear', // Smooth movement
                zIndex: zIdx,
                transform: `scale(${depthScale})`, // Scale for perspective
                transformOrigin: 'bottom center'
            }}
        >
            {/* Name Tag */}
            <div className="sheep-name-tag">
                {sheep.name}
                {isGolden && ' 🌟'}
            </div>

            {/* Visual Container (Flippable) */}
            <div
                style={{
                    transform: `scaleX(${sheep.direction})`, // Only flip here
                    cursor: 'pointer'
                }}
                onClick={(e) => {
                    e.preventDefault();
                    onPray(sheep.id);
                }}
            >
                <SheepVisual
                    type={sheep.type}
                    state={sheep.state}
                    status={sheep.status}
                    health={sheep.health}
                />
            </div>

            {/* Stats / Actions (Non-Flipped) */}
            <div className="sheep-actions">
                <div className="mini-health-bar">
                    <div
                        className="mini-health-fill"
                        style={{ width: `${sheep.health}%`, backgroundColor: sheep.health < 30 ? 'red' : 'orange' }}
                    ></div>
                </div>

                {!isGolden && (
                    <button
                        className="icon-btn edit-trigger"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(sheep);
                        }}
                    >
                        ✏️
                    </button>
                )}
                {isGolden && (
                    <button
                        className="icon-btn shepherd-trigger"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShepherd(sheep.id);
                        }}
                    >
                        🌿
                    </button>
                )}
            </div>
        </div>
    );
};

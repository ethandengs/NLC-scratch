
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Sheep } from './Sheep';

export const Field = ({ onSelectSheep }) => {
    const { sheep, prayForSheep, shepherdSheep, message } = useGame();

    // Generate static decorations once
    const decorations = useMemo(() => {
        const items = [];
        // Trees
        for (let i = 0; i < 8; i++) {
            items.push({
                id: `tree-${i}`,
                type: 'tree',
                emoji: '🌲',
                x: Math.random() * 90 + 5,
                y: Math.random() * 90 // Depth
            });
        }
        // Rocks
        for (let i = 0; i < 5; i++) {
            items.push({
                id: `rock-${i}`,
                type: 'rock',
                emoji: '🪨',
                x: Math.random() * 90 + 5,
                y: Math.random() * 90
            });
        }
        // Graveyard Boundary Rocks (Fan Shape)
        // Center (0, 100), Radius ~28
        // Arc from 0 to 90 degrees (relative to vertical down? No, relative to center)
        // Math: x = R * sin(theta), y = 100 - R * cos(theta)
        // Theta 0 (Down along left edge) to 90 (Right along top edge)?
        // Wait, standard polar: x = R cos, y = R sin.
        // Let's sweep from "Bottom of Arc" (x=0, y=100-R -> Theta=270?)
        // Let's simpler: Loop theta 0 to PI/2.
        // x = R * sin(theta) -> 0 to R
        // y = 100 - R * cos(theta) -> 100-R to 100
        const R = 28;
        for (let theta = 0; theta <= Math.PI / 2; theta += 0.12) {
            // Create Gap for Gate (approx PI/4 = 0.78). Gate is bigger now.
            if (theta > 0.65 && theta < 0.95) continue;

            items.push({
                id: `grave-wall-arc-${theta}`, type: 'rock', emoji: '🪨',
                x: R * Math.sin(theta) + (Math.random() * 2),
                y: 100 - R * Math.cos(theta) + (Math.random() * 2)
            });
        }

        // Gate & Signboard
        // Gate at theta ~ 0.8
        const gateTheta = 0.8;
        items.push({
            id: 'grave-gate', type: 'gate', emoji: '⛩️',
            x: R * Math.sin(gateTheta),
            y: 100 - R * Math.cos(gateTheta),
            scale: 2.5
        });

        // Signboard next to gate
        items.push({
            id: 'grave-sign', type: 'sign', emoji: '🪧',
            x: R * Math.sin(gateTheta - 0.3) + 3, // Slightly to side
            y: 100 - R * Math.cos(gateTheta - 0.3),
            scale: 2.2,
            hasLabel: true,
            label: '安息之地'
        });

        // Sort by Y for z-index
        return items.sort((a, b) => b.y - a.y); // Should handle via CSS z-index actually
    }, []);

    return (
        <div className="field-container">
            <div className="sky"></div>

            {message && (
                <div className="toast-message">
                    {message}
                </div>
            )}

            <div className="grass">
                {/* Graveyard Visual Zone (Fan Shape) */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '35%', height: '35%', // Roughly covers the arc area
                    background: 'radial-gradient(circle at top left, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.2) 60%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}>
                    {/* Text removed, moved to signboard */}
                </div>
                {/* Render Decorations */}
                {decorations.map(d => {
                    const bottomPos = 5 + d.y * 0.9; // Map 0-100 Y to Screen%
                    const scale = 1.0 - (d.y / 200);
                    const zIdx = Math.floor(1000 - d.y);

                    return (
                        <div
                            key={d.id}
                            className="decoration"
                            style={{
                                left: `${d.x}%`,
                                bottom: `${bottomPos}%`,
                                zIndex: zIdx,
                                transform: `scale(${scale})`
                            }}
                        >
                            {d.emoji}
                            {d.hasLabel && (
                                <div style={{
                                    position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                                    background: '#5d4037', color: '#ffecb3', padding: '1px 5px', borderRadius: '3px',
                                    fontSize: '0.5rem', whiteSpace: 'nowrap', border: '1px solid #3e2723', fontWeight: 'bold',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)', width: 'auto'
                                }}>
                                    {d.label}
                                </div>
                            )}
                        </div>
                    );
                })}

                {(sheep || []).map(s => (
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
                        牧場靜悄悄的...<br />
                        (快來認領新增小羊!)
                    </div>
                )}
            </div>
        </div>
    );
};

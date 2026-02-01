
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateScene } from '../utils/SceneGenerator';
import '../styles/design-tokens.css';

export const AssetBackground = ({ userId, weather }) => {
    // Generate the deterministic scene for this user
    const scene = useMemo(() => generateScene(userId), [userId]);

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            overflow: 'hidden', zIndex: 0,
            background: 'var(--color-sky)', // Token-based Sky
            fontSize: '10px' // Base scale factor for em units
        }}>
            {/* --- 1. CLOUDS (Z=1) --- */}
            <div className="cloud-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                {scene.clouds.map((cloud, i) => (
                    <motion.img
                        key={`cloud-${i}`}
                        src={cloud.src}
                        style={{
                            position: 'absolute',
                            top: `${cloud.y}%`,
                            left: `${cloud.x}%`,
                            width: `${10 * cloud.scale}%`,
                            opacity: 0.8
                        }}
                        initial={{ x: 0 }}
                        animate={{ x: ['-10%', '10%'] }} // Gentle drift, not full crossing
                        transition={{
                            duration: cloud.duration,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut'
                        }}
                    />
                ))}
            </div>

            {/* --- 2. MOUNTAIN ZONE (Z=2) --- */}
            {scene.elements.filter(e => e.type === 'MOUNTAIN').map(m => (
                <img
                    key={m.id}
                    src={m.src}
                    style={{
                        position: 'absolute',
                        left: `${m.x}%`,
                        bottom: `${m.y}%`,
                        // Pivot: Move down by 20% of element height to bury base
                        transform: `translate(-50%, 20%) scale(${m.scale})`,
                        zIndex: 1, // Lowered to 1
                        opacity: 0.9
                    }}
                />
            ))}

            {/* --- 2.5. TREES (Z=2 - Behind Grass) --- */}
            {scene.elements.filter(e => e.type === 'TREE').map(t => (
                <motion.img
                    key={t.id}
                    src={t.src}
                    style={{
                        position: 'absolute',
                        left: `${t.x}%`,
                        // Pivot: Bottom is Horizon Y - 10% of Height (Reduced from 20%)
                        bottom: `calc(${t.y}% - ${(150 * t.scale) * 0.1}px)`,
                        height: `${150 * t.scale}px`,
                        zIndex: 2,
                        transformOrigin: 'bottom center'
                    }}
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{
                        duration: t.duration,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            ))}

            {/* --- 3. GRASS FIELD BASE (The "Middle" Zone) (Z=3) --- */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '65%', // Matches Horizon Y
                background: 'var(--color-grass-base)',
                zIndex: 3
            }} />

            {/* --- 3.5 HORIZON EDGE (Z=4) --- */}
            {scene.elements.filter(e => e.type === 'HORIZON_GRASS').map(g => (
                <img
                    key={g.id}
                    src={g.src}
                    style={{
                        position: 'absolute',

                        left: `${g.x}em`, // EM based for continuous strip
                        bottom: `65%`, // Explicit alignment with horizontal line
                        width: g.width || '20px',
                        zIndex: 4,
                        pointerEvents: 'none'
                    }}
                />
            ))}



            {/* --- 5. FIELD DECORATIONS (Grass) (Z=6+) --- */}
            {scene.elements.filter(e => e.type === 'GRASS').map(d => (
                <img
                    key={d.id}
                    src={d.src}
                    style={{
                        position: 'absolute',
                        left: `${d.x}%`,
                        bottom: `${d.y}%`,
                        width: '1.2em', // 12px -> 1.2em base size
                        transform: `scale(${d.scale})`,
                        zIndex: Math.floor(100 - d.y) // Depth sort
                    }}
                />
            ))}

            {/* --- 6. FOREGROUND ZONE (Token Color Block) (Z=100) --- */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', // Container covers full screen to allow FG elements to be placed relatively if needed, but actually we just need a container.
                // Actually the previous code had height 15%. Let's make it a full overlay or just a container.
                // The FG block itself is 33%.
                pointerEvents: 'none',
                zIndex: 100
            }}>
                {/* A. Base Block (The actual terrain) */}
                <div style={{
                    width: '100%', height: '33%',
                    position: 'absolute', bottom: 0, left: 0,
                    background: scene.foreground.baseColor,
                }} />

                {/* B. Foreground Seam (Line of Bushes + Edges) */}
                {scene.elements.filter(e => e.type === 'FOREGROUND_SEAM_ITEM').map(item => (
                    <img
                        key={item.id}
                        src={item.src}
                        style={{
                            position: 'absolute',
                            left: `${item.x}em`,
                            bottom: `33%`,
                            width: item.width,
                            transform: `scale(${item.scale}) ${item.subType === 'BUSH' ? 'translateY(20%)' : ''}`,
                            transformOrigin: 'bottom center',
                            zIndex: 101,
                            pointerEvents: 'none'
                        }}
                    />
                ))}

                {/* C. Surface Grass */}
                {scene.foreground.decorations.filter(d => d.type === 'GRASS').map(g => (
                    <img
                        key={g.id}
                        src={g.src}
                        style={{
                            position: 'absolute',
                            left: `${g.x}%`,
                            bottom: `${g.y}%`, // Fixed: top -> bottom
                            width: '1.2em',
                            transform: `scale(${g.scale})`,
                            zIndex: 102
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

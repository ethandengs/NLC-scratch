import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateScene } from '../utils/SceneGenerator';
import '../styles/design-tokens.css'; // Ensure tokens are available

export const AssetBackground = ({ userId, weather }) => {
    // Generate the deterministic scene for this user
    const scene = useMemo(() => generateScene(userId), [userId]);

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            overflow: 'hidden', zIndex: 0,
            background: 'linear-gradient(to bottom, #FFF3E0 0%, #FFE0B2 100%)' // Fallback Sky
        }}>
            {/* --- 1. SKY & CLOUDS --- */}
            {/* If we have a sky asset, use it. Otherwise CSS gradient above handles it. 
                 But let's use the asset if provided. */}
            <img
                src={scene.background}
                alt="sky"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                onError={(e) => e.target.style.display = 'none'}
            />

            {/* Drifting Clouds */}
            <div className="cloud-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '30%', zIndex: 1, pointerEvents: 'none' }}>
                {scene.clouds.map((cloudSrc, i) => (
                    <motion.img
                        key={`cloud-${i}`}
                        src={cloudSrc}
                        style={{
                            position: 'absolute',
                            top: `${10 + (i * 5)}%`, // Staggered heights
                            width: `${15 + (i * 5)}%`, // Varied sizes
                            opacity: 0.8
                        }}
                        initial={{ x: `${-20 - (i * 20)}%` }}
                        animate={{ x: ['-20%', '120%'] }}
                        transition={{
                            duration: 40 + (i * 10), // Parallax speed (farther = slower? Usually inverse for clouds but varying is good)
                            repeat: Infinity,
                            ease: 'linear',
                            delay: i * 5 // Stagger start
                        }}
                    />
                ))}
            </div>

            {/* --- 2. MOUNTAINS (Deep Background) --- */}
            {scene.elements.filter(e => e.type === 'MOUNTAIN').map(m => (
                <img
                    key={m.id}
                    src={m.src}
                    style={{
                        position: 'absolute',
                        left: `${m.x}%`,
                        bottom: `${m.y}%`,
                        transform: `translate(-50%, 0) scale(${m.scale})`,
                        zIndex: 2,
                        opacity: 0.9 // Atmospheric perspective
                    }}
                />
            ))}

            {/* --- 3. HORIZON EDGE (Grass Strip) --- */}
            {/* Needs to be behind trees? Or mixed? 
                 Plan says "Horizon Edge (~30%)". Trees are "Horizon Zone (15-25%)".
                 Usually trees stand ON the horizon. So Edge should be arguably at the same level or slightly in front of mtn but behind trees.
                 Let's put it Z=3. Trees Z=5.
            */}
            {scene.elements.filter(e => e.type === 'HORIZON_GRASS').map(g => (
                <img
                    key={g.id}
                    src={g.src}
                    style={{
                        position: 'absolute',
                        left: `${g.x}%`,
                        bottom: `${g.y}%`,
                        width: '21%', // Slightly overlap 20% strips
                        zIndex: 3,
                        transform: 'scaleY(1.2)' // Add some height
                    }}
                />
            ))}

            {/* --- 4. TREES (Horizon Line) --- */}
            {scene.elements.filter(e => e.type === 'TREE').map(t => (
                <motion.img
                    key={t.id}
                    src={t.src}
                    style={{
                        position: 'absolute',
                        left: `${t.x}%`,
                        bottom: `${t.y}%`,
                        height: `${150 * t.scale}px`, // Approximate height
                        zIndex: 5,
                        transformOrigin: 'bottom center'
                    }}
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{
                        duration: 4 + Math.random() * 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            ))}

            {/* --- 5. PLAY ZONE DECORATIONS (Rocks/Grass) --- */}
            {scene.elements.filter(e => e.type === 'ROCK' || e.type === 'GRASS').map(d => (
                <img
                    key={d.id}
                    src={d.src}
                    style={{
                        position: 'absolute',
                        left: `${d.x}%`,
                        bottom: `${d.y}%`,
                        width: d.type === 'ROCK' ? '60px' : '40px',
                        transform: `scale(${d.scale})`,
                        zIndex: Math.floor(100 - d.y) // Simple depth sorting handled by parent loop order usually, but CSS z-index helps
                    }}
                />
            ))}

            {/* --- 6. FOREGROUND ZONE (Smart Construction) --- */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '15%',
                zIndex: 100 // On top of everything
            }}>
                {/* A. Base Block */}
                <div style={{
                    width: '100%', height: '100%',
                    background: scene.foreground.baseColor,
                    // Optional: Add a subtle texture or gradient if needed
                    clipPath: 'polygon(0% 20%, 5% 15%, 10% 20%, 15% 10%, 20% 20%, 25% 15%, 30% 25%, 40% 10%, 50% 20%, 60% 10%, 70% 25%, 80% 10%, 90% 20%, 100% 10%, 100% 100%, 0% 100%)'
                    // The clip path creates a rough "grassy" top edge as a base, 
                    // providing a fallback if bushes don't load or gaps exist.
                }} />

                {/* B. Edge Bushes */}
                {scene.foreground.decorations.filter(d => d.type === 'BUSH').map(b => (
                    <img
                        key={b.id}
                        src={b.src}
                        style={{
                            position: 'absolute',
                            left: `${b.x}%`,
                            top: `${b.y - 40}%`, // Shift up to sit ON the edge
                            width: '120px',
                            transform: `translate(-50%, 0) scale(${b.scale}) rotate(${b.rotation}deg)`,
                            zIndex: 101
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
                            top: `${g.y}%`,
                            width: '40px',
                            transform: `scale(${g.scale})`,
                            zIndex: 102
                        }}
                    />
                ))}
            </div>

            {/* Weather Overlay support from original design could be re-integrated here if needed, 
                but for now we focus on the static scene */}
        </div>
    );
};

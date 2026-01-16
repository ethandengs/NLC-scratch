
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHEEP_TYPES } from '../data/sheepData';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [sheep, setSheep] = useState(() => {
        try {
            const saved = localStorage.getItem('sheep_game_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                const now = Date.now();
                const lastSave = parsed.lastSave || now;
                const diffHours = (now - lastSave) / (1000 * 60 * 60);

                // Offline decay logic
                const decayAmount = (diffHours / 24) * 80;
                return parsed.sheep.map(s => {
                    const newHealth = Math.max(0, s.health - decayAmount);
                    let newStatus = s.status;
                    if (newHealth < 50 && s.status === 'healthy') {
                        if (Math.random() < 0.5) newStatus = 'sick';
                    }
                    return { ...s, health: newHealth, status: newStatus };
                });
            }
        } catch (e) { console.error(e); }
        return [];
    });

    const [inventory, setInventory] = useState([]);
    const [message, setMessage] = useState(null);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    useEffect(() => {
        const saveInterval = setInterval(() => {
            const data = { sheep, lastSave: Date.now() };
            localStorage.setItem('sheep_game_data', JSON.stringify(data));
        }, 5000);
        return () => clearInterval(saveInterval);
    }, [sheep]);

    const adoptSheep = () => {
        const newSheep = {
            id: Date.now(),
            name: 'Lamb',
            type: 'LAMB',
            careLevel: 0,
            health: 100,
            strength: 0,
            status: 'healthy',
            state: 'idle',
            x: Math.random() * 80 + 10,   // 10-90% Width
            y: Math.random() * 80 + 5,    // 5-85% Depth (0=Bottom, 100=Top/Far)
            direction: 1
        };
        setSheep(prev => {
            const list = [...prev, newSheep];
            // Sort by Y so higher Y (further back) is rendered first (behind)
            // Wait, HTML renders bottom-up. So first element = back?
            // Actually z-index is easier. We will use z-index in component.
            return list;
        });
    };

    const updateSheep = (id, updates) => {
        setSheep(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    useEffect(() => {
        const tick = setInterval(() => {
            setSheep(prevSheep => {
                return prevSheep
                    .map(s => {
                        // --- Movement (2D) ---
                        let { x, y, state, direction } = s;

                        // Ensure Y exists for old saves
                        if (y === undefined) y = Math.random() * 50;

                        if (state === 'idle') {
                            if (Math.random() < 0.2) {
                                state = 'walking';
                                direction = Math.random() > 0.5 ? 1 : -1;
                            }
                        } else if (state === 'walking') {
                            if (Math.random() < 0.2) {
                                state = 'idle';
                            } else {
                                x += direction * 2;

                                // Wander up/down slightly
                                if (Math.random() < 0.5) y += (Math.random() - 0.5) * 5;

                                // Bounds
                                if (x < 5) { x = 5; direction = 1; }
                                if (x > 95) { x = 95; direction = -1; }

                                if (y < 0) y = 0;
                                if (y > 90) y = 90; // Don't walk into sky too much
                            }
                        }

                        // --- Stats Decay ---
                        const decayRate = s.status === 'sick' ? 0.2 : s.status === 'injured' ? 0.1 : 0.02;
                        const newHealth = Math.max(0, s.health - decayRate);

                        let newStatus = s.status;
                        if (newHealth < 50 && s.status === 'healthy') {
                            if (Math.random() < 0.005) newStatus = 'sick';
                        }

                        if (newHealth < 10 && Math.random() < 0.01) {
                            showMessage(`Oh no! ${s.name} ran away! 😢`);
                            return null;
                        }

                        return { ...s, x, y, state, direction, health: newHealth, status: newStatus };
                    })
                    .filter(Boolean);
            });
        }, 500);

        return () => clearInterval(tick);
    }, []);

    const prayForSheep = (id) => {
        setSheep(prev => prev.map(s => {
            if (s.id !== id) return s;
            if (s.status !== 'healthy') return { ...s, status: 'healthy', health: Math.min(100, s.health + 20) };
            if (s.health < 100) return { ...s, health: Math.min(100, s.health + 10) };

            const newStrength = Math.min(100, s.strength + 10);
            const newCare = s.careLevel + 10;
            const currentType = SHEEP_TYPES[s.type];

            if (currentType.nextStage && newCare >= currentType.growthThreshold) {
                return {
                    ...s, strength: newStrength, careLevel: 0, type: currentType.nextStage.toUpperCase()
                };
            }
            return { ...s, strength: newStrength, careLevel: newCare };
        }));
    };

    const shepherdSheep = (id) => {
        const target = sheep.find(s => s.id === id);
        if (!target) return;
        setInventory(prev => [...prev, { ...target, collectedAt: new Date() }]);
        setSheep(prev => prev.filter(s => s.id !== id));
    };

    return (
        <GameContext.Provider value={{
            sheep, inventory, message,
            adoptSheep, prayForSheep, shepherdSheep, updateSheep
        }}>
            {children}
        </GameContext.Provider>
    );
};

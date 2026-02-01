import { ASSETS, getRandomAsset } from './AssetRegistry';

// Simple Linear Congruential Generator for seeded randomness
class SeededRandom {
    constructor(seedString) {
        // Convert string to numeric seed
        let h = 0x811c9dc5;
        for (let i = 0; i < seedString.length; i++) {
            h ^= seedString.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        this.seed = h >>> 0;
    }

    // Returns float between 0 and 1
    next() {
        this.seed = (Math.imul(this.seed, 1664525) + 1013904223) | 0;
        return ((this.seed >>> 0) / 4294967296); // Normalize to 0-1
    }

    // Returns float between min and max
    range(min, max) {
        return min + this.next() * (max - min);
    }
}

/**
 * Generates a consistent scene layout for a specific user.
 * @param {string} userId - The user ID to seed the generation.
 * @returns {object} - Structured scene data (mountains, trees, foreground, etc.)
 */
export const generateScene = (userId = 'guest') => {
    const rng = new SeededRandom(userId);
    const elements = [];

    // --- Helper: Check Collision (Simple Distance Check) ---
    // Returns true if position (x, y) collides with any existing element of similar type
    // We treat x as primary factor (horizontal overlap) because y provides depth.
    // However, for pure 2D composition, we check Euclidean distance scaled for aspect ratio.
    const isColliding = (x, y, existingElements, threshold = 8) => {
        for (let el of existingElements) {
            // Only check collision against same 'layer' or visually similar items
            // But here we just want to avoid clutter generally.
            const dx = x - el.x;
            const dy = (y - el.y) * 2; // Weight Y more heavily? No, usually Y is depth.
            // Let's just check simple distance.
            const dist = Math.sqrt(dx * dx + (y - el.y) * (y - el.y));
            if (dist < threshold) return true;
        }
        return false;
    };

    // --- 1. MOUNTAIN ZONE (Deep Background) ---
    // y: 65%+, Sits on horizon
    const numMountains = Math.floor(rng.range(2, 4));
    const mountainAssets = ASSETS.ENVIRONMENT.MOUNTAINS.BG;
    for (let i = 0; i < numMountains; i++) {
        // Pick random variant
        const src = mountainAssets[Math.floor(rng.range(0, mountainAssets.length))];
        elements.push({
            id: `mtn-${i}`,
            type: 'MOUNTAIN',
            src: src,
            x: rng.range(0, 100),
            y: rng.range(65, 70), // On Horizon
            scale: rng.range(2, 3),
            zIndex: 0
        });
    }

    // --- 2. HORIZON ZONE (Tree Line) ---
    // y: Fixed at 65% (Horizon Line)
    // Dense line of trees, STRICTLY GROUNDED.
    const numTrees = Math.floor(rng.range(12, 18)); // Slightly reduced from 25 to avoid chaos
    const trees = [];
    for (let i = 0; i < numTrees; i++) {
        let attempts = 0;
        let x = 0;
        let valid = false;

        // Try to find a non-overlapping spot
        while (attempts < 10 && !valid) {
            x = rng.range(-10, 110);
            if (!isColliding(x, 65, trees, 6)) { // Threshold 6% width
                valid = true;
            }
            attempts++;
        }

        if (valid || i < 5) { // Always authorize at least 5 trees even if overlapping
            trees.push({
                id: `tree-${i}`,
                type: 'TREE',
                src: getRandomAsset(ASSETS.DECORATIONS.TREES),
                x: x,
                y: 65, // STRICTLY ON HORIZON LINE
                scale: rng.range(0.6, 1.0),
                zIndex: 5
            });
        }
    }
    elements.push(...trees);

    // --- 3. HORIZON EDGE (Grass Strip) ---
    // y: ~65% (Seam)
    const stripWidth = 20;
    const numStrips = Math.ceil(100 / stripWidth) + 2;
    for (let i = 0; i < numStrips; i++) {
        elements.push({
            id: `horizon-grass-${i}`,
            type: 'HORIZON_GRASS',
            src: getRandomAsset(ASSETS.DECORATIONS.GRASS_EDGES),
            x: (i * stripWidth) - 10,
            y: 64, // Precise alignment with horizon color block
            scale: 1,
            zIndex: 6
        });
    }

    // --- 4. PLAY ZONE (The Field) ---
    // y: 15-60% (Between foreground and horizon)
    const numFieldGrass = Math.floor(rng.range(8, 15)); // Reduced count
    const fieldItems = [];
    for (let i = 0; i < numFieldGrass; i++) {
        let attempts = 0;
        let x = 0, y = 0;
        let valid = false;

        while (attempts < 10 && !valid) {
            x = rng.range(5, 95);
            y = rng.range(15, 60);
            // Check against other field grass
            if (!isColliding(x, y, fieldItems, 10)) {
                valid = true;
            }
            attempts++;
        }

        if (valid) {
            fieldItems.push({
                id: `field-grass-${i}`,
                type: 'GRASS',
                src: getRandomAsset(ASSETS.DECORATIONS.GRASS),
                x: x,
                y: y,
                scale: rng.range(0.5, 0.8),
                zIndex: Math.floor(100 - y) // Higher Y = Farther = Lower Z
            });
        }
    }
    elements.push(...fieldItems);

    // --- 5. FOREGROUND ZONE (Color Block + Decoration) ---
    // y: 0-15%
    const foregroundDecor = [];
    const numFgGrass = Math.floor(rng.range(4, 8));
    for (let i = 0; i < numFgGrass; i++) {
        // Simple scatter for foreground
        foregroundDecor.push({
            id: `fg-grass-${i}`,
            type: 'GRASS',
            src: getRandomAsset(ASSETS.DECORATIONS.GRASS),
            x: rng.range(0, 100),
            y: rng.range(20, 80), // Relative to FG container
            scale: rng.range(0.8, 1.2),
            zIndex: 102
        });
    }

    return {
        // useTokens flag tells renderer to use CSS vars instead of image src
        useTokens: true,
        elements: elements.sort((a, b) => a.zIndex - b.zIndex),
        foreground: {
            decorations: foregroundDecor,
            baseColor: 'var(--color-grass-foreground)'
        },
        clouds: ASSETS.ENVIRONMENT.CLOUDS
    };
};

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

    // --- 1. MOUNTAIN ZONE (Deep Background) ---
    // y: 5-15%, Parallax Factor: Low
    // We place 2-3 massive mountains
    const numMountains = Math.floor(rng.range(2, 4));
    for (let i = 0; i < numMountains; i++) {
        elements.push({
            id: `mtn-${i}`,
            type: 'MOUNTAIN',
            src: ASSETS.ENVIRONMENT.MOUNTAINS.BG,
            x: rng.range(0, 100), // Full width spread
            y: rng.range(10, 15), // Low on horizon (far away)
            scale: rng.range(2, 3), // Huge
            zIndex: 0
        });
    }

    // --- 2. HORIZON ZONE (Tree Line) ---
    // y: 15-25%
    // Dense line of trees to block the bottom of mountains
    const numTrees = Math.floor(rng.range(15, 25));
    for (let i = 0; i < numTrees; i++) {
        elements.push({
            id: `tree-${i}`,
            type: 'TREE',
            src: getRandomAsset(ASSETS.DECORATIONS.TREES),
            x: rng.range(-10, 110), // Overhang edges
            y: rng.range(18, 25),
            scale: rng.range(0.8, 1.5),
            zIndex: 5
        });
    }

    // --- 3. HORIZON EDGE (Grass Strip) ---
    // y: ~28-30%
    // Tiled grass strip to create a clean line
    // We place enough to cover 0-100% width
    const stripWidth = 20; // Assume each strip covers ~20% width
    const numStrips = Math.ceil(100 / stripWidth) + 2;
    for (let i = 0; i < numStrips; i++) {
        elements.push({
            id: `horizon-grass-${i}`,
            type: 'HORIZON_GRASS',
            src: getRandomAsset(ASSETS.DECORATIONS.GRASS), // Or specific HORIZON asset if we had one
            x: (i * stripWidth) - 10,
            y: 29, // Precise alignment
            scale: 1,
            zIndex: 6
        });
    }

    // --- 4. PLAY ZONE (The Field) ---
    // y: 30-85%
    // Sparse Rocks and Grass patches
    const numRocks = Math.floor(rng.range(3, 6));
    for (let i = 0; i < numRocks; i++) {
        const y = rng.range(35, 80);
        elements.push({
            id: `rock-${i}`,
            type: 'ROCK',
            src: getRandomAsset(ASSETS.DECORATIONS.ROCKS),
            x: rng.range(5, 95),
            y: y,
            scale: rng.range(0.6, 1.0),
            zIndex: Math.floor(y) // Sorting by depth
        });
    }

    const numFieldGrass = Math.floor(rng.range(10, 20));
    for (let i = 0; i < numFieldGrass; i++) {
        const y = rng.range(35, 80);
        elements.push({
            id: `field-grass-${i}`,
            type: 'GRASS',
            src: getRandomAsset(ASSETS.DECORATIONS.GRASS),
            x: rng.range(5, 95),
            y: y,
            scale: rng.range(0.5, 0.8),
            zIndex: Math.floor(y)
        });
    }

    // --- 5. FOREGROUND ZONE (Smart Construction) ---
    // y: 85-100%
    // We don't just place items, we define the "Block" parameters
    // The renderer will draw the SVG path. Here we place the DECORATIONS for it.
    const foregroundDecor = [];

    // Top Edge Bushes (The silhouette)
    // Place them along the top rim (e.g. y=0 relative to foreground container)
    const numBushes = Math.floor(rng.range(8, 12));
    for (let i = 0; i < numBushes; i++) {
        foregroundDecor.push({
            id: `fg-bush-${i}`,
            type: 'BUSH',
            src: getRandomAsset(ASSETS.DECORATIONS.BUSHES),
            x: rng.range(-5, 105),
            y: rng.range(-5, 0), // Perched on top edge
            scale: rng.range(1.0, 1.4),
            rotation: rng.range(-5, 5),
            zIndex: 101 // On top of the block
        });
    }

    // Surface Grass (Detail)
    const numFgGrass = Math.floor(rng.range(5, 10));
    for (let i = 0; i < numFgGrass; i++) {
        foregroundDecor.push({
            id: `fg-grass-${i}`,
            type: 'GRASS',
            src: getRandomAsset(ASSETS.DECORATIONS.GRASS),
            x: rng.range(0, 100),
            y: rng.range(10, 80), // Scattered on the face
            scale: rng.range(0.8, 1.2),
            zIndex: 102
        });
    }

    return {
        background: ASSETS.ENVIRONMENT.SKY.DAY_GRAIDENT,
        elements: elements.sort((a, b) => a.zIndex - b.zIndex), // Pre-sort by Z
        foreground: {
            decorations: foregroundDecor,
            baseColor: '#81C784' // Or load from token/asset
        },
        clouds: ASSETS.ENVIRONMENT.CLOUDS // Pass raw list for the component to animate
    };
};

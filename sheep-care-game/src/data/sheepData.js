
export const SHEEP_TYPES = {
  LAMB: {
    id: 'lamb',
    name: 'Little Lamb',
    description: 'A small, innocent lamb looking for guidance.',
    growthThreshold: 100,
    nextStage: 'faithful',
    icon: '🐑'
  },
  FAITHFUL: {
    id: 'faithful',
    name: 'Faithful Sheep',
    description: 'A grown sheep with a steady heart.',
    growthThreshold: 300,
    nextStage: 'golden',
    icon: '🐏'
  },
  GOLDEN: {
    id: 'golden',
    name: 'Golden Ram',
    description: 'A radiant ram that brings blessings.',
    growthThreshold: null, // Final stage
    nextStage: null,
    icon: '🌟'
  }
};

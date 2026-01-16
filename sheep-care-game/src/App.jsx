
import React, { useState } from 'react';
import { Field } from './components/Field';
import { Controls } from './components/Controls';
import { DebugEditor } from './components/DebugEditor';
import { Guide } from './components/Guide';
import './App.css';

function App() {
  const [selectedSheepId, setSelectedSheepId] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleSelectSheep = (sheep) => {
    setSelectedSheepId(sheep.id);
  };

  return (
    <div className="game-container">
      {/* Help Button - Floating Top Right */}
      <button
        className="icon-btn"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 100,
          width: '40px',
          height: '40px',
          fontSize: '1.5rem',
          opacity: 1
        }}
        onClick={() => setShowGuide(true)}
      >
        📖
      </button>

      <Field onSelectSheep={handleSelectSheep} />
      <Controls />

      {selectedSheepId && (
        <DebugEditor
          selectedSheepId={selectedSheepId}
          onClose={() => setSelectedSheepId(null)}
        />
      )}

      {showGuide && (
        <Guide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}

export default App;

// src/RutherfordModel.js
import React from 'react';

const SimulationIFrame = ({url,title}) => {
  return (
    <div style={{ width: '100%', height: '60vh', overflow: 'hidden' }}>
      <iframe
        src={url}
        title={title}
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', overflow: 'hidden', objectFit: 'cover' }}
      ></iframe>
    </div>
  );
};

export default SimulationIFrame;

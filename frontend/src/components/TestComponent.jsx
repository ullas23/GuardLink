import React, { useState } from 'react';

const TestComponent = () => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    console.log('Button clicked! Count:', clickCount + 1);
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '2px solid blue',
      backgroundColor: 'white',
      position: 'relative',
      zIndex: 1
    }}>
      <h3>Button Test Component</h3>
      <p>Click count: {clickCount}</p>
      <button 
        onClick={handleClick}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#667eea', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2
        }}
      >
        Click Me! ({clickCount})
      </button>
      <br /><br />
      <button 
        onClick={() => alert('Alert button works!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc2626', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 2
        }}
      >
        Alert Test
      </button>
    </div>
  );
};

export default TestComponent;

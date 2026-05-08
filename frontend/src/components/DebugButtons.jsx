import React from 'react';

const DebugButtons = () => {
  const handleClick = () => {
    console.log('Button clicked!');
    alert('Button is working!');
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '2px solid red' }}>
      <h3>Debug Buttons</h3>
      <button 
        onClick={handleClick}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'blue', 
          color: 'white',
          marginRight: '10px'
        }}
      >
        Test Button 1
      </button>
      <button 
        onClick={() => console.log('Button 2 clicked')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'green', 
          color: 'white'
        }}
      >
        Test Button 2
      </button>
    </div>
  );
};

export default DebugButtons;

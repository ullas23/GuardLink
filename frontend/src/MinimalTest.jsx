import React, { useEffect } from 'react';

const MinimalTest = () => {
  useEffect(() => {
    console.log('MinimalTest component mounted');
    console.log('React is working');
    
    // Test basic JavaScript
    document.addEventListener('click', () => {
      console.log('Document clicked - JavaScript events work');
    });
    
    return () => {
      console.log('MinimalTest component unmounted');
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    console.log('Button clicked via React handler');
    alert('React button click works!');
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '3px solid red',
      backgroundColor: 'yellow'
    }}>
      <h2>MINIMAL TEST - Check Console</h2>
      <p>If you see this, React is rendering.</p>
      <button 
        onClick={handleClick}
        style={{ 
          padding: '15px 30px', 
          fontSize: '16px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none'
        }}
      >
        CLICK ME - Check Console
      </button>
      <br /><br />
      <button 
        onClick={() => console.log('Inline handler works')}
        style={{ 
          padding: '15px 30px', 
          fontSize: '16px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none'
        }}
      >
        Console Log Test
      </button>
    </div>
  );
};

export default MinimalTest;

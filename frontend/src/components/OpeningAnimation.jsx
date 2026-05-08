import React from 'react';
import '../styles.css';

const OpeningAnimation = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'white'
    }}>
      <h1 
        className="gradient-text title-animation"
        style={{
          fontSize: '72px',
          fontWeight: '700',
          letterSpacing: '2px',
          textAlign: 'center'
        }}
      >
        Guard Link
      </h1>
    </div>
  );
};

export default OpeningAnimation;

import React, { useState, useEffect } from 'react';
import { api } from './api';
import OpeningAnimation from './components/OpeningAnimation';
import MainInterface from './components/MainInterface';
import './styles.css';

function App() {
  const [showOpening, setShowOpening] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    // Check backend health
    const checkBackend = async () => {
      try {
        await api.healthCheck();
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();

    // Hide opening animation after 2.5 seconds
    const timer = setTimeout(() => {
      setShowOpening(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showOpening) {
    return <OpeningAnimation />;
  }

  if (backendStatus === 'disconnected') {
    console.log('Backend disconnected, showing MainInterface anyway');
    // Don't block the UI - show MainInterface even if backend is down
  }

  return (
    <div>
      <MainInterface />
    </div>
  );
}

export default App;

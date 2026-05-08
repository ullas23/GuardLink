import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import InputInterface from './InputInterface';
import ResultsDashboard from './ResultsDashboard';
import Message from './Message';
import { api } from '../api';

const MainInterface = () => {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Load analysis history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('guardlink_history');
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }

    // Load latest report from backend
    loadLatestReport().catch(error => {
      console.error('Failed to load latest report on mount:', error);
    setMessage({
        type: 'error',
        text: 'Failed to load latest analysis report'
      });
    setTimeout(() => setMessage(null), 3000);
  });
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (analysisHistory.length > 0) {
      localStorage.setItem('guardlink_history', JSON.stringify(analysisHistory));
    }
  }, [analysisHistory]);

  const loadLatestReport = async () => {
    try {
      const report = await api.getLatestReport();
      if (report) {
        setCurrentAnalysis(report);
      }
    } catch (error) {
      console.error('Failed to load latest report:', error);
    }
  };

  const handleAnalyze = async (logText, file) => {
    setIsAnalyzing(true);
    setMessage(null);
    setCurrentAnalysis(null);

    try {
      const result = await api.analyzeLogs(logText, file);
      
      // Create session object
      const session = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: file ? file.name : 'Pasted Text',
        preview: logText ? logText.substring(0, 100) + '...' : 'File upload',
        result: result
      };

      // Update state
      setCurrentAnalysis(result);
      setAnalysisHistory(prev => [session, ...prev.slice(0, 9)]); // Keep last 10
      setSelectedSession(session.id);
      
      setMessage({
        type: 'success',
        text: 'Analysis completed successfully!'
      });

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Analysis failed. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSessionSelect = (sessionId) => {
    setSelectedSession(sessionId);
    const session = analysisHistory.find(s => s.id === sessionId);
    if (session) {
      setCurrentAnalysis(session.result);
    }
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setSelectedSession(null);
    setMessage(null);
  };

  const handleClearHistory = async () => {
    try {
      await api.clearReports();
      setAnalysisHistory([]);
      setCurrentAnalysis(null);
      setSelectedSession(null);
      setMessage({
        type: 'success',
        text: 'History cleared successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to clear history. Please try again.'
      });
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        history={analysisHistory}
        selectedSession={selectedSession}
        onSessionSelect={handleSessionSelect}
        onNewAnalysis={handleNewAnalysis}
        onClearHistory={handleClearHistory}
      />
      
      <div className="main-content">
        {message && (
          <Message
            message={message}
            onClose={() => setMessage(null)}
          />
        )}
        
        {!currentAnalysis ? (
          <InputInterface
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <ResultsDashboard
            analysis={currentAnalysis}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </div>
    </div>
  );
};

export default MainInterface;

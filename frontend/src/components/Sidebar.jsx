import React from 'react';

const Sidebar = ({ history, selectedSession, onSessionSelect, onNewAnalysis, onClearHistory }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '32px' }}>
        <h2 className="gradient-text" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
          Guard Link
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          AI-Powered SOC Analysis
        </p>
      </div>

      <button 
        className="btn btn-primary"
        onClick={onNewAnalysis}
        style={{ width: '100%', marginBottom: '24px' }}
      >
        + New Analysis
      </button>

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '12px' }}>
          Previous Analyses
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {history.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', padding: '20px 0' }}>
            No previous analyses
          </p>
        ) : (
          history.map((session) => (
            <div
              key={session.id}
              className={`sidebar-item ${selectedSession === session.id ? 'active' : ''}`}
              onClick={() => onSessionSelect(session.id)}
              title={session.preview}
            >
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                {session.type}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                {session.preview}
              </div>
              <div style={{ fontSize: '10px', color: '#999' }}>
                {formatDate(session.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <button 
          className="btn btn-secondary"
          onClick={onClearHistory}
          style={{ width: '100%', marginTop: '16px', fontSize: '12px' }}
        >
          Clear History
        </button>
      )}
    </div>
  );
};

export default Sidebar;

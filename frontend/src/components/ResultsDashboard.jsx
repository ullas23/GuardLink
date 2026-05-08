import React from 'react';

const ResultsDashboard = ({ analysis, onNewAnalysis }) => {
  // Add debug logging with null checks
  if (analysis) {
    console.log("Analysis Result:", analysis);
    console.log("Confidence Score:", analysis.confidence_score);
    console.log("Attack Category:", analysis.attack_category);
    console.log("Severity:", analysis.severity);
  }
  
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'severity-low';
      case 'medium': return 'severity-medium';
      case 'high': return 'severity-high';
      case 'critical': return 'severity-critical';
      default: return 'severity-low';
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'normal': return 'verdict-normal';
      case 'suspicious': return 'verdict-suspicious';
      case 'malicious': return 'verdict-malicious';
      default: return 'verdict-normal';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const renderIndicators = (indicators) => {
    if (!indicators) return null;
    
    return Object.entries(indicators).map(([key, value]) => {
      if (!value || value.length === 0) return null;
      
      return (
        <div key={key} style={{ marginBottom: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px', textTransform: 'capitalize' }}>
            {key.replace('_', ' ')}:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {value.map((item, index) => (
              <span
                key={index}
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>
            <span className="gradient-text">Analysis Results</span>
          </h2>
          <button className="btn btn-primary" onClick={onNewAnalysis}>
            + New Analysis
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`severity-badge ${getVerdictColor(analysis.verdict)}`}>
            {analysis.verdict || 'UNKNOWN'}
          </span>
          <span className={`severity-badge ${getSeverityColor(analysis.severity)}`}>
            {analysis.severity || 'UNKNOWN'}
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Confidence: {analysis.confidence_score || 0}%
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Engine: GEMINI
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Executive Summary</h3>
        <p style={{ lineHeight: '1.6', color: '#666' }}>
          {analysis.analysis || 'No analysis available'}
        </p>
      </div>

      {/* Attack Details */}
      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Attack Analysis</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Attack Category
            </h4>
            <p style={{ fontSize: '16px', color: '#333' }}>
              {analysis.attack_category || 'Not identified'}
            </p>
          </div>
          
          {analysis.mitre_techniques && analysis.mitre_techniques.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                MITRE Techniques
              </h4>
              <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                {analysis.mitre_techniques.map((technique, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <strong>{technique}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Security Recommendations</h3>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} style={{ marginBottom: '8px', color: '#666', lineHeight: '1.5' }}>
                {recommendation}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Indicators */}
      {analysis.indicators && (
        <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Extracted Indicators</h3>
          {renderIndicators(analysis.indicators)}
        </div>
      )}

      {/* Metadata */}
      <div className="glass-card fade-in" style={{ padding: '16px', fontSize: '12px', color: '#999' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>Analysis Time: {formatTimestamp(analysis.analysis_timestamp)}</span>
          <span>Lines Processed: {analysis.log_lines_processed || 'N/A'}</span>
          <span>Engine: GEMINI</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;

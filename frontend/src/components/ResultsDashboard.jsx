import React from 'react';

const ResultsDashboard = ({ analysis, onNewAnalysis }) => {
  // Add debug logging with null checks
  if (analysis) {
    console.log("Analysis Result:", analysis);
    console.log("Confidence Score:", analysis.confidence_score);
    console.log("Attack Family:", analysis.attack_family);
    console.log("Attack Type:", analysis.attack_type);
    console.log("Severity:", analysis.severity);
    console.log("Verdict:", analysis.verdict);
    console.log("Model Provider:", analysis.model_provider);
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
            Engine: {analysis.model_provider || 'GEMINI'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Executive Summary</h3>
        <p style={{ lineHeight: '1.6', color: '#666' }}>
          {analysis.summary || 'No analysis available'}
        </p>
      </div>

      {/* Attack Details */}
      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>Attack Analysis</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Attack Family
            </h4>
            <p style={{ fontSize: '16px', color: '#333' }}>
              {analysis.attack_family || 'Not identified'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Attack Type
            </h4>
            <p style={{ fontSize: '16px', color: '#333' }}>
              {analysis.attack_type || 'Not identified'}
            </p>
          </div>

          {analysis.mitre_mapping && (analysis.mitre_mapping.technique || analysis.mitre_mapping.technique_id) && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                MITRE Technique
              </h4>
              <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                {analysis.mitre_mapping.technique_id && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong>{analysis.mitre_mapping.technique_id}</strong>
                  </div>
                )}
                {analysis.mitre_mapping.technique && (
                  <div style={{ marginBottom: '4px' }}>
                    {analysis.mitre_mapping.technique}
                  </div>
                )}
                {analysis.mitre_mapping.tactic && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Tactic: {analysis.mitre_mapping.tactic}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.soc_recommendations && analysis.soc_recommendations.length > 0 && (
        <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Security Recommendations</h3>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            {analysis.soc_recommendations.map((recommendation, index) => (
              <li key={index} style={{ marginBottom: '8px', color: '#666', lineHeight: '1.5' }}>
                {recommendation}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Indicators */}
      {analysis.suspicious_indicators && (
        <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Extracted Indicators</h3>
          {renderIndicators(analysis.suspicious_indicators)}
        </div>
      )}

      {/* Metadata */}
      <div className="glass-card fade-in" style={{ padding: '16px', fontSize: '12px', color: '#999' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>Analysis Time: {formatTimestamp(analysis.analysis_timestamp)}</span>
          <span>Lines Processed: {analysis.log_lines_processed || 'N/A'}</span>
          <span>Engine: {analysis.model_provider || 'GEMINI'}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;

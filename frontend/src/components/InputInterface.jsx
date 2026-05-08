import React, { useState, useRef } from 'react';

const InputInterface = ({ onAnalyze, isAnalyzing }) => {
  const [logText, setLogText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const sampleLogs = [
    { name: 'Port Scan', file: 'port_scan.log' },
    { name: 'SSH Brute Force', file: 'brute_force.log' },
    { name: 'DDoS Attack', file: 'ddos.log' },
    { name: 'SQL Injection', file: 'sql_injection.log' },
    { name: 'Normal Traffic', file: 'normal.log' }
  ];

  const handleAnalyze = () => {
    if (!logText.trim() && !selectedFile) {
      alert('Please paste log text or select a file to analyze');
      return;
    }
    onAnalyze(logText, selectedFile);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['.txt', '.log', '.csv', '.json'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        alert('Invalid file type. Supported types: .txt, .log, .csv, .json');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size: 10MB');
        return;
      }

      setSelectedFile(file);
      setLogText(''); // Clear text when file is selected
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      const validTypes = ['.txt', '.log', '.csv', '.json'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        alert('Invalid file type. Supported types: .txt, .log, .csv, .json');
        return;
      }

      setSelectedFile(file);
      setLogText('');
    }
  };

  const loadSampleLog = async (logFile) => {
    try {
      const response = await fetch(`/sample_logs/${logFile}`);
      const text = await response.text();
      setLogText(text);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to load sample log:', error);
    }
  };

  const clearInput = () => {
    setLogText('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card fade-in" style={{ padding: '32px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
          <span className="gradient-text">Security Log Analysis</span>
        </h2>

        {/* Sample Logs */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            Try a sample log:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sampleLogs.map((sample) => (
              <button
                key={sample.file}
                className="btn btn-secondary"
                onClick={() => loadSampleLog(sample.file)}
                style={{ fontSize: '12px' }}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              border: `2px dashed ${dragActive ? '#667eea' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              background: dragActive ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div>
                <p style={{ marginBottom: '12px', color: '#16a34a' }}>
                  📎 {selectedFile.name}
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={clearInput}
                  style={{ fontSize: '12px' }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '12px', color: '#666' }}>
                  Drag & drop a log file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.log,.csv,.json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '12px' }}
                >
                  Choose File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              Or paste your log text:
            </label>
            {logText && (
              <button
                className="btn btn-secondary"
                onClick={() => setLogText('')}
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            className="input-area"
            value={logText}
            onChange={(e) => {
              setLogText(e.target.value);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            placeholder="Paste your security logs here..."
            disabled={!!selectedFile}
          />
          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {logText.length} characters
          </p>
        </div>

        {/* Analysis Options */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>
            Analysis Engine:
          </label>
          <select
            className="input-area"
            style={{ minHeight: 'auto', padding: '12px' }}
            defaultValue="ai"
            disabled
          >
            <option value="ai">AI Engine (Gemini)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary"
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!logText.trim() && !selectedFile)}
          style={{ 
            width: '100%', 
            fontSize: '16px', 
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isAnalyzing ? (
            <>
              <div className="spinner" />
              Analyzing...
            </>
          ) : (
            '🔍 Analyze Logs'
          )}
        </button>

        {/* Info */}
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#667eea', textAlign: 'center', margin: 0 }}>
            📊 Maximum file size: 10MB | 📝 Maximum lines processed: 1000
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputInterface;

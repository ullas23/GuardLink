const API_BASE_URL = 'http://localhost:8001';

export const api = {
  async analyzeLogs(logText, file) {
    const formData = new FormData();
    
    if (logText) {
      formData.append('log_text', logText);
    }
    
    if (file) {
      formData.append('file', file);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  async getLatestReport() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report/latest`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  async clearReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clear`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear reports');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

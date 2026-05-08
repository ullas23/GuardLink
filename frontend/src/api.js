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

    const url = `${API_BASE_URL}/api/analyze`;
    console.log('Calling API:', url);
    console.log('Analyze payload:', {
      hasLogText: !!logText,
      hasFile: !!file,
      fileName: file?.name
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || `Analysis failed (status: ${response.status})`);
      }

      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },
  
  async getLatestReport() {
    const url = `${API_BASE_URL}/api/report/latest`;
    console.log('Calling API:', url);

    try {
      const response = await fetch(url);
      console.log('Latest report response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No report found (404) - this is normal for first run');
          return null;
        }
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch report (status: ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Latest report data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      // Don't throw for getLatestReport - return null on error
      return null;
    }
  },
  
  async clearReports() {
    const url = `${API_BASE_URL}/api/clear`;
    console.log('Calling API:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
      });

      console.log('Clear reports response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to clear reports (status: ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Clear reports response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },
  
  async healthCheck() {
    const url = `${API_BASE_URL}/`;
    console.log('Calling API:', url);

    try {
      const response = await fetch(url);
      console.log('Health check response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Backend not available (status: ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Health check response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
};

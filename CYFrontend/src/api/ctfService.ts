import axiosInstance from './axios';

// Using the custom axios instance which includes the token interceptor
// The baseURL is already set to 'http://localhost:8080/api' in axios.ts
const API_BASE_URL = 'ctf';

export const ctfService = {
  // Get all CTF level information
  getCTFInfo: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/info`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching CTF info:', error);
      throw error;
    }
  },

  // Get specific CTF level information
  getCTFLevelInfo: async (level: number) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/info/${level}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching CTF level ${level} info:`, error);
      throw error;
    }
  },

  // Get challenge data for a specific level
  getCTFChallenge: async (level: number) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/challenge/${level}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching CTF challenge ${level}:`, error);
      throw error;
    }
  },

  // Get challenge with filesystem info
  getCTFChallengeWithFS: async (level: number) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/challenge/${level}/fs`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching CTF challenge ${level} with FS:`, error);
      throw error;
    }
  },

  // Get all available levels
  getAvailableLevels: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/levels/available`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available levels:', error);
      throw error;
    }
  },

  // Verify flag submission
  verifyFlag: async (level: number, submittedFlag: string) => {
    try {
      // This would typically be a POST endpoint to verify on backend
      // For now, we'll keep the verification on frontend since challenges are local
      const challenge = await ctfService.getCTFChallenge(level);
      return challenge.flag === submittedFlag;
    } catch (error) {
      console.error('Error verifying flag:', error);
      throw error;
    }
  },

  // Admin CTF Level Management
  getAllCTFLevels: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/levels`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all CTF levels:', error);
      throw error;
    }
  },

  getCTFLevelById: async (id: number) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/levels/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching CTF level ${id}:`, error);
      throw error;
    }
  },

  createCTFLevel: async (levelData: any) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/admin/levels`, levelData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating CTF level:', error);
      throw error;
    }
  },

  updateCTFLevel: async (id: number, levelData: any) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/admin/levels/${id}`, levelData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating CTF level ${id}:`, error);
      throw error;
    }
  },

  deleteCTFLevel: async (id: number) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/admin/levels/${id}`);
    } catch (error) {
      console.error(`Error deleting CTF level ${id}:`, error);
      throw error;
    }
  },

  toggleCTFLevelStatus: async (id: number) => {
    try {
      const response = await axiosInstance.patch(`${API_BASE_URL}/admin/levels/${id}/toggle`);
      return response.data.data;
    } catch (error) {
      console.error(`Error toggling CTF level ${id} status:`, error);
      throw error;
    }
  },

  // Templates
  getTemplates: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/templates`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  createTemplate: async (templateData: any) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/templates`, templateData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
  updateTemplate: async (id: number, templateData: any) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/templates/${id}`, templateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  deleteTemplate: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Execute command on backend (CTF mode)
  executeCTFCommand: async (level: number, command: string, currentPath: string, sessionState?: any) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/execute`, {
        level,
        command,
        currentPath,
        sessionState: sessionState || {},
      });
      return response.data;
    } catch (error) {
      console.error('Error executing CTF command:', error);
      throw error;
    }
  },
};

export default ctfService;

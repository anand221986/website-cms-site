// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://72.61.229.100:3001",
  FILE_SERVER_URL: "http://localhost",
  TIMEOUT: 30000, // 30 seconds
} as const;

// For backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const FILE_SERVER_URL = API_CONFIG.FILE_SERVER_URL;

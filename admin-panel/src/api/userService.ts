// src/api/userService.ts
import api from './api';

// Existing imports...

// Update this function to accept 'File' for Web
export const uploadProfilePicture = async (userId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file); // The key 'file' must match your backend @RequestPart name

  const response = await api.post<{ url: string }>(`/users/${userId}/upload-profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.url;
};
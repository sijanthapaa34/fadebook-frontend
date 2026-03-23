// src/api/userService.ts
import api from './api';
import { UploadResponse } from '../models/models';

export const uploadProfilePicture = async (userId: number, imageUri: string): Promise<string> => {
  const formData = new FormData();
  
  // Extract filename and extension
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // Append file to form data
  // @ts-ignore - React Native FormData supports uri
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: type,
  });

  const response = await api.post<UploadResponse>(`/users/${userId}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
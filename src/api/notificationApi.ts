import api from './api';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
  const res = await api.get<AppNotification[]>('/notifications');
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await api.get<number>('/notifications/unread-count');
  return res.data;
};

export const markAsRead = async (id: number): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

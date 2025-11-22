import axiosClient from '@/config/axiosClient';

export type NotificationType = 'like' | 'comment' | 'share' | string;

export interface NotificationActor {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface NotificationPost {
  id: number;
  userId: number;
  content: string;
  fileUrl?: string[];
  heartCount: number;
  shareCount: number;
  commentCount: number;
  uploadedAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  actorId: number;
  postId?: number | null;
  type: NotificationType;
  message: string | null;
  metadata?: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  Actor?: NotificationActor;
  Post?: NotificationPost | null;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  pagination?: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface FetchNotificationOptions {
  limit?: number;
  offset?: number;
  type?: string | string[];
  isRead?: boolean;
}

export const fetchNotifications = async (
  options: FetchNotificationOptions = {}
): Promise<NotificationListResponse> => {
  const { limit = 20, offset = 0, type, isRead } = options;

  const params: Record<string, any> = { limit, offset };
  if (type) {
    params.type = Array.isArray(type) ? type.join(',') : type;
  }
  if (typeof isRead === 'boolean') {
    params.isRead = String(isRead);
  }

  const response = await axiosClient.get('/notifications', { params });
  return response.data as NotificationListResponse;
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const response = await axiosClient.get('/notifications/unread/count');
  return response.data?.count ?? 0;
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await axiosClient.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await axiosClient.post('/notifications/read-all');
};

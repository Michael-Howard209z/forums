export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead?: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string | null;
}

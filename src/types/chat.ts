// Chat type definitions for mobile app
export interface Message {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  senderType: 'CUSTOMER' | 'ADMIN';
  messageText: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
}

export interface Conversation {
  id: number;
  customerId: number;
  customerName: string;
  shopAdminId: number;
  shopAdminName: string;
  shopId: number;
  shopName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountCustomer: number;
  unreadCountAdmin: number;
  customerOnline: boolean;
  adminOnline: boolean;
  customerTyping: boolean;
  adminTyping: boolean;
  createdAt: string;
  updatedAt: string;
}

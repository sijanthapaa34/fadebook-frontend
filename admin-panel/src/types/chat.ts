// Chat type definitions for admin web app
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'CUSTOMER' | 'ADMIN';
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
}

export interface Chat {
  id: string;
  customerId: string;
  customerName: string;
  shopAdminId: string;
  shopAdminName: string;
  shopId: string;
  shopName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: {
    customer: number;
    admin: number;
  };
  customerOnline: boolean;
  adminOnline: boolean;
  customerTyping: boolean;
  adminTyping: boolean;
  createdAt: number;
  updatedAt: number;
}

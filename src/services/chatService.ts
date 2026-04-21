// Chat service using REST API with polling for real-time updates
import api from '../api/api';

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

class ChatService {
  private pollingIntervals: Map<number, NodeJS.Timeout> = new Map();
  private conversationPollingInterval: NodeJS.Timeout | null = null;

  /**
   * Get or create a chat room
   */
  async getOrCreateChatRoom(
    customerId: number,
    customerName: string,
    shopAdminId: number,
    shopAdminName: string,
    shopId: number,
    shopName: string
  ): Promise<Conversation> {
    const response = await api.post('/chat/rooms', {
      customerId,
      customerName,
      shopAdminId,
      shopAdminName,
      shopId,
      shopName,
    });
    return response.data;
  }

  /**
   * Get all chat rooms for a user
   */
  async getChatRooms(userId: number, userType: 'CUSTOMER' | 'ADMIN'): Promise<Conversation[]> {
    const response = await api.get('/chat/rooms', {
      params: { userId, userType },
    });
    return response.data;
  }

  /**
   * Send a message
   */
  async sendMessage(
    chatRoomId: number,
    senderId: number,
    senderName: string,
    senderType: 'CUSTOMER' | 'ADMIN',
    messageText: string
  ): Promise<Message> {
    const response = await api.post('/chat/messages', {
      chatRoomId,
      senderId,
      senderName,
      senderType,
      messageText,
    });
    return response.data;
  }

  /**
   * Get all messages in a chat room
   */
  async getMessages(chatRoomId: number): Promise<Message[]> {
    const response = await api.get(`/chat/messages/${chatRoomId}`);
    return response.data;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatRoomId: number, userType: 'CUSTOMER' | 'ADMIN'): Promise<void> {
    await api.post(`/chat/messages/${chatRoomId}/read`, null, {
      params: { userType },
    });
  }

  /**
   * Update typing status
   */
  async updateTypingStatus(
    chatRoomId: number,
    userType: 'CUSTOMER' | 'ADMIN',
    isTyping: boolean
  ): Promise<void> {
    await api.post('/chat/typing', {
      chatRoomId,
      userType,
      isTyping,
    });
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(
    chatRoomId: number,
    userType: 'CUSTOMER' | 'ADMIN',
    isOnline: boolean
  ): Promise<void> {
    await api.post('/chat/online', null, {
      params: { chatRoomId, userType, isOnline },
    });
  }

  /**
   * Get total unread count
   */
  async getUnreadCount(userId: number, userType: 'CUSTOMER' | 'ADMIN'): Promise<number> {
    const response = await api.get('/chat/unread-count', {
      params: { userId, userType },
    });
    return response.data.unreadCount;
  }

  /**
   * Start polling for new messages in a chat room
   */
  startMessagePolling(
    chatRoomId: number,
    onMessagesUpdate: (messages: Message[]) => void,
    intervalMs: number = 2000
  ): void {
    // Clear existing interval if any
    this.stopMessagePolling(chatRoomId);

    // Initial fetch
    this.getMessages(chatRoomId).then(onMessagesUpdate).catch(console.error);

    // Start polling
    const interval = setInterval(() => {
      this.getMessages(chatRoomId).then(onMessagesUpdate).catch(console.error);
    }, intervalMs);

    this.pollingIntervals.set(chatRoomId, interval);
  }

  /**
   * Stop polling for messages
   */
  stopMessagePolling(chatRoomId: number): void {
    const interval = this.pollingIntervals.get(chatRoomId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(chatRoomId);
    }
  }

  /**
   * Start polling for conversation list updates
   */
  startConversationPolling(
    userId: number,
    userType: 'CUSTOMER' | 'ADMIN',
    onConversationsUpdate: (conversations: Conversation[]) => void,
    intervalMs: number = 3000
  ): void {
    // Clear existing interval if any
    this.stopConversationPolling();

    // Initial fetch
    this.getChatRooms(userId, userType).then(onConversationsUpdate).catch(console.error);

    // Start polling
    this.conversationPollingInterval = setInterval(() => {
      this.getChatRooms(userId, userType).then(onConversationsUpdate).catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop polling for conversations
   */
  stopConversationPolling(): void {
    if (this.conversationPollingInterval) {
      clearInterval(this.conversationPollingInterval);
      this.conversationPollingInterval = null;
    }
  }

  /**
   * Clean up all polling intervals
   */
  cleanup(): void {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();
    this.stopConversationPolling();
  }
}

export default new ChatService();

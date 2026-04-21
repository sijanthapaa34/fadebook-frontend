// Chat service for admin panel using REST API with polling
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
   * Get all chat rooms for admin
   */
  async getChatRooms(userId: number): Promise<Conversation[]> {
    const response = await api.get('/chat/rooms', {
      params: { userId, userType: 'ADMIN' },
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
    messageText: string
  ): Promise<Message> {
    const response = await api.post('/chat/messages', {
      chatRoomId,
      senderId,
      senderName,
      senderType: 'ADMIN',
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
  async markMessagesAsRead(chatRoomId: number): Promise<void> {
    await api.post(`/chat/messages/${chatRoomId}/read`, null, {
      params: { userType: 'ADMIN' },
    });
  }

  /**
   * Update typing status
   */
  async updateTypingStatus(
    chatRoomId: number,
    isTyping: boolean
  ): Promise<void> {
    await api.post('/chat/typing', {
      chatRoomId,
      userType: 'ADMIN',
      isTyping,
    });
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(
    chatRoomId: number,
    isOnline: boolean
  ): Promise<void> {
    await api.post('/chat/online', null, {
      params: { chatRoomId, userType: 'ADMIN', isOnline },
    });
  }

  /**
   * Get total unread count
   */
  async getUnreadCount(userId: number): Promise<number> {
    const response = await api.get('/chat/unread-count', {
      params: { userId, userType: 'ADMIN' },
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
    onConversationsUpdate: (conversations: Conversation[]) => void,
    intervalMs: number = 3000
  ): void {
    // Clear existing interval if any
    this.stopConversationPolling();

    console.log('🔄 Starting conversation polling for user:', userId);

    // Initial fetch
    this.getChatRooms(userId)
      .then((conversations) => {
        console.log('Initial conversations fetch:', conversations.length);
        onConversationsUpdate(conversations);
      })
      .catch((error) => {
        console.error('Error fetching conversations:', error);
        console.error('Error details:', error.response?.data);
        // Still call with empty array so loading stops
        onConversationsUpdate([]);
      });

    // Start polling
    this.conversationPollingInterval = setInterval(() => {
      this.getChatRooms(userId)
        .then(onConversationsUpdate)
        .catch((error) => {
          console.error('Polling error:', error);
        });
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

// WebSocket Chat Service for Real-Time Messaging (React Native Compatible)
import { Platform } from 'react-native';
import api from '../api/api';

const getBaseURL = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
};

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

interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

class WebSocketChatService {
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private messageSubscriptions: Map<number, (message: Message) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Connect to WebSocket using STOMP protocol over native WebSocket
   */
  connect(onConnected?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.ws) {
        console.log('✅ Already connected to WebSocket');
        resolve();
        return;
      }

      try {
        // Convert HTTP URL to WebSocket URL
        const baseUrl = getBaseURL();
        const wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/chat';
        console.log('🔌 Connecting to WebSocket:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          
          // Send STOMP CONNECT frame
          this.sendStompFrame('CONNECT', {
            'accept-version': '1.1,1.2',
            'heart-beat': '10000,10000',
          });
        };

        this.ws.onmessage = (event) => {
          const frame = this.parseStompFrame(event.data);
          
          if (frame.command === 'CONNECTED') {
            console.log('✅ STOMP connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            if (onConnected) onConnected();
            resolve();
          } else if (frame.command === 'MESSAGE') {
            this.handleMessage(frame);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.connected = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket closed');
          this.connected = false;
          this.stopHeartbeat();
          this.handleReconnect();
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws && this.connected) {
      this.sendStompFrame('DISCONNECT', {});
      this.ws.close();
      this.connected = false;
      this.stopHeartbeat();
      this.messageSubscriptions.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }

  /**
   * Parse STOMP frame
   */
  private parseStompFrame(data: string): StompFrame {
    const lines = data.split('\n');
    const command = lines[0];
    const headers: Record<string, string> = {};
    let bodyStart = 0;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '') {
        bodyStart = i + 1;
        break;
      }
      const [key, value] = lines[i].split(':');
      if (key && value) {
        headers[key] = value;
      }
    }

    const body = lines.slice(bodyStart).join('\n').replace(/\0$/, '');

    return { command, headers, body };
  }

  /**
   * Send STOMP frame
   */
  private sendStompFrame(command: string, headers: Record<string, string>, body: string = ''): void {
    if (!this.ws) return;

    let frame = command + '\n';
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    frame += '\n' + body + '\0';

    this.ws.send(frame);
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.connected) {
        this.ws.send('\n');
      }
    }, 10000);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(frame: StompFrame): void {
    try {
      const destination = frame.headers['destination'];
      if (destination && destination.startsWith('/topic/chat/')) {
        const chatRoomId = parseInt(destination.split('/').pop() || '0');
        const message: Message = JSON.parse(frame.body);
        
        const callback = this.messageSubscriptions.get(chatRoomId);
        if (callback) {
          callback(message);
        }
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }

  /**
   * Subscribe to messages in a chat room
   */
  subscribeToMessages(
    chatRoomId: number,
    onMessage: (message: Message) => void
  ): void {
    if (!this.ws || !this.connected) {
      console.error('❌ WebSocket not connected');
      return;
    }

    console.log('📨 Subscribing to chat room:', chatRoomId);

    this.sendStompFrame('SUBSCRIBE', {
      'id': `sub-${chatRoomId}`,
      'destination': `/topic/chat/${chatRoomId}`,
    });

    this.messageSubscriptions.set(chatRoomId, onMessage);
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribeFromMessages(chatRoomId: number): void {
    if (this.ws && this.connected) {
      this.sendStompFrame('UNSUBSCRIBE', {
        'id': `sub-${chatRoomId}`,
      });
    }
    this.messageSubscriptions.delete(chatRoomId);
    console.log('🔕 Unsubscribed from chat room:', chatRoomId);
  }

  /**
   * Send a message via WebSocket
   */
  async sendMessage(
    chatRoomId: number,
    senderId: number,
    senderName: string,
    senderType: 'CUSTOMER' | 'ADMIN',
    messageText: string
  ): Promise<Message> {
    if (!this.ws || !this.connected) {
      console.warn('⚠️ WebSocket not connected, using REST API fallback');
      return this.sendMessageViaRest(chatRoomId, senderId, senderName, senderType, messageText);
    }

    try {
      const payload = {
        chatRoomId,
        senderId,
        senderName,
        senderType,
        messageText,
      };

      this.sendStompFrame(
        'SEND',
        { 'destination': '/app/chat.sendMessage' },
        JSON.stringify(payload)
      );

      // Return optimistic response
      return {
        id: Date.now(),
        chatRoomId,
        senderId,
        senderName,
        senderType,
        messageText,
        status: 'SENT',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to send message via WebSocket:', error);
      return this.sendMessageViaRest(chatRoomId, senderId, senderName, senderType, messageText);
    }
  }

  /**
   * Send message via REST API
   */
  async sendMessageViaRest(
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
   * Update typing status
   */
  updateTypingStatus(
    chatRoomId: number,
    userType: 'CUSTOMER' | 'ADMIN',
    isTyping: boolean
  ): void {
    if (!this.ws || !this.connected) return;

    try {
      this.sendStompFrame(
        'SEND',
        { 'destination': '/app/chat.typing' },
        JSON.stringify({ chatRoomId, userType, isTyping })
      );
    } catch (error) {
      console.error('❌ Failed to send typing status:', error);
    }
  }

  /**
   * Get or create chat room (REST API)
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
   * Get all messages (REST API)
   */
  async getMessages(chatRoomId: number): Promise<Message[]> {
    const response = await api.get(`/chat/messages/${chatRoomId}`);
    return response.data;
  }

  /**
   * Get all chat rooms (REST API)
   */
  async getChatRooms(userId: number, userType: 'CUSTOMER' | 'ADMIN'): Promise<Conversation[]> {
    const response = await api.get('/chat/rooms', {
      params: { userId, userType },
    });
    return response.data;
  }

  /**
   * Mark messages as read (REST API)
   */
  async markMessagesAsRead(chatRoomId: number, userType: 'CUSTOMER' | 'ADMIN'): Promise<void> {
    await api.post(`/chat/messages/${chatRoomId}/read`, null, {
      params: { userType },
    });
  }

  /**
   * Update online status (REST API)
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
   * Start polling for conversations (optimized for mobile)
   */
  startConversationPolling(
    userId: number,
    userType: 'CUSTOMER' | 'ADMIN',
    onUpdate: (conversations: Conversation[]) => void,
    intervalMs: number = 10000 // 10 seconds (reduced from 5)
  ): NodeJS.Timeout {
    // Initial fetch
    this.getChatRooms(userId, userType).then(onUpdate).catch(console.error);

    // Poll every 10 seconds (more efficient)
    return setInterval(() => {
      this.getChatRooms(userId, userType).then(onUpdate).catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  stopConversationPolling(interval: NodeJS.Timeout): void {
    clearInterval(interval);
  }
}

export default new WebSocketChatService();

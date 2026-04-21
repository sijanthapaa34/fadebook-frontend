// Admin Chat Dashboard with Dark Theme
import { useEffect, useState, useRef } from 'react';
import { Send, Circle, MessageCircle, Loader2 } from 'lucide-react';
import chatService, { Conversation, Message } from '../../services/chatService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';

const ChatDashboard = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current admin user
  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem('admin-auth-storage');
      if (!raw) return null;
      return JSON.parse(raw)?.state?.user;
    } catch {
      return null;
    }
  };

  const currentAdmin = getUserFromStorage();
  const shopAdminId = currentAdmin?.id || 0;

  console.log('👤 Current admin:', currentAdmin);
  console.log('🆔 Shop admin ID:', shopAdminId);

  // Subscribe to conversations
  useEffect(() => {
    if (!shopAdminId) {
      console.error('No shopAdminId found');
      setLoading(false);
      return;
    }

    console.log('🔍 Starting conversation polling for admin:', shopAdminId);

    chatService.startConversationPolling(
      shopAdminId,
      (updatedConversations) => {
        console.log('✅ Conversations loaded:', updatedConversations.length);
        setConversations(updatedConversations);
        setLoading(false);
      }
    );

    return () => {
      chatService.stopConversationPolling();
    };
  }, [shopAdminId]);

  // Subscribe to messages when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    chatService.startMessagePolling(
      selectedChat.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
      }
    );

    // Mark messages as read
    chatService.markMessagesAsRead(selectedChat.id);

    // Update online status
    chatService.updateOnlineStatus(selectedChat.id, true);

    return () => {
      chatService.updateOnlineStatus(selectedChat.id, false);
      chatService.stopMessagePolling(selectedChat.id);
    };
  }, [selectedChat?.id]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await chatService.sendMessage(
        selectedChat.id,
        shopAdminId,
        currentAdmin.name || 'Admin',
        messageText
      );
      
      // Stop typing indicator
      chatService.updateTypingStatus(selectedChat.id, false);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (!selectedChat) return;

    // Debounced typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length > 0) {
      chatService.updateTypingStatus(selectedChat.id, true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatService.updateTypingStatus(selectedChat.id, false);
    }, 1000);
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with your customers</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* Chat List Sidebar */}
        <div className="w-80 glass-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-muted/50 border-l-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-semibold text-sm">
                          {chat.customerName.charAt(0).toUpperCase()}
                        </div>
                        {chat.customerOnline && (
                          <Circle className="absolute bottom-0 right-0 w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {chat.customerName}
                          </h3>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs truncate ${
                              chat.unreadCountAdmin > 0
                                ? 'font-semibold text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {chat.customerTyping
                              ? 'Typing...'
                              : chat.lastMessage || 'No messages yet'}
                          </p>
                          {chat.unreadCountAdmin > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                              {chat.unreadCountAdmin > 99 ? '99+' : chat.unreadCountAdmin}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass-card flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-semibold text-sm">
                    {selectedChat.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {selectedChat.customerName}
                    </h3>
                    {selectedChat.customerOnline ? (
                      <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <Circle className="w-1.5 h-1.5 fill-emerald-500" />
                        Online
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Offline</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Typing Indicator */}
              {selectedChat.customerTyping && (
                <div className="px-4 py-2 bg-muted/30 border-b border-border">
                  <p className="text-xs text-muted-foreground italic">
                    {selectedChat.customerName} is typing...
                  </p>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderType === 'ADMIN';

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted border border-border text-foreground'
                          }`}
                        >
                          <p className="text-sm break-words">{message.messageText}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span
                              className={`text-[10px] ${
                                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwnMessage && (
                              <span className="text-[10px] text-primary-foreground/70">
                                {message.status === 'READ' ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-muted/50 border-border"
                    maxLength={1000}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || sending}
                    size="icon"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm font-semibold mb-1">Select a conversation</p>
                <p className="text-xs">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;

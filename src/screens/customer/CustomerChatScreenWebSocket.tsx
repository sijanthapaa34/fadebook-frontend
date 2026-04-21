// Customer Chat Screen with WebSocket
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, AppState,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import websocketChatService, { Message, Conversation } from '../../services/websocketChatService';

// --- Types ---
type MessageStatus = 'sent' | 'delivered' | 'seen';

// --- Components ---
const StatusIcon = ({ status }: { status: MessageStatus }) => {
  const color = status === 'seen' ? theme.colors.primary : theme.colors.muted;
  if (status === 'sent') return <Check size={12} color={color} />;
  return <CheckCheck size={12} color={color} />;
};

const AvatarComp = ({ name, online }: { name: string; online?: boolean }) => (
  <View style={styles.avatarContainer}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{name.charAt(0)}</Text>
    </View>
    {online !== undefined && (
      <View style={[styles.onlineDot, online ? styles.online : styles.offline]} />
    )}
  </View>
);

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnim = (dot: Animated.Value) => 
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );

    const animations = Animated.stagger(150, [ createAnim(dot1), createAnim(dot2), createAnim(dot3) ]);
    animations.start();

    return () => animations.stop();
  }, [dot1, dot2, dot3]);

  const getStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim }],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
  });

  return (
    <View style={styles.typingBubble}>
      <Animated.View style={[styles.typingDot, getStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, getStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, getStyle(dot3)]} />
    </View>
  );
};

// --- Main Component ---
const CustomerChat = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { chatRoomId, conversation } = (route.params as { chatRoomId?: number; conversation?: Conversation }) || {};
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeConversation] = useState<Conversation | null>(conversation || null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect to WebSocket on mount (disabled - using REST API polling)
  useEffect(() => {
    // WebSocket disabled due to React Native compatibility issues
    // Using REST API polling instead (standard for mobile apps)
    return () => {
      // Cleanup
    };
  }, []);

  // Subscribe to messages when chat is active (using REST API polling)
  useEffect(() => {
    if (!chatRoomId) return;

    // Load initial messages
    websocketChatService.getMessages(chatRoomId)
      .then(setMessages)
      .catch(console.error);

    // Poll for new messages every 3 seconds (when in chat)
    const interval = setInterval(() => {
      websocketChatService.getMessages(chatRoomId)
        .then((newMessages) => {
          setMessages(newMessages);
          // Auto-scroll to bottom if new messages
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        })
        .catch(console.error);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [chatRoomId]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    if (chatRoomId) {
      websocketChatService.markMessagesAsRead(chatRoomId, 'CUSTOMER').catch(console.error);
    }
  }, [chatRoomId]);

  // Update online status based on app state
  useEffect(() => {
    if (!chatRoomId) return;

    websocketChatService.updateOnlineStatus(chatRoomId, 'CUSTOMER', true).catch(console.error);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        websocketChatService.updateOnlineStatus(chatRoomId, 'CUSTOMER', true).catch(console.error);
      } else {
        websocketChatService.updateOnlineStatus(chatRoomId, 'CUSTOMER', false).catch(console.error);
      }
    });

    return () => {
      websocketChatService.updateOnlineStatus(chatRoomId, 'CUSTOMER', false).catch(console.error);
      subscription.remove();
    };
  }, [chatRoomId]);

  const handleSend = async () => {
    if (!message.trim() || sending || !user || !chatRoomId) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      // Send via REST API (WebSocket disabled)
      await websocketChatService.sendMessageViaRest(
        chatRoomId,
        user.id,
        user.name,
        'CUSTOMER',
        messageText,
      );
      
      // Refresh messages immediately
      const updatedMessages = await websocketChatService.getMessages(chatRoomId);
      setMessages(updatedMessages);
      
      // Stop typing indicator
      websocketChatService.updateTypingStatus(chatRoomId, 'CUSTOMER', false);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText); // Restore message on error
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTextChange = (text: string) => {
    setMessage(text);

    if (!chatRoomId) return;

    // Debounced typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length > 0) {
      websocketChatService.updateTypingStatus(chatRoomId, 'CUSTOMER', true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      websocketChatService.updateTypingStatus(chatRoomId, 'CUSTOMER', false);
    }, 1000);
  };

  const formatMessageTime = (timestamp: string): string => {
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

  const getMessageStatus = (msg: Message): MessageStatus => {
    if (msg.status === 'READ') return 'seen';
    if (msg.status === 'DELIVERED') return 'delivered';
    return 'sent';
  };

  // --- RENDER: CHAT VIEW ---
  if (chatRoomId && activeConversation) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <AvatarComp name={activeConversation.shopName} online={activeConversation.adminOnline} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.shopName}>{activeConversation.shopName}</Text>
            <Text style={styles.statusText}>{activeConversation.adminOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.flexOne} 
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => {
            const isOwnMessage = msg.senderType === 'CUSTOMER';
            return (
              <View key={msg.id} style={[styles.messageBubble, isOwnMessage ? styles.msgMe : styles.msgShop]}>
                <Text style={[styles.msgText, isOwnMessage && styles.msgTextMe]}>{msg.messageText}</Text>
                <View style={styles.msgMeta}>
                  <Text style={[styles.msgTime, isOwnMessage && styles.msgTimeMe]}>{formatMessageTime(msg.createdAt)}</Text>
                  {isOwnMessage && <StatusIcon status={getMessageStatus(msg)} />}
                </View>
              </View>
            );
          })}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.placeholder}
            value={message}
            onChangeText={handleTextChange}
            maxLength={1000}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!message.trim() || sending}
            activeOpacity={0.7}
          >
            <Send size={18} color={theme.colors.primaryText} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- RENDER: NO CHAT SELECTED ---
  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No chat selected</Text>
        <Text style={styles.emptySubtext}>Go to Messages to start a conversation</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  flexOne: { flex: 1 },
  
  // Header
  chatHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: theme.spacing.lg,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
  },
  backBtn: { 
    padding: theme.spacing.sm, 
    marginLeft: -theme.spacing.sm, 
    marginRight: theme.spacing.sm,
  },
  chatHeaderInfo: { 
    marginLeft: theme.spacing.md, 
    flex: 1,
  },
  shopName: { 
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statusText: { 
    ...theme.typography.small,
    color: theme.colors.muted, 
    marginTop: 2,
  },
  
  // Messages
  messageList: { 
    padding: theme.spacing.lg,
  },
  
  messageBubble: { 
    maxWidth: '75%', 
    marginBottom: theme.spacing.md, 
    padding: theme.spacing.md, 
    borderRadius: theme.radius.lg,
  },
  msgMe: { 
    alignSelf: 'flex-end', 
    backgroundColor: theme.colors.primary, 
    borderBottomRightRadius: theme.radius.sm,
  },
  msgShop: { 
    alignSelf: 'flex-start', 
    backgroundColor: theme.colors.card, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    borderBottomLeftRadius: theme.radius.sm,
  },
  msgText: { 
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 20,
  },
  msgTextMe: { 
    color: theme.colors.primaryText,
  },
  msgMeta: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    marginTop: theme.spacing.xs, 
    gap: 4,
  },
  msgTime: { 
    ...theme.typography.small,
    fontSize: 10,
    color: theme.colors.muted,
  },
  msgTimeMe: {
    color: 'rgba(0,0,0,0.5)',
  },
  
  // Typing
  typingBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: theme.colors.card, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    padding: theme.spacing.md, 
    borderRadius: theme.radius.lg, 
    borderBottomLeftRadius: theme.radius.sm, 
    flexDirection: 'row', 
    gap: 4,
  },
  typingDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: theme.colors.muted,
  },

  // Input
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: theme.spacing.lg,
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border, 
    backgroundColor: theme.colors.background,
  },
  textInput: { 
    flex: 1, 
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.radius.md, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    paddingHorizontal: theme.spacing.md, 
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text, 
    marginRight: theme.spacing.sm,
    ...theme.typography.body,
  },
  sendBtn: { 
    width: 40, 
    height: 40, 
    backgroundColor: theme.colors.primary, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  sendBtnDisabled: { 
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
  },

  // Avatar
  avatarContainer: { 
    position: 'relative', 
    width: 40, 
    height: 40,
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(212, 175, 55, 0.15)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: theme.colors.border,
  },
  avatarText: { 
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.primary,
  },
  onlineDot: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    borderWidth: 2, 
    borderColor: theme.colors.background,
  },
  online: { 
    backgroundColor: theme.colors.success,
  },
  offline: { 
    backgroundColor: theme.colors.muted,
  },
  
  emptyState: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: { 
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center',
  },
});

export default CustomerChat;

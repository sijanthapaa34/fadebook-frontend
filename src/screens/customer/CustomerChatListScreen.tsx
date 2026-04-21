// Customer Chat List Screen
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuthStore} from '../../store/authStore';
import websocketChatService, {Conversation} from '../../services/websocketChatService';
import {Plus, X, MessageCircle} from 'lucide-react-native';
import {theme} from '../../theme/theme';
import api from '../../api/api';

interface Shop {
  id: number;
  name: string;
  address: string;
  city: string;
  rating: number;
  adminId?: number; // Shop admin user ID
}

const ChatListScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Start polling for conversations (REST API only, no WebSocket)
    const interval = websocketChatService.startConversationPolling(
      user.id,
      'CUSTOMER',
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
        setRefreshing(false);
      }
    );

    pollingIntervalRef.current = interval;

    return () => {
      if (pollingIntervalRef.current) {
        websocketChatService.stopConversationPolling(pollingIntervalRef.current);
      }
    };
  }, [user?.id]);

  const loadShops = async () => {
    setLoadingShops(true);
    try {
      console.log('🔍 Loading shops from /barbershop/all');
      const response = await api.get('/barbershop/all');
      console.log('✅ Shops response:', response.data);
      
      // The response is paginated, so we need to extract the content
      const shopList = response.data.content || [];
      console.log('📋 Extracted shops:', shopList.length, 'shops');
      console.log('📋 First shop data:', shopList[0]);
      setShops(shopList);
    } catch (error: any) {
      console.error(' Error loading shops:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Alert.alert('Error', 'Failed to load barbershops. Please try again.');
    } finally {
      setLoadingShops(false);
    }
  };

  const handleNewChatPress = () => {
    setShowNewChatModal(true);
    loadShops();
  };

  const handleStartChat = async (shop: Shop) => {
    if (!user) return;

    try {
      setShowNewChatModal(false);
      setLoading(true);

      console.log('🏪 Starting chat with shop:', shop);
      
      // Use the shop's admin ID if available, otherwise fall back to shop ID
      const shopAdminId = shop.adminId || shop.id;
      console.log('👤 Using shop admin ID:', shopAdminId);
      
      // Create or get chat room
      const conversation = await websocketChatService.getOrCreateChatRoom(
        user.id,
        user.name,
        shopAdminId,
        'Shop Admin',
        shop.id,
        shop.name
      );

      console.log('✅ Chat room created:', conversation);

      // Navigate to chat
      // @ts-ignore
      navigation.navigate('CustomerChat', {
        chatRoomId: conversation.id,
        conversation,
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleChatPress = (conversation: Conversation) => {
    // @ts-ignore
    navigation.navigate('CustomerChat', {
      chatRoomId: conversation.id,
      conversation,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user?.id) {
      websocketChatService.getChatRooms(user.id, 'CUSTOMER')
        .then(setConversations)
        .finally(() => setRefreshing(false));
    }
  };

  const renderChatItem = ({item}: {item: Conversation}) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.shopName.charAt(0).toUpperCase()}
          </Text>
        </View>
        {item.adminOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.shopName}
          </Text>
          <Text style={styles.timestamp}>{formatTime(item.lastMessageTime)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCountCustomer > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}>
            {item.adminTyping ? 'Typing...' : item.lastMessage || 'No messages yet'}
          </Text>
          {item.unreadCountCustomer > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCountCustomer > 99 ? '99+' : item.unreadCountCustomer}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Chat with barbershops</Text>
        </View>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={handleNewChatPress}
          activeOpacity={0.7}>
          <Plus size={18} color={theme.colors.primaryText} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <MessageCircle size={40} color={theme.colors.muted} strokeWidth={1} />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start chatting with shops about your appointments
          </Text>
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={handleNewChatPress}
            activeOpacity={0.7}>
            <Text style={styles.startChatButtonText}>Start New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderChatItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewChatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Shop</Text>
              <TouchableOpacity
                onPress={() => setShowNewChatModal(false)}
                style={styles.closeButton}
                activeOpacity={0.7}>
                <X size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {loadingShops ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : shops.length === 0 ? (
              <View style={styles.modalLoading}>
                <Text style={styles.emptyText}>No barbershops available</Text>
                <Text style={styles.emptySubtext}>Please try again later</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.shopList}
                contentContainerStyle={{paddingBottom: theme.spacing.lg}}
              >
                {shops.map((shop) => (
                  <TouchableOpacity
                    key={shop.id}
                    style={styles.shopCard}
                    onPress={() => handleStartChat(shop)}
                    activeOpacity={0.7}>
                    <View style={styles.shopAvatar}>
                      <Text style={styles.shopAvatarText}>
                        {shop.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.shopInfo}>
                      <Text style={styles.shopCardName}>{shop.name}</Text>
                      <Text style={styles.shopAddress}>
                        {shop.address}, {shop.city}
                      </Text>
                      <Text style={styles.shopRating}>⭐ {shop.rating.toFixed(1)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontFamily: theme.fonts.serif,
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.small,
    color: theme.colors.muted,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  chatCard: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  timestamp: {
    ...theme.typography.small,
    color: theme.colors.muted,
    marginLeft: theme.spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: theme.spacing.sm,
  },
  unreadText: {
    ...theme.typography.small,
    color: theme.colors.primaryText,
    fontWeight: 'bold',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  startChatButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  startChatButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '80%',
    minHeight: 300, // Add minimum height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontFamily: theme.fonts.serif,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalLoading: {
    padding: theme.spacing.xxl * 2,
    alignItems: 'center',
  },
  shopList: {
    flex: 1,
    paddingBottom: theme.spacing.lg, // Add padding at bottom
  },
  shopCard: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  shopAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  shopAvatarText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  shopInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shopCardName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 4,
  },
  shopAddress: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  shopRating: {
    ...theme.typography.small,
    color: theme.colors.muted,
  },
});

export default ChatListScreen;

// src/screens/customer/CustomerChatScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform, Image, Animated,
} from 'react-native';
// REMOVED: useSafeAreaInsets - Not needed when inside DashboardLayout
import { Send, ArrowLeft, Image as ImageIcon, Check, CheckCheck, Circle, Search } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Barbershop, Service, Barber } from '../../models/models';

// --- SEED DATA (Keep as is) ---
export const seedShops: Barbershop[] = [
  { id: 1, name: 'The Gold Standard', address: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', phone: '(212) 555-0101', email: 'info@goldstandard.com', rating: 4.9, profilePicture: 'https://placehold.co/600x400/27272A/FFFFFF?text=Gold+Standard', website: 'https://goldstandard.com', operatingHours: '9 AM - 7 PM' },
  { id: 2, name: 'Crown & Blade', address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', phone: '(213) 555-0202', email: 'info@crownblade.com', rating: 4.8, profilePicture: 'https://placehold.co/600x400/27272A/FFFFFF?text=Crown+Blade', website: 'https://crownblade.com', operatingHours: '10 AM - 8 PM' },
  { id: 3, name: 'Noir Cuts', address: '789 Pine St', city: 'Chicago', state: 'IL', postalCode: '60601', phone: '(312) 555-0303', email: 'info@noircuts.com', rating: 4.7, profilePicture: 'https://placehold.co/600x400/27272A/FFFFFF?text=Noir+Cuts', website: 'https://noircuts.com', operatingHours: '8 AM - 6 PM' },
  { id: 4, name: 'Classic Kuts', address: '321 Elm St', city: 'Houston', state: 'TX', postalCode: '77001', phone: '(713) 555-0404', email: 'info@classickuts.com', rating: 4.6, profilePicture: 'https://placehold.co/600x400/27272A/FFFFFF?text=Classic+Kuts', website: 'https://classickuts.com', operatingHours: '9 AM - 7 PM' },
];
// ... (seedServices and seedBarbers remain the same, truncated for brevity)
export const seedServices: Service[] = [ { id: 1, shopId: 1, name: 'Premium Fade', category: 'Haircut', price: 45, duration: 30 }, { id: 2, shopId: 1, name: 'Beard Trim', category: 'Beard', price: 20, duration: 15 }, { id: 3, shopId: 1, name: 'Hot Towel Shave', category: 'Shave', price: 35, duration: 30 }, { id: 4, shopId: 2, name: 'Executive Cut', category: 'Haircut', price: 50, duration: 45 }, { id: 5, shopId: 2, name: 'Buzz Cut', category: 'Haircut', price: 20, duration: 15 }, { id: 6, shopId: 3, name: 'Modern Pompadour', category: 'Haircut', price: 55, duration: 45 }, { id: 7, shopId: 3, name: 'Hair & Beard Combo', category: 'Combo', price: 60, duration: 45 }, ];
export const seedBarbers: Barber[] = [ { id: 1, shopId: 1, name: 'Marcus B.', bio: '15 years experience.', rating: 4.9, avatar: 'https://placehold.co/150', email: 'marcus@goldstandard.com', role: 'BARBER' }, { id: 2, shopId: 1, name: 'James W.', bio: 'Beard expert.', rating: 4.8, avatar: 'https://placehold.co/150', email: 'james@goldstandard.com', role: 'BARBER' }, { id: 3, shopId: 2, name: 'Tony R.', bio: 'Old school vibes.', rating: 4.7, avatar: 'https://placehold.co/150', email: 'tony@crownblade.com', role: 'BARBER' }, { id: 4, shopId: 2, name: 'Mike D.', bio: 'Fast and efficient.', rating: 4.6, avatar: 'https://placehold.co/150', email: 'mike@crownblade.com', role: 'BARBER' }, { id: 5, shopId: 3, name: 'Chris P.', bio: 'Modern styles.', rating: 4.9, avatar: 'https://placehold.co/150', email: 'chris@noircuts.com', role: 'BARBER' }, ];

const { width } = Dimensions.get('window');

// --- Types & Mock Data (Keep as is) ---
type MessageStatus = 'sent' | 'delivered' | 'seen';
interface ChatMessage { id: number; sender: 'me' | 'shop'; text: string; time: string; status: MessageStatus; image?: string; }
interface Conversation { shopId: number; shopName: string; lastMessage: string; lastTime: string; unread: number; online: boolean; messages: ChatMessage[]; }
const mockConversations: Conversation[] = [ { shopId: 1, shopName: 'The Gold Standard', lastMessage: "I've added a beard trim to your booking.", lastTime: '2:33 PM', unread: 1, online: true, messages: [ { id: 1, sender: 'shop', text: 'Hey James! Your appointment is confirmed.', time: '2:30 PM', status: 'seen' }, { id: 2, sender: 'me', text: 'Great, thanks! Beard trim added?', time: '2:32 PM', status: 'seen' }, { id: 3, sender: 'shop', text: "Absolutely! I've added a beard trim.", time: '2:33 PM', status: 'delivered' }, ], }, { shopId: 2, shopName: 'Crown & Blade', lastMessage: 'Your slot is available.', lastTime: '1:15 PM', unread: 2, online: false, messages: [ { id: 1, sender: 'me', text: 'Hi, slot for Friday?', time: '1:10 PM', status: 'seen' }, { id: 2, sender: 'shop', text: 'Yes, 2 PM is open.', time: '1:12 PM', status: 'seen' }, ], }, { shopId: 3, shopName: 'Noir Cuts', lastMessage: 'We open at 8 AM.', lastTime: 'Yesterday', unread: 0, online: true, messages: [ { id: 1, sender: 'me', text: 'Opening hours?', time: 'Yesterday', status: 'seen' }, { id: 2, sender: 'shop', text: 'We open at 8 AM.', time: 'Yesterday', status: 'seen' }, ], }, ];

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

const Badge = ({ count }: { count: number }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{count}</Text>
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

    Animated.stagger(150, [ createAnim(dot1), createAnim(dot2), createAnim(dot3) ]).start();
  }, []);

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
const CustomerChatScreen = () => {
  // Removed: const insets = useSafeAreaInsets();
  
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConvo, setActiveConvo] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [view, setView] = useState<'list' | 'new' | 'chat'>('list');
  
  const scrollViewRef = useRef<ScrollView>(null);

  const activeConversation = conversations.find(c => c.shopId === activeConvo);
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  const filteredConversations = conversations.filter(c =>
    c.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (activeConversation) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeConversation?.messages.length]);

  const handleSend = () => {
    if (!message.trim() || !activeConvo) return;

    const newMsg: ChatMessage = {
      id: Date.now(), sender: 'me', text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), status: 'sent',
    };

    setConversations(prev => prev.map(c =>
      c.shopId === activeConvo
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastTime: newMsg.time, unread: 0 }
        : c
    ));
    setMessage('');

    setTimeout(() => {
      setConversations(prev => prev.map(c =>
        c.shopId === activeConvo
          ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' as MessageStatus } : m) }
          : c
      ));
    }, 1000);

    setTimeout(() => setIsTyping(true), 1500);
    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: (Date.now() + 1), sender: 'shop',
        text: 'Got it! We\'ll take care of that for you. 👍',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        status: 'delivered',
      };
      setConversations(prev => prev.map(c =>
        c.shopId === activeConvo
          ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text, lastTime: reply.time }
          : c
      ));
    }, 3000);
  };

  const handleImageUpload = () => { Alert.alert("Attach Image", "Image picker functionality would go here."); };

  const startNewChat = (shopId: number) => {
    const shop = seedShops.find(s => s.id === shopId);
    if (!shop) return;
    
    const existing = conversations.find(c => c.shopId === shopId);
    if (existing) { setActiveConvo(shopId); setView('chat'); return; }

    const newConvo: Conversation = {
      shopId, shopName: shop.name,
      lastMessage: 'Start a conversation...', lastTime: 'Now',
      unread: 0, online: Math.random() > 0.3, messages: [],
    };
    setConversations(prev => [newConvo, ...prev]);
    setActiveConvo(shopId);
    setView('chat');
  };

  // --- RENDER: NEW CHAT VIEW ---
  if (view === 'new') {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}>
            <ArrowLeft size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Barbershop</Text>
        </View>
        <ScrollView style={styles.flexOne}>
          {seedShops.map(shop => (
            <TouchableOpacity key={shop.id} style={styles.listItem} onPress={() => startNewChat(shop.id)}>
              <AvatarComp name={shop.name} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemName}>{shop.name}</Text>
                <Text style={styles.listItemSub}>{shop.address}, {shop.city}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>⭐ {shop.rating}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // --- RENDER: CHAT VIEW ---
  if (view === 'chat' && activeConversation) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => { setActiveConvo(null); setView('list'); }} style={styles.backBtn}>
            <ArrowLeft size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <AvatarComp name={activeConversation.shopName} online={activeConversation.online} />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.listItemName}>{activeConversation.shopName}</Text>
            <Text style={styles.statusText}>{activeConversation.online ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.flexOne} 
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {activeConversation.messages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.sender === 'me' ? styles.msgMe : styles.msgShop]}>
              {msg.image && <Image source={{ uri: msg.image }} style={styles.msgImage} />}
              <Text style={[styles.msgText, msg.sender === 'me' && styles.msgTextMe]}>{msg.text}</Text>
              <View style={styles.msgMeta}>
                <Text style={styles.msgTime}>{msg.time}</Text>
                {msg.sender === 'me' && <StatusIcon status={msg.status} />}
              </View>
            </View>
          ))}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        <View style={styles.inputBar}>
          <TouchableOpacity onPress={handleImageUpload} style={styles.attachBtn}>
            <ImageIcon size={18} color={theme.colors.muted} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.muted}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- RENDER: LIST VIEW (Main) ---
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.mainTitle}>Messages</Text>
          {totalUnread > 0 && <Text style={styles.subTitle}>{totalUnread} unread</Text>}
        </View>
        <TouchableOpacity style={styles.newChatBtn} onPress={() => setView('new')}>
          <Text style={styles.newChatBtnText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={14} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.flexOne}>
        {filteredConversations.map(convo => (
          <TouchableOpacity key={convo.shopId} style={styles.listItem} onPress={() => { setActiveConvo(convo.shopId); setView('chat'); }}>
            <AvatarComp name={convo.shopName} online={convo.online} />
            <View style={styles.listItemContent}>
              <View style={styles.listItemRow}>
                <Text style={styles.listItemName}>{convo.shopName}</Text>
                <Text style={styles.listItemTime}>{convo.lastTime}</Text>
              </View>
              <Text style={styles.listItemSub} numberOfLines={1}>{convo.lastMessage}</Text>
            </View>
            {convo.unread > 0 && <Badge count={convo.unread} />}
          </TouchableOpacity>
        ))}
        {filteredConversations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No conversations found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Updated styles to match CustomerPaymentsScreen padding logic
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
    // Added padding here to match 'content' style in PaymentsScreen
    padding: theme.spacing.lg, 
  },
  flexOne: { flex: 1 },
  
  // Header styles aligned
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backBtn: { padding: 8, marginLeft: -8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  
  // List View styles aligned
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xl }, // Matched margin
  mainTitle: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  subTitle: { fontSize: 12, color: theme.colors.muted, marginTop: 2 },
  newChatBtn: { backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.md },
  newChatBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 36, color: theme.colors.text, fontSize: 14 },
  
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  listItemContent: { flex: 1, marginLeft: 12 },
  listItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  listItemName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  listItemTime: { fontSize: 10, color: theme.colors.muted },
  listItemSub: { fontSize: 13, color: theme.colors.muted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: theme.colors.muted },

  // Chat View
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: 10 },
  chatHeaderInfo: { marginLeft: 12, flex: 1 },
  statusText: { fontSize: 12, color: theme.colors.muted, marginTop: 1 },
  
  messageList: { paddingVertical: 16 }, // Only vertical padding here
  
  // Messages
  messageBubble: { maxWidth: '75%', marginBottom: 12, padding: 12, borderRadius: 16 },
  msgMe: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  msgShop: { alignSelf: 'flex-start', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, color: theme.colors.text },
  msgTextMe: { color: '#000' },
  msgMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, gap: 4 },
  msgTime: { fontSize: 10, color: 'rgba(0,0,0,0.5)' },
  msgImage: { width: 200, height: 150, borderRadius: 8, marginBottom: 8 },
  
  // Typing
  typingBubble: { alignSelf: 'flex-start', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: 14, borderRadius: 16, borderBottomLeftRadius: 4, flexDirection: 'row', gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.muted },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background, marginTop: 10 },
  attachBtn: { padding: 8 },
  textInput: { flex: 1, height: 40, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, color: theme.colors.text, marginRight: 8 },
  sendBtn: { width: 40, height: 40, backgroundColor: theme.colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: theme.colors.muted },

  // Avatar
  avatarContainer: { position: 'relative', width: 48, height: 48 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(212, 175, 55, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  avatarText: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.background },
  online: { backgroundColor: '#22c55e' },
  offline: { backgroundColor: theme.colors.muted },

  // Badge
  badge: { backgroundColor: theme.colors.primary, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#000' },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: theme.colors.muted }
});

export default CustomerChatScreen;
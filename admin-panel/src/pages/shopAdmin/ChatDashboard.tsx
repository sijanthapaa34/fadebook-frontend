import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Search, Filter, Check, CheckCheck, Circle, Image,
  Users, Calendar, MessageSquare, UserPlus, MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { seedBarbers } from '@/data/seed';

type MessageStatus = 'sent' | 'delivered' | 'seen';
type ChatFilter = 'all' | 'unread' | 'active-bookings';

interface AdminMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  time: string;
  status: MessageStatus;
  image?: string;
}

interface CustomerChat {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  hasActiveBooking: boolean;
  assignedBarber?: string;
  messages: AdminMessage[];
}

const mockChats: CustomerChat[] = [
  {
    customerId: 'c1', customerName: 'James Wilson',
    lastMessage: 'Can I get a beard trim added?', lastTime: '2:32 PM',
    unread: 1, online: true, hasActiveBooking: true, assignedBarber: 'b1',
    messages: [
      { id: '1', sender: 'admin', text: 'Hey James! Your appointment is confirmed for tomorrow at 10 AM.', time: '2:30 PM', status: 'seen' },
      { id: '2', sender: 'customer', text: 'Great, thanks! Can I get a beard trim added?', time: '2:32 PM', status: 'delivered' },
    ],
  },
  {
    customerId: 'c2', customerName: 'Robert Taylor',
    lastMessage: 'What fade styles do you recommend?', lastTime: '1:45 PM',
    unread: 3, online: true, hasActiveBooking: true,
    messages: [
      { id: '1', sender: 'customer', text: 'Hi! I have an appointment tomorrow.', time: '1:40 PM', status: 'seen' },
      { id: '2', sender: 'customer', text: 'What fade styles do you recommend?', time: '1:42 PM', status: 'delivered' },
      { id: '3', sender: 'customer', text: 'I was thinking something like a mid-taper fade.', time: '1:45 PM', status: 'delivered' },
    ],
  },
  {
    customerId: 'c3', customerName: 'Mike Davis',
    lastMessage: 'Thanks for the info!', lastTime: '12:20 PM',
    unread: 0, online: false, hasActiveBooking: true, assignedBarber: 'b1',
    messages: [
      { id: '1', sender: 'customer', text: 'Do you guys do hot towel shaves?', time: '12:15 PM', status: 'seen' },
      { id: '2', sender: 'admin', text: 'Absolutely! It\'s one of our premium services. $40 for about 35 minutes.', time: '12:17 PM', status: 'seen' },
      { id: '3', sender: 'customer', text: 'Thanks for the info!', time: '12:20 PM', status: 'seen' },
    ],
  },
  {
    customerId: 'c4', customerName: 'Chris Brown',
    lastMessage: 'Do you have any openings this Saturday?', lastTime: '11:30 AM',
    unread: 1, online: false, hasActiveBooking: false,
    messages: [
      { id: '1', sender: 'customer', text: 'Do you have any openings this Saturday?', time: '11:30 AM', status: 'delivered' },
    ],
  },
  {
    customerId: 'c5', customerName: 'David Kim',
    lastMessage: 'See you tomorrow!', lastTime: 'Yesterday',
    unread: 0, online: false, hasActiveBooking: false,
    messages: [
      { id: '1', sender: 'customer', text: 'Hey, is Marcus available tomorrow at 3 PM?', time: 'Yesterday', status: 'seen' },
      { id: '2', sender: 'admin', text: 'Let me check... Yes he\'s free at 3 PM!', time: 'Yesterday', status: 'seen' },
      { id: '3', sender: 'customer', text: 'See you tomorrow!', time: 'Yesterday', status: 'seen' },
    ],
  },
];

const StatusIcon = ({ status }: { status: MessageStatus }) => {
  if (status === 'sent') return <Check size={12} className="text-muted-foreground" />;
  if (status === 'delivered') return <CheckCheck size={12} className="text-muted-foreground" />;
  return <CheckCheck size={12} className="text-primary" />;
};

const ChatDashboard = () => {
  const [chats, setChats] = useState<CustomerChat[]>(mockChats);
  const [activeChat, setActiveChat] = useState<string | null>(mockChats[0].customerId);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChat = chats.find(c => c.customerId === activeChat);
  const shopBarbers = seedBarbers.filter(b => b.shopId === 1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [currentChat?.messages.length, scrollToBottom]);

  const handleSend = () => {
    if (!message.trim() || !activeChat) return;
    const newMsg: AdminMessage = {
      id: Date.now().toString(), sender: 'admin', text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      status: 'sent',
    };
    setChats(prev => prev.map(c =>
      c.customerId === activeChat
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, lastTime: newMsg.time, unread: 0 }
        : c
    ));
    setMessage('');
    setTimeout(() => {
      setChats(prev => prev.map(c =>
        c.customerId === activeChat
          ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' as MessageStatus } : m) }
          : c
      ));
    }, 800);
  };

  const handleAssignBarber = (barberId: number) => {
    if (!activeChat) return;
    const barber = shopBarbers.find(b => b.id === barberId);
    // setChats(prev => prev.map(c =>
    //   c.customerId === activeChat ? { ...c, assignedBarber: barberId } : c
    // ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    const url = URL.createObjectURL(file);
    const newMsg: AdminMessage = {
      id: Date.now().toString(), sender: 'admin',
      text: '📷 Photo', time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      status: 'sent', image: url,
    };
    setChats(prev => prev.map(c =>
      c.customerId === activeChat
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: '📷 Photo', lastTime: newMsg.time }
        : c
    ));
    e.target.value = '';
  };

  const filteredChats = chats
    .filter(c => c.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(c => {
      if (filter === 'unread') return c.unread > 0;
      if (filter === 'active-bookings') return c.hasActiveBooking;
      return true;
    });

  const totalUnread = chats.reduce((a, c) => a + c.unread, 0);
return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="pb-4">
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage customer conversations</p>
      </div>

      <div className="flex-1 min-h-0 flex rounded-xl border border-border overflow-hidden bg-card/30">
        
        {/* Left Panel: List */}
        <div className="w-80 border-r border-border flex flex-col bg-muted/10">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 bg-muted/30 border-border h-9" />
            </div>
          </div>
          <ScrollArea className="flex-1">
             {/* List items mapped here */}
             <div className="p-2">
              {mockChats.map(chat => (
                <button key={chat.customerId} onClick={() => setActiveChat(chat.customerId)} 
                  className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${activeChat === chat.customerId ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
                   <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                     {chat.customerName.charAt(0)}
                   </div>
                   <div className="flex-1 text-left">
                     <p className="text-sm font-medium truncate">{chat.customerName}</p>
                     <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                   </div>
                </button>
              ))}
             </div>
          </ScrollArea>
        </div>

        {/* Right Panel: Chat */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                   {currentChat.customerName.charAt(0)}
                 </div>
                 <div>
                   <p className="font-medium text-sm">{currentChat.customerName}</p>
                   <p className="text-xs text-muted-foreground">{currentChat.online ? 'Online' : 'Offline'}</p>
                 </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                 {/* Message bubbles mapped here */}
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border flex items-center gap-2">
                <Button variant="ghost" size="icon"><Image size={18} className="text-muted-foreground"/></Button>
                <Input placeholder="Type a reply..." className="bg-muted/30 border-border" />
                <Button variant="hero" size="icon"><Send size={16}/></Button>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Select a conversation
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatDashboard;
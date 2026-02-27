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
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Customer Messages</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalUnread > 0 ? `${totalUnread} unread conversations` : 'All caught up'}
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-0 rounded-xl border border-border overflow-hidden bg-card/30">
        {/* ── LEFT PANEL: Conversation List ── */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-border shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Search + Filter */}
          <div className="p-3 space-y-2 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30 border-border h-9 text-sm"
              />
            </div>
            <div className="flex gap-1">
              {([['all', 'All'], ['unread', 'Unread'], ['active-bookings', 'Bookings']] as const).map(([key, label]) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs px-3"
                  onClick={() => setFilter(key)}
                >
                  {label}
                  {key === 'unread' && totalUnread > 0 && (
                    <Badge className="ml-1 h-4 w-4 p-0 text-[9px] flex items-center justify-center">{totalUnread}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/50">
              {filteredChats.map(chat => (
                <button
                  key={chat.customerId}
                  onClick={() => setActiveChat(chat.customerId)}
                  className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${
                    activeChat === chat.customerId ? 'bg-primary/5' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="relative">
                    {/* <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                        {chat.customerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar> */}
                    <Circle
                      size={9}
                      className={`absolute -bottom-0.5 -right-0.5 ${chat.online ? 'fill-[hsl(142,70%,45%)] text-[hsl(142,70%,45%)]' : 'fill-muted-foreground text-muted-foreground'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium text-sm truncate">{chat.customerName}</p>
                      <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{chat.lastTime}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {chat.hasActiveBooking && <Calendar size={10} className="text-primary shrink-0" />}
                      <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                  {chat.unread > 0 && (
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                      {chat.unread}
                    </Badge>
                  )}
                </button>
              ))}
              {filteredChats.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No conversations found</div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── RIGHT PANEL: Active Chat ── */}
        <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setActiveChat(null)}>
                    <MessageSquare size={18} />
                  </Button>
                  <div className="relative">
                    {/* <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                        {currentChat.customerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar> */}
                    <Circle
                      size={8}
                      className={`absolute -bottom-0.5 -right-0.5 ${currentChat.online ? 'fill-[hsl(142,70%,45%)] text-[hsl(142,70%,45%)]' : 'fill-muted-foreground text-muted-foreground'}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{currentChat.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {currentChat.online ? 'Online' : 'Offline'}
                      {currentChat.hasActiveBooking && ' · Has active booking'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Assign barber */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground">
                        <UserPlus size={14} />
                        <span className="hidden sm:inline">
                          {currentChat.assignedBarber
                            // ? shopBarbers.find(b => b.id === currentChat.assignedBarber)?.name?.split(' ')[0]
                            // : 'Assign'
                            }
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {shopBarbers.map(barber => (
                        <DropdownMenuItem key={barber.id} onClick={() => handleAssignBarber(barber.id)}>
                          <div className="flex items-center gap-2">
                            {/* <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{barber.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{barber.name}</span>
                            {currentChat.assignedBarber === barber.id && <Check size={14} className="ml-auto text-primary" />} */}
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {currentChat.assignedBarber && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAssignBarber(0)} className="text-destructive">
                            Unassign
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {currentChat.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl text-sm p-3 ${
                        msg.sender === 'admin'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'glass-card rounded-bl-sm'
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="Shared" className="rounded-lg mb-2 max-h-48 object-cover w-full" />
                        )}
                        <p>{msg.text}</p>
                        <div className={`flex items-center gap-1 justify-end mt-1 ${
                          msg.sender === 'admin' ? 'text-primary-foreground/50' : 'text-muted-foreground'
                        }`}>
                          <span className="text-[10px]">{msg.time}</span>
                          {msg.sender === 'admin' && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="flex items-center gap-2 p-3 border-t border-border">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                  <Image size={18} />
                </Button>
                <Input
                  placeholder="Type a reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-muted/30 border-border"
                />
                <Button variant="hero" size="icon" className="shrink-0" onClick={handleSend} disabled={!message.trim()}>
                  <Send size={16} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare size={48} className="text-muted-foreground/30" />
              <p className="text-sm">Select a conversation to start replying</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;

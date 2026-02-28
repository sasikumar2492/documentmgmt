import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Smile, MoreVertical, Search, Phone, Video, Info, Plus, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  lastMessage: string;
  timestamp: string;
  isPinned?: boolean;
  isOnline?: boolean;
  unreadCount?: number;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isSidebarCollapsed?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, isSidebarCollapsed }) => {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'SC',
      avatarBg: 'from-blue-500 to-indigo-600',
      lastMessage: 'Perfect! I\'ll send you the meeting invite.',
      timestamp: 'Yesterday',
      isPinned: true,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Mike Johnson',
      avatar: 'MJ',
      avatarBg: 'from-purple-500 to-pink-600',
      lastMessage: 'Great work! I\'ll review it this afternoon.',
      timestamp: '2h ago',
      isOnline: false,
    },
    {
      id: '3',
      name: 'Emily Davis',
      avatar: 'ED',
      avatarBg: 'from-pink-500 to-rose-600',
      lastMessage: 'I\'ve uploaded the new design mockups',
      timestamp: '5h ago',
      isOnline: false,
    },
    {
      id: '4',
      name: 'Development Team',
      avatar: '🚀',
      avatarBg: 'from-indigo-500 to-purple-600',
      lastMessage: 'Sounds good! Let\'s sync up tomorrow morning',
      timestamp: '1d ago',
      isPinned: true,
      isOnline: false,
    },
    {
      id: '5',
      name: 'Design Review',
      avatar: '🎨',
      avatarBg: 'from-orange-500 to-amber-600',
      lastMessage: 'The gradient backgrounds look amazing!',
      timestamp: '2d ago',
      isPinned: true,
      isOnline: false,
    },
    {
      id: '6',
      name: 'Project Alpha',
      avatar: '⚡',
      avatarBg: 'from-violet-500 to-purple-600',
      lastMessage: 'Sprint planning meeting tomorrow at 10 AM',
      timestamp: '3d ago',
      isPinned: true,
      isOnline: false,
    },
  ];

  const messagesByConversation: Record<string, Message[]> = {
    '1': [
      {
        id: '1',
        sender: 'Sarah Chen',
        message: 'Hey, can we discuss the Q4 roadmap today?',
        timestamp: 'Yesterday',
        isCurrentUser: false,
      },
      {
        id: '2',
        sender: 'You',
        message: 'Sure! I have some time at 2 PM. Does that work?',
        timestamp: 'Yesterday',
        isCurrentUser: true,
      },
      {
        id: '3',
        sender: 'Sarah Chen',
        message: 'Perfect! I\'ll send you the meeting invite.',
        timestamp: 'Yesterday',
        isCurrentUser: false,
      },
    ],
    '2': [
      {
        id: '1',
        sender: 'Mike Johnson',
        message: 'Great work! I\'ll review it this afternoon.',
        timestamp: '2h ago',
        isCurrentUser: false,
      },
    ],
    '3': [
      {
        id: '1',
        sender: 'Emily Davis',
        message: 'I\'ve uploaded the new design mockups',
        timestamp: '5h ago',
        isCurrentUser: false,
      },
    ],
  };

  const [messages, setMessages] = useState<Message[]>(messagesByConversation[selectedConversation] || []);

  useEffect(() => {
    setMessages(messagesByConversation[selectedConversation] || []);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true,
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  if (!isOpen) return null;

  const leftOffset = isSidebarCollapsed ? '64px' : '256px'; // 64px for collapsed (w-16), 256px for expanded (w-64)

  return (
    <div className="fixed right-0 bottom-0 bg-slate-100 shadow-2xl z-40 flex border-t border-slate-200 transition-all duration-300" style={{ top: '64px', left: leftOffset }}>
      {/* Left Sidebar - Conversations List */}
      <div className={`w-60 bg-slate-100 border-r border-slate-300 flex flex-col h-full ${isSidebarCollapsed ? 'hidden' : ''}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-300 bg-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-slate-800 font-semibold">Messages</h2>
            </div>
            <button className="w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center text-white transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-slate-100">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full p-3 flex items-start gap-3 hover:bg-slate-200 transition-colors border-b border-slate-300 ${
                selectedConversation === conversation.id ? 'bg-white border-l-4 border-l-blue-600' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${conversation.avatarBg} flex items-center justify-center text-white font-semibold text-sm`}>
                  {conversation.avatar}
                </div>
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium truncate ${
                      selectedConversation === conversation.id ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {conversation.name}
                    </span>
                    {conversation.isPinned && (
                      <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 truncate">{conversation.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Chat Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentConversation?.avatarBg} flex items-center justify-center text-white font-semibold`}>
                {currentConversation?.avatar}
              </div>
              {currentConversation?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold">{currentConversation?.name}</h3>
              <p className="text-xs text-green-600">
                {currentConversation?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <Info className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <MoreVertical className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4 max-w-4xl">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[70%] ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar - only for other users */}
                    {!msg.isCurrentUser && (
                      <div className="flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentConversation?.avatarBg} flex items-center justify-center text-white font-semibold text-sm`}>
                          {currentConversation?.avatar}
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {!msg.isCurrentUser && (
                        <span className="text-xs text-slate-600 mb-1 ml-1">{msg.sender}</span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          msg.isCurrentUser
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-slate-200 text-slate-800 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-xs text-slate-500 mt-1 ${msg.isCurrentUser ? 'text-right mr-1' : 'ml-12'}`}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white px-6 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <Paperclip className="h-5 w-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                <Smile className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>

            <button className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
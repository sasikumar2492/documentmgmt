import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, Phone, Video, Info, Plus, HelpCircle, ArrowLeft, Users, Archive, Pin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ViewType } from '../types';

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

interface ChatProps {
  onNavigate: (view: ViewType) => void;
}

export const Chat: React.FC<ChatProps> = ({ onNavigate }) => {
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
      name: 'Michael Rodriguez',
      avatar: 'MR',
      avatarBg: 'from-purple-500 to-pink-600',
      lastMessage: 'The report looks good!',
      timestamp: '2 days ago',
      isOnline: false,
      unreadCount: 3,
    },
    {
      id: '3',
      name: 'Quality Team',
      avatar: 'QT',
      avatarBg: 'from-green-500 to-teal-600',
      lastMessage: 'Review completed for REQ-001',
      timestamp: '3 days ago',
      isPinned: true,
      isOnline: true,
      unreadCount: 1,
    },
    {
      id: '4',
      name: 'Emma Johnson',
      avatar: 'EJ',
      avatarBg: 'from-orange-500 to-red-600',
      lastMessage: 'Thanks for the update!',
      timestamp: '1 week ago',
      isOnline: false,
    },
    {
      id: '5',
      name: 'Engineering Dept',
      avatar: 'ED',
      avatarBg: 'from-indigo-500 to-blue-600',
      lastMessage: 'New template uploaded',
      timestamp: '2 weeks ago',
      isOnline: true,
    },
  ];

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        sender: 'Sarah Chen',
        message: 'Hi! How are you today?',
        timestamp: '9:30 AM',
        isCurrentUser: false,
      },
      {
        id: '2',
        sender: 'You',
        message: 'I\'m doing great! Just reviewing the latest approval requests.',
        timestamp: '9:32 AM',
        isCurrentUser: true,
      },
      {
        id: '3',
        sender: 'Sarah Chen',
        message: 'That\'s wonderful! Do you need any help with the QA review process?',
        timestamp: '9:35 AM',
        isCurrentUser: false,
      },
      {
        id: '4',
        sender: 'You',
        message: 'Yes, actually! I have some questions about the workflow configuration.',
        timestamp: '9:40 AM',
        isCurrentUser: true,
      },
      {
        id: '5',
        sender: 'Sarah Chen',
        message: 'Perfect! I\'ll send you the meeting invite.',
        timestamp: 'Yesterday',
        isCurrentUser: false,
      },
    ],
    '2': [
      {
        id: '1',
        sender: 'Michael Rodriguez',
        message: 'Hey! I just finished the initial review.',
        timestamp: '2 days ago',
        isCurrentUser: false,
      },
      {
        id: '2',
        sender: 'Michael Rodriguez',
        message: 'The report looks good!',
        timestamp: '2 days ago',
        isCurrentUser: false,
      },
    ],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isCurrentUser: true,
      };

      setMessages(prev => ({
        ...prev,
        [selectedConversation]: [...(prev[selectedConversation] || []), newMsg],
      }));
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = messages[selectedConversation] || [];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Messages
            </h2>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-300"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-blue-50 ${
                selectedConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${conv.avatarBg} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                    {conv.avatar}
                  </div>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {conv.name}
                      </h3>
                      {conv.isPinned && (
                        <Pin className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{conv.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount && (
                      <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentConversation.avatarBg} flex items-center justify-center text-white font-semibold`}>
                    {currentConversation.avatar}
                  </div>
                  {currentConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-slate-800 font-semibold">{currentConversation.name}</h3>
                  <p className="text-xs text-slate-500">
                    {currentConversation.isOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Info className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md ${msg.isCurrentUser ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.isCurrentUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                      }`}
                    >
                      {!msg.isCurrentUser && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">{msg.sender}</p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <p className={`text-xs text-slate-500 mt-1 ${msg.isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex items-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10 border-slate-300"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-slate-700 font-semibold mb-2">No conversation selected</h3>
              <p className="text-sm text-slate-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

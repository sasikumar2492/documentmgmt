import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, User, Bot } from 'lucide-react';
import { Button } from './ui/button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Assistant. How can I help you today with document management?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const followUpPrompts = [
    "How do I upload a template?",
    "Show me pending approvals",
    "What's the workflow for Engineering?",
    "Generate a summary report",
    "Help with form validation",
    "Explain the approval process"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (content.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('upload') || lowerInput.includes('template')) {
      return 'To upload a template:\n1. Navigate to "Upload Templates" in the sidebar\n2. Select the department from the dropdown\n3. Click "Choose File" and select your .xlsx file\n4. Click "Upload Template"\n\nThe template will be available for creating requests in that department.';
    } else if (lowerInput.includes('approval') || lowerInput.includes('pending')) {
      return 'You can view pending approvals in the Reports section. Each department has its own workflow:\n• Engineering: 3-stage approval\n• Manufacturing: 4-stage approval\n• Quality Assurance: 5-stage approval\n• Procurement: 3-stage approval\n• Operations: 3-stage approval\n• R&D: 4-stage approval';
    } else if (lowerInput.includes('workflow') || lowerInput.includes('engineering')) {
      return 'The Engineering workflow consists of:\n1. Initial Review - Department Lead\n2. Technical Review - Senior Engineer\n3. Final Approval - Engineering Manager\n\nDocuments automatically follow this workflow when created from Engineering templates.';
    } else if (lowerInput.includes('report') || lowerInput.includes('summary')) {
      return 'You can generate reports by:\n1. Going to the Reports section\n2. Selecting the date range and filters\n3. Choosing the export format (PDF/Excel)\n4. Clicking "Generate Report"\n\nReports include all submitted requests with their current status.';
    } else if (lowerInput.includes('validation') || lowerInput.includes('form')) {
      return 'Form validation ensures:\n• All required fields are filled\n• Data formats are correct (dates, numbers, text)\n• File uploads meet size requirements\n• Quality assurance labels are properly positioned\n\nThe system will highlight any errors before submission.';
    } else if (lowerInput.includes('process') || lowerInput.includes('explain')) {
      return 'The approval process:\n1. User creates request from template\n2. Form is filled with required information\n3. Request is submitted for approval\n4. Follows department-specific workflow\n5. Each stage requires approval/rejection\n6. Final status is recorded in reports\n\nYou can track progress in the Document Management section.';
    } else {
      return `I understand you're asking about "${userInput}". I can help you with:\n• Uploading templates\n• Managing approvals\n• Understanding workflows\n• Generating reports\n• Form validation\n• Approval processes\n\nPlease let me know which topic you'd like to explore!`;
    }
  };

  const handleFollowUpClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* AI Assistant Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 px-3 py-2 rounded-lg"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm">AI Assistant</span>
      </Button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed right-6 top-20 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-purple-100">Here to help you</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-[280px] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up Prompts */}
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <p className="text-xs text-slate-600 mb-2 px-1">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {followUpPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpClick(prompt)}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="border-t border-slate-200 p-4 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-slate-800 placeholder:text-slate-400"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200 px-4"
                disabled={inputValue.trim() === ''}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
};
// app/components/Chatbot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, X, ImagePlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ChatHistory from '@/app/components/ChatHistory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: { [key: string]: Message };
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'cadvisor_chat_sessions';

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

const Chatbot = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [attachedImages, setAttachedImages] = useState<{ url: string; name: string }[]>([]);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = loadSessions();
    if (stored.length > 0) {
      setSessions(stored);
      setCurrentSessionId(stored[0].id);
    } else {
      const id = uuidv4();
      const first: ChatSession = { id, title: 'แชทใหม่', messages: {}, createdAt: Date.now(), updatedAt: Date.now() };
      setSessions([first]);
      setCurrentSessionId(id);
      saveSessions([first]);
    }
  }, []);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  const createNewSession = () => {
    const id = uuidv4();
    const newSession: ChatSession = { id, title: 'แชทใหม่', messages: {}, createdAt: Date.now(), updatedAt: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(id);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImages(prev => [...prev, { url: reader.result as string, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && attachedImages.length === 0) return;
    if (!currentSessionId) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      images: attachedImages.length > 0 ? attachedImages.map(img => img.url) : undefined,
      timestamp: Date.now()
    };

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const updatedMessages = {
      ...currentSession.messages,
      [`user_${userMessage.timestamp}`]: userMessage
    };

    const isFirstMessage = Object.keys(currentSession.messages).length === 0;
    const sessionTitle = isFirstMessage
      ? inputMessage.substring(0, 30) + (inputMessage.length > 30 ? '...' : '')
      : currentSession.title;

    const updatedSession = { ...currentSession, title: sessionTitle, messages: updatedMessages, updatedAt: Date.now() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? updatedSession : s));
    setInputMessage('');
    setAttachedImages([]);
    setIsLoading(true);

    const messagesForApi = Object.values(updatedMessages)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(msg => {
        if (msg.images && msg.images.length > 0) {
          return {
            role: msg.role,
            content: [
              ...(msg.content ? [{ type: 'text', text: msg.content }] : []),
              ...msg.images.map(url => ({ type: 'image_url', image_url: { url } }))
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.content, timestamp: Date.now() };
      const finalMessages = { ...updatedMessages, [`assistant_${assistantMessage.timestamp}`]: assistantMessage };
      const finalSession = { ...updatedSession, messages: finalMessages, updatedAt: Date.now() };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? finalSession : s));
    } catch (error: any) {
      const errMessage: Message = { role: 'assistant', content: `เกิดข้อผิดพลาด: ${error.message}`, timestamp: Date.now() };
      const finalMessages = { ...updatedMessages, [`assistant_${errMessage.timestamp}`]: errMessage };
      const finalSession = { ...updatedSession, messages: finalMessages, updatedAt: Date.now() };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? finalSession : s));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title } : s));
    setEditingTitle(null);
    setNewTitle('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession
    ? Object.values(currentSession.messages).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden">

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — overlay on mobile, push on desktop */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30
        ${sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:w-0 lg:translate-x-0'}
        transition-all duration-300 bg-gray-900 text-white flex flex-col overflow-hidden
        lg:${sidebarOpen ? 'w-64' : 'w-0'}
      `}>
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>แชทใหม่</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">ประวัติแชท</h3>
          <ChatHistory
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => {
              setCurrentSessionId(id);
              // close sidebar on mobile after selecting
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            onDeleteSession={deleteSession}
            onEditTitle={(sessionId, title) => {
              setEditingTitle(sessionId);
              setNewTitle(title);
            }}
            editingTitle={editingTitle}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            onSaveTitle={updateSessionTitle}
            onCancelEdit={() => {
              setEditingTitle(null);
              setNewTitle('');
            }}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 py-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-base sm:text-xl font-semibold text-gray-800 truncate">
              {currentSession?.title || 'แชทใหม่'}
            </h1>
          </div>
          <div className="hidden sm:block text-sm text-gray-500 flex-shrink-0">ผู้เชี่ยวชาญด้านภาษีประเทศไทย</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 sm:py-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2">ยินดีต้อนรับสู่ C-Advisor Chatbot</h2>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-3xl px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {message.images && message.images.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mb-2 ${message.images.length > 1 ? '' : ''}`}>
                      {message.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="attached"
                          className="max-h-48 max-w-xs rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {message.content && <div className="whitespace-pre-wrap">{message.content}</div>}
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 focus-within:border-gray-300 focus-within:shadow-md transition-all duration-200">

              {/* Attached image previews */}
              {attachedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachedImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-16 w-16 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={() => removeAttachedImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* + button with dropdown */}
                <div className="relative mt-0.5 flex-shrink-0" ref={plusMenuRef}>
                  <button
                    onClick={() => setPlusMenuOpen(prev => !prev)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {plusMenuOpen && (
                    <div className="absolute bottom-10 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg py-1 min-w-[180px]">
                      <button
                        onClick={() => {
                          setPlusMenuOpen(false);
                          imageInputRef.current?.click();
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ImagePlus className="w-4 h-4 text-gray-500" />
                        เพิ่มรูปภาพและไฟล์
                      </button>
                    </div>
                  )}
                </div>

                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="ถามอะไรก็ได้"
                  className="flex-1 resize-none bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-base leading-relaxed min-h-[28px] max-h-48"
                  rows={1}
                  disabled={isLoading}
                />

                <button
                  onClick={sendMessage}
                  disabled={(!inputMessage.trim() && attachedImages.length === 0) || isLoading}
                  className="mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white transition-all duration-200"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageAttach}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Shift+Enter เพื่อขึ้นบรรทัดใหม่</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

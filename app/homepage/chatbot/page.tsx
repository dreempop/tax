// app/components/Chatbot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, X, ImagePlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

function extractFollowUpsAndClean(textRaw: string): { cleaned: string; followUps: string[] } {
  const text = textRaw || '';

  // ── Primary: structured delimiters ──────────────────────────────────────
  const startTag = '---FOLLOW_UP_START---';
  const endTag = '---FOLLOW_UP_END---';
  const startIdx = text.indexOf(startTag);

  if (startIdx !== -1) {
    const afterStart = text.slice(startIdx + startTag.length);
    const endIdx = afterStart.indexOf(endTag);
    const block = endIdx !== -1 ? afterStart.slice(0, endIdx) : afterStart;

    const lines = block.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const arr: string[] = [];
    for (const ln of lines) {
      const m = ln.match(/^[0-9]+[.)]\s*(.+)$/);
      if (m && m[1]) {
        const q = m[1].replace(/^["'*(\[]+|["'*)\]]+$/g, '').trim();
        if (q.length >= 4) arr.push(q);
        if (arr.length >= 3) break;
      }
    }

    // Strip the entire follow-up block (include any surrounding --- lines)
    const cutIdx = text.lastIndexOf('\n', startIdx - 1) !== -1
      ? text.lastIndexOf('\n', startIdx - 1)
      : startIdx;
    const cleaned = text.slice(0, cutIdx).trim();
    return { cleaned, followUps: arr.slice(0, 3) };
  }

  // ── Fallback: Thai section headers ──────────────────────────────────────
  const headers = [
    'ไกด์แนะนำคำถามต่อไป',
    'คำถามที่เกี่ยวข้อง',
    'ไกด์แนะนำคำ',
    'คำถามแนะนำ',
    'Recommended Prompts',
  ];

  let foundIdx = -1;
  let foundHeaderLen = 0;

  for (const h of headers) {
    const regex = new RegExp(`(?:^|\\n)[#*\\s]*(?:\\*{1,2})?${h}[^\\n]*\\n?`, 'gi');
    for (const m of text.matchAll(regex)) {
      const startsWithNL = m[0].startsWith('\n');
      const idx = m.index! + (startsWithNL ? 1 : 0);
      if (foundIdx === -1 || idx < foundIdx) {
        foundIdx = idx;
        foundHeaderLen = m[0].length - (startsWithNL ? 1 : 0);
      }
    }
  }

  if (foundIdx === -1) {
    return { cleaned: text.trim(), followUps: [] };
  }

  const tail = text.slice(foundIdx + foundHeaderLen);
  const lines = tail.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const arr: string[] = [];

  for (const ln of lines) {
    const core = ln.replace(/^[#*\s\d.)•\-]+|[*\s]+$/g, '').trim();
    if (core.endsWith(':') || core.length < 4) continue;

    const m = ln.match(/^(?:[0-9]+[.)]\s*|\*\s*|-\s*|•\s*)(.+)$/);
    if (m && m[1]) {
      const q = m[1].replace(/^\*{1,2}|\*{1,2}$/g, '').replace(/^["'(\[]+|["')\]]+$/g, '').trim();
      if (q.length >= 4) { arr.push(q); }
      if (arr.length >= 3) break;
    }
  }

  return { cleaned: text.slice(0, foundIdx).trim(), followUps: arr.slice(0, 3) };
}

function sanitizeTail(textRaw: string): string {
  let t = textRaw || '';
  t = t.replace(/[ \t\n]*[#*:\- \t"'`]+$/g, '');
  t = t.replace(/\n{3,}$/g, '\n\n');
  return t.trim();
}

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
  } catch { }
}

const PROMPT_POOL: { keywords: string[]; prompts: string[] }[] = [
  { keywords: ['ลดหย่อน', 'ค่าลดหย่อน'], prompts: ['ลดหย่อนอะไรได้บ้างในปีนี้?', 'ลดหย่อนบุตรได้เท่าไหร่?', 'ลดหย่อนบิดามารดาทำอย่างไร?'] },
  { keywords: ['rmf', 'ssf', 'กองทุน', 'thai esg'], prompts: ['RMF กับ SSF ต่างกันอย่างไร?', 'ลงทุน Thai ESG ลดหย่อนได้เท่าไหร่?', 'กองทุนสำรองเลี้ยงชีพนับรวม RMF ไหม?'] },
  { keywords: ['ประกัน', 'เบี้ยประกัน'], prompts: ['ประกันชีวิตลดหย่อนได้สูงสุดเท่าไหร่?', 'ประกันสุขภาพพ่อแม่ลดหย่อนได้ไหม?', 'ประกันบำนาญให้ผลอย่างไร?'] },
  { keywords: ['คำนวณ', 'ภาษี', 'เสีย', 'อัตรา'], prompts: ['ช่วยคำนวณภาษีให้หน่อย', 'รายได้เท่าไหร่ถึงต้องเสียภาษี?', 'เงินได้สุทธิคำนวณอย่างไร?'] },
  { keywords: ['ยื่น', 'แบบ', 'ภ.ง.ด', 'กำหนด'], prompts: ['ยื่นภาษีออนไลน์ทำอย่างไร?', 'กำหนดยื่นภาษีปีนี้เมื่อไหร่?', 'ยื่นเกินกำหนดมีค่าปรับไหม?'] },
  { keywords: ['บ้าน', 'ดอกเบี้ย', 'กู้'], prompts: ['ดอกเบี้ยบ้านลดหย่อนได้เท่าไหร่?', 'กู้ร่วมลดหย่อนดอกเบี้ยอย่างไร?', 'ซื้อบ้านหลังที่สองลดหย่อนได้ไหม?'] },
  { keywords: ['freelance', 'ฟรีแลนซ์', 'ค้าขาย', 'ธุรกิจ', '40(8)', '40(2)'], prompts: ['Freelance หักค่าใช้จ่ายได้เท่าไหร่?', 'รายได้จากธุรกิจยื่นแบบไหน?', 'VAT กับภาษีบุคคลธรรมดาต่างกันอย่างไร?'] },
];

const DEFAULT_PROMPTS = ['วางแผนภาษีอย่างไรให้ประหยัดสุด?', 'ลดหย่อนอะไรได้บ้างในปีนี้?', 'คำนวณภาษีของฉันหน่อย'];

function getSuggestedPrompts(text: string): string[] {
  const lower = text.toLowerCase();
  for (const group of PROMPT_POOL) {
    if (group.keywords.some(k => lower.includes(k))) {
      return group.prompts;
    }
  }
  return DEFAULT_PROMPTS;
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
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
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
    setFollowUps([]);
  };

  // Clear follow-ups when switching sessions
  useEffect(() => {
    setFollowUps([]);
  }, [currentSessionId]);

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

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText ?? inputMessage;
    if (!text.trim() && attachedImages.length === 0) return;
    if (!currentSessionId) return;
    setSuggestedPrompts([]);

    const userMessage: Message = {
      role: 'user',
      content: text,
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
    if (!overrideText) setInputMessage('');
    else setInputMessage('');
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
      const { cleaned, followUps: fqs } = extractFollowUpsAndClean(data.content);
      const cleanedContent = sanitizeTail(cleaned);
      const assistantMessage: Message = { role: 'assistant', content: cleanedContent, timestamp: Date.now() };
      const finalMessages = { ...updatedMessages, [`assistant_${assistantMessage.timestamp}`]: assistantMessage };
      const finalSession = { ...updatedSession, messages: finalMessages, updatedAt: Date.now() };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? finalSession : s));
      // Prefer server-generated followUps; fall back to client-side extraction
      setFollowUps(Array.isArray(data.followUps) && data.followUps.length > 0 ? data.followUps : fqs);
      setSuggestedPrompts(getSuggestedPrompts(data.content));
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

        {/* Sub-header */}
        <div className="bg-white border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
              {currentSession?.title || 'C-Advisor Chatbot'}
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
                    className={`max-w-[85%] sm:max-w-3xl px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ${message.role === 'user'
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
                    {message.content && (
                      message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 prose-table:text-sm prose-pre:bg-gray-100 prose-code:text-green-700 prose-code:bg-green-50 prose-code:px-1 prose-code:rounded prose-table:w-full prose-th:bg-gray-50 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1 prose-td:border prose-th:border">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )
                    )}
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
            {followUps.length > 0 && !isLoading && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-gray-400 px-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.416A1 1 0 0118 17v1a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1a1 1 0 01-.293-.707l-.347-.416z" /></svg>
                  คำถามแนะนำ
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFollowUps([]);
                        sendMessage(q);
                      }}
                      className="text-sm bg-white border border-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 text-gray-600 px-3.5 py-1.5 rounded-full transition-all duration-150 text-left leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          )}
          {/* Suggested prompts */}
          {!isLoading && suggestedPrompts.length > 0 && messages.length > 0 && (
            <div className="flex flex-col items-start gap-2 pl-1">
              <p className="text-xs text-gray-400 font-medium">💡 คำถามที่เกี่ยวข้อง</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputMessage(prompt);
                      setSuggestedPrompts([]);
                      setTimeout(() => textareaRef.current?.focus(), 0);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all duration-150 shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
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
                <button
                  onClick={createNewSession}
                  title="แชทใหม่"
                  className="mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border border-gray-200 hover:bg-green-50 hover:border-green-300 text-gray-500 hover:text-green-600 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
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

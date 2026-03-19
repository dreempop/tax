// app/components/ChatHistory.tsx
import { useState } from 'react';
import { MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onEditTitle: (sessionId: string, title: string) => void;
  editingTitle: string | null;
  newTitle: string;
  setNewTitle: (title: string) => void;
  onSaveTitle: (sessionId: string, title: string) => void;
  onCancelEdit: () => void;
}

const ChatHistory = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onEditTitle,
  editingTitle,
  newTitle,
  setNewTitle,
  onSaveTitle,
  onCancelEdit
}: ChatHistoryProps) => {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'วันนี้';
    } else if (diffInDays === 1) {
      return 'เมื่อวาน';
    } else if (diffInDays < 7) {
      return `${diffInDays} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
            currentSessionId === session.id
              ? 'bg-gray-800'
              : 'hover:bg-gray-800'
          }`}
          onClick={() => onSelectSession(session.id)}
          onMouseEnter={() => setHoveredSession(session.id)}
          onMouseLeave={() => setHoveredSession(null)}
        >
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
            <div className="flex-1 min-w-0">
              {editingTitle === session.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveTitle(session.id, newTitle);
                    }}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelEdit();
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-white truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {formatDate(session.updatedAt)}
                  </p>
                </>
              )}
            </div>
          </div>
          
          {hoveredSession === session.id && editingTitle !== session.id && (
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTitle(session.id, session.title);
                }}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
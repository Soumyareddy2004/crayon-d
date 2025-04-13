import React from 'react';
import { Message } from '../types/chat';
import { History } from 'lucide-react';

interface ChatHistoryProps {
  messages: Message[];
  onClose: () => void;
}

export default function ChatHistory({ messages, onClose }: ChatHistoryProps) {
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(groupedMessages).reverse().map(([date, dayMessages]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
              <div className="space-y-4">
                {dayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'assistant' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'assistant'
                          ? 'bg-gray-100'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
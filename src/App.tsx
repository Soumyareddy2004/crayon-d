import React, { useState, useEffect } from 'react';
import { Bot, LogIn, History } from 'lucide-react';
import Chat from './components/Chat';
import AuthModal from './components/AuthModal';
import ChatHistory from './components/ChatHistory';
import { Message, MarketData } from './types/chat';
import { supabase } from './lib/supabase';
import { saveMessage, getSimilarMessages } from './lib/chat';
import { getMarketData } from './lib/market';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your retirement investment advisor. How can I help you plan for your financial future?',
      createdAt: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user.id ?? null;
      setUserId(newUserId);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getMarketData(['SPY', 'AGG', 'BIL']);
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!userId) {
      setShowAuth(true);
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      await saveMessage(newMessage, userId);
      const similarMessages = await getSimilarMessages(content, userId);

      const context = `
Current Market Data:
${marketData.map(m => `${m.symbol}: $${m.price} (${m.changePercent > 0 ? '+' : ''}${m.changePercent.toFixed(2)}%)`).join('\n')}

Previous Conversations:
${similarMessages.map(m => m.content).join('\n')}
`;

      const prompt = `You are a knowledgeable retirement investment advisor. Provide personalized advice based on the following context and user question. Consider the user's previous conversations for context and continuity.

Context:
${context}

User Question: ${content}

Provide clear, professional advice focused on long-term retirement planning. If the user hasn't mentioned specific details about their situation, feel free to ask follow-up questions to provide more personalized advice.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        createdAt: new Date(),
      };

      await saveMessage(assistantMessage, userId);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      alert('An error occurred while processing your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={32} className="text-blue-600" />
              <h1 className="text-2xl font-bold">Retirement Investment Advisor</h1>
            </div>
            <div className="flex items-center gap-2">
              {userId && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  <History size={20} />
                  History
                </button>
              )}
              {!userId && (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <LogIn size={20} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 bg-white">
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showHistory && (
        <ChatHistory
          messages={messages}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default App;
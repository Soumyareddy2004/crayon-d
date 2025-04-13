import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProfileSetup from './ProfileSetup';
import ChatHistory from './ChatHistory'; // you'll need this component too

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Please sign in to continue.</p>
        {/* You can include your sign-in UI here */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-600 text-white px-6 py-3 shadow-md">
        <h1 className="text-xl font-bold">FinChat 💬</h1>
        <div className="space-x-3">
          <button
            onClick={() => setShowProfileSetup(true)}
            className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100"
          >
            Profile Setup
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-auto">
        {/* Chat component goes here */}
      </main>

      {/* Conditional Modals */}
      {showProfileSetup && (
        <ProfileSetup
          userId={user.id}
          onComplete={() => setShowProfileSetup(false)}
        />
      )}

      {showHistory && (
        <ChatHistory
          userId={user.id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

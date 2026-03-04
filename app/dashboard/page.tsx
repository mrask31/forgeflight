'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChatInterface } from '@/components/chat/chat-interface';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-background-tertiary bg-background-secondary">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <h1 className="text-xl font-bold text-primary-500">ForgeFlight</h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}

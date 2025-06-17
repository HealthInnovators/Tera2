
import Home from '@/components/Home';
import FloatingChatButton from '@/components/chat/FloatingChatButton';

export default function Page() {
  return (
    <main className="min-h-screen bg-background font-body">
      <Home />
      <FloatingChatButton />
    </main>
  );
}
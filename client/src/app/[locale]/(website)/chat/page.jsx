import dynamic from 'next/dynamic';

// Rediriger vers la page messages
const MessagesLayout = dynamic(() => import('@/features/messages/components/MessageThread'), { ssr: false });

export default function Page() {
  return (
    <div style={{ padding: '20px' }}>
      <MessagesLayout />
    </div>
  );
}

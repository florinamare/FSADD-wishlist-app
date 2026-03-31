import { useParams } from 'react-router-dom';

export function SharedPage() {
  const { shareToken } = useParams<{ shareToken: string }>();

  return (
    <main className="app">
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p className="state-msg">shared wishlist: {shareToken}</p>
      </div>
    </main>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendsApi, usersApi, Friend, UserSearchResult } from '../api/WishlistApi';

interface Props {
  onClose: () => void;
}

export function FriendsPanel({ onClose }: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    friendsApi.getFriends()
      .then(setFriends)
      .finally(() => setFriendsLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setSearchLoading(true);
      usersApi.search(query)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const isSearching = query.length >= 3;

  return (
    <div className="friends-panel">
      <div className="friends-panel-header">
        <span className="section-label" style={{ marginBottom: 0 }}>prieteni</span>
        <button className="btn-edit-budget" onClick={onClose}>✕ close</button>
      </div>

      <input
        className="friends-search"
        type="text"
        placeholder="caută utilizator după nume..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {query.length > 0 && query.length < 3 && (
        <p className="friends-search-hint">introdu minim 3 caractere</p>
      )}

      {isSearching ? (
        <>
          {searchLoading && <p className="state-msg">se caută...</p>}
          {!searchLoading && searchResults.length === 0 && (
            <p className="state-msg">niciun utilizator găsit</p>
          )}
          {searchResults.map((u) => (
            <button
              key={u.shareToken}
              className="friend-row"
              onClick={() => navigate(`/shared/${u.shareToken}`)}
            >
              <span className="friend-name">{u.username}</span>
            </button>
          ))}
        </>
      ) : (
        <>
          {friendsLoading && <p className="state-msg">loading...</p>}
          {!friendsLoading && friends.length === 0 && (
            <p className="state-msg">niciun prieten încă</p>
          )}
          {friends.map((f) => (
            <button
              key={String(f.visitorId)}
              className="friend-row"
              onClick={() => f.shareToken && navigate(`/shared/${f.shareToken}`)}
              disabled={!f.shareToken}
            >
              <span className="friend-name">{f.visitorName}</span>
              <span className="friend-meta">
                {f.hasNewItems && <span className="friend-badge-new">nou</span>}
                <span className="friend-visited">
                  {new Date(f.visitedAt).toLocaleDateString('ro-RO')}
                </span>
              </span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

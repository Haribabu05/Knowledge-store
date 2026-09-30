import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import NoteCard from './NoteCard';

const PAGE_SIZE = 9; // 3 columns x 3 rows per batch

export default function Dashboard({ category, personName }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError('');
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Could not load notes. Please refresh and try again.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const name = personName.trim().toLowerCase();
    return notes.filter((n) => {
      const matchesCategory = !category || n.category === category;
      const matchesName = !name || (n.uploaderUsername || '').toLowerCase().includes(name);
      return matchesCategory && matchesName;
    });
  }, [notes, category, personName]);

  // Whenever the filters change, go back to showing just the first page
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, personName]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const filtersActive = Boolean(category || personName.trim());

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <p className="mt-6 mb-3 text-sub dark:text-sub-dark text-sm">
        <b className="text-ink dark:text-ink-dark">Notes</b> — {filtered.length}
      </p>

      {error && <p className="text-center text-red-500 text-sm my-10">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-sub dark:text-sub-dark text-sm my-10">
          {filtersActive ? 'No notes match that category or name.' : 'No notes yet. Be the first to upload one.'}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-3 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-ink dark:text-ink-dark font-semibold"
          >
            Load More Notes
          </button>
        </div>
      )}
    </div>
  );
}
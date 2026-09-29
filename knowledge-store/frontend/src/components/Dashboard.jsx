import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import NoteCard from './NoteCard';

export default function Dashboard({ category, personName }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Live-updating query: any new upload appears for everyone without a refresh
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Filtering happens client-side here since ~100 notes is trivial;
  // switch to Firestore `where()` clauses if this collection grows large.
  const filtered = useMemo(() => {
    const name = personName.trim().toLowerCase();
    return notes.filter((n) => {
      const matchesCategory = !category || n.category === category;
      const matchesName = !name || (n.uploaderUsername || '').toLowerCase().includes(name);
      return matchesCategory && matchesName;
    });
  }, [notes, category, personName]);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <p className="mt-6 mb-3 text-sub dark:text-sub-dark text-sm">
        <b className="text-ink dark:text-ink-dark">Notes</b> — {filtered.length}
      </p>

      {loading && <p className="text-sub dark:text-sub-dark text-sm">Loading notes…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-sub dark:text-sub-dark text-sm my-10">
          No notes match that category or name.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
//hello


import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function NotePage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'notes', id)).then((snap) => {
      if (snap.exists()) setNote({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  if (!note) {
    return <p className="text-center text-sub dark:text-sub-dark mt-10">Loading note…</p>;
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: note.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <Link to="/" className="inline-block text-sm font-semibold text-ink dark:text-ink-dark mt-6 mb-4">
        ← Back to notes
      </Link>

      <h1 className="text-2xl font-bold text-ink dark:text-ink-dark mb-1">{note.title}</h1>
      <span className="inline-block text-xs text-accent dark:text-accent-dark bg-accentSoft dark:bg-accentSoft-dark px-2 py-0.5 rounded mb-3">
        {note.category}
      </span>
      <p className="text-sm text-sub dark:text-sub-dark mb-6">
        By <b className="text-ink dark:text-ink-dark">{note.uploaderUsername}</b>
      </p>

      {/* Drive's own embeddable preview — scrollable, works on mobile without any extra library */}
      <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm overflow-hidden mb-5">
        <iframe
          title={note.title}
          src={`https://drive.google.com/file/d/${note.fileId}/preview`}
          className="w-full aspect-[3/4] max-h-[70vh]"
          allow="autoplay"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href={note.downloadLink}
          className="flex-1 min-w-[160px] text-center rounded-lg bg-accent dark:bg-accent-dark text-white font-bold py-3"
        >
          ⬇ Download PDF
        </a>
        <a
          href={note.fileLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[160px] text-center rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-ink dark:text-ink-dark font-semibold py-3"
        >
          ⤢ Open in new tab
        </a>
        <button
          onClick={handleShare}
          className="flex-1 min-w-[160px] rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-ink dark:text-ink-dark font-semibold py-3"
        >
          ↗ Share
        </button>
      </div>
    </div>
  );
}

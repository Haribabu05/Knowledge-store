import { Link } from 'react-router-dom';

export default function NoteCard({ note }) {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm p-4 flex gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-ink dark:text-ink-dark truncate">{note.title}</p>
        <span className="inline-block text-xs text-accent dark:text-accent-dark bg-accentSoft dark:bg-accentSoft-dark px-2 py-0.5 rounded mb-2">
          {note.category}
        </span>
        <div className="text-sm text-sub dark:text-sub-dark mb-3">
          By: <b className="text-ink dark:text-ink-dark">{note.uploaderUsername}</b>
        </div>
        <div className="flex items-center justify-between">
          <Link
            to={`/note/${note.id}`}
            className="px-4 py-2 rounded-lg bg-ink dark:bg-ink-dark text-white dark:text-ink text-sm font-semibold"
          >
            View Note
          </Link>
          <span className="text-xs text-sub dark:text-sub-dark">{note.createdAtLabel}</span>
        </div>
      </div>
    </div>
  );
}

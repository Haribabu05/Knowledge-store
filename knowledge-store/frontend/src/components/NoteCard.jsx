import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NoteCard({ note }) {
  const [imgFailed, setImgFailed] = useState(false);
  const date = note.createdAt?.toDate?.().toLocaleDateString('en-GB');
  const showThumb = note.fileId && !imgFailed;

  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm p-6 flex gap-5">
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-2xl font-bold text-ink dark:text-ink-dark truncate">{note.title}</p>
        <span className="self-start text-sm text-accent dark:text-accent-dark bg-accentSoft dark:bg-accentSoft-dark px-2.5 py-1 rounded mt-2 mb-3">
          {note.category}
        </span>
        <div className="text-base text-sub dark:text-sub-dark mb-4">
          By: <b className="text-ink dark:text-ink-dark">{note.uploaderUsername}</b>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <Link
            to={`/note/${note.id}`}
            className="px-6 py-3 rounded-lg bg-ink dark:bg-ink-dark text-white dark:text-ink text-base font-semibold"
          >
            View Note
          </Link>
          <span className="text-sm text-sub dark:text-sub-dark">{date}</span>
        </div>
      </div>

      <div className="w-28 sm:w-40 shrink-0 aspect-[3/4] rounded-lg border border-border dark:border-border-dark overflow-hidden bg-page dark:bg-page-dark">
        {showThumb ? (
          <img
            src={`https://drive.google.com/thumbnail?id=${note.fileId}&sz=w400`}
            alt={`Preview of ${note.title}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">📄</div>
        )}
      </div>
    </div>
  );
}
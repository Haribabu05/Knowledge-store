import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NoteCard({ note }) {
  const [imgFailed, setImgFailed] = useState(false);

  const date = note.createdAt?.toDate?.().toLocaleDateString('en-GB');

  const showThumb = note.fileId && !imgFailed;

  return (
    <div
      className="
        w-full
        h-[300px]
        rounded-2xl
        border-2 border-ink dark:border dark:border-border-dark
        bg-card dark:bg-card-dark
        shadow-sm
        p-5
        flex
        gap-4
        overflow-hidden
      "
    >
      {/* LEFT CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">

        <p
          className="
            text-2xl
            font-bold
            text-ink dark:text-ink-dark
            truncate
          "
        >
          {note.title}
        </p>

        <span
          className="
            self-start
            text-sm
            text-accent dark:text-accent-dark
            bg-accentSoft dark:bg-accentSoft-dark
            px-2.5 py-1
            rounded
            mt-2
            mb-3
          "
        >
          {note.category}
        </span>

        <div className="text-base text-sub dark:text-sub-dark">
          By:{' '}
          <b className="text-ink dark:text-ink-dark">
            {note.uploaderUsername}
          </b>
        </div>

        <div className="text-sm text-sub dark:text-sub-dark mt-1">
          {date}
        </div>

        {/* BOTTOM */}
        <div className="mt-auto">
          <Link
            to={`/note/${note.id}`}
            className="
              inline-block
              px-5 py-2.5
              rounded-lg
              bg-ink dark:bg-ink-dark
              text-white dark:text-ink
              text-base
              font-semibold
            "
          >
            View Note
          </Link>
        </div>
      </div>

      {/* THUMBNAIL */}
      <div
        className="
          w-40
          shrink-0
          aspect-[3/4]
          rounded-lg
          border border-border dark:border-border-dark
          overflow-hidden
          bg-page dark:bg-page-dark
        "
      >
        {showThumb ? (
          <img
            src={`https://drive.google.com/thumbnail?id=${note.fileId}&sz=w400`}
            alt={`Preview of ${note.title}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="
              w-full
              h-full
              object-cover
              object-top
            "
          />
        ) : (
          <div
            className="
              w-full
              h-full
              flex
              items-center
              justify-center
              text-4xl
              opacity-40
            "
          >
            📄
          </div>
        )}
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const CATEGORIES = [
  'Java',
  'Discrete Mathematics',
  'DSA',
  'DBMS',
  'Operating Systems',
  'computer networks',
  'System desgin',
  'Python',
  'Spring Boot',
  'C',
  'C++',
  'Design Pattern',
  'others',
  'Go'
];

export default function Header({
  category,
  setCategory,
  personName,
  setPersonName,
  dark,
  setDark
}) {
  const { user, profile } = useAuth();

  return (
    <div className="sticky top-[env(safe-area-inset-top,0px)] z-20 bg-page/95 dark:bg-page-dark/95 backdrop-blur-sm pb-3">

      <div className="relative px-4 pt-4">

        {/* Privacy Policy - outside the main header */}
        <Link
          to="/privacy-policy"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-ink/60 dark:text-ink-dark/60 hover:text-accent dark:hover:text-accent-dark"
        >
          Privacy Policy
        </Link>

        {/* ORIGINAL HEADER */}
        <header className="mx-auto max-w-3xl rounded-2xl border border-border dark:border-border-dark bg-header dark:bg-header-dark shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">

          <Link
            to="/"
            className="text-lg font-bold text-ink dark:text-ink-dark shrink-0"
          >
            Knowledge{' '}
            <span className="text-accent dark:text-accent-dark">
              Store
            </span>
          </Link>

          <label className="flex items-center gap-1 rounded-full border border-border dark:border-border-dark bg-page dark:bg-page-dark px-3 py-1.5 text-sm font-semibold text-ink dark:text-ink-dark">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="">All categories</option>

              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="flex-1 min-w-[160px] max-w-xs">
            <input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person name"
              className="w-full rounded-full border border-border dark:border-border-dark bg-page dark:bg-page-dark px-4 py-1.5 text-sm text-ink dark:text-ink-dark outline-none"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">

            <Link
              to="/upload"
              title="Upload notes"
              className="w-9 h-9 rounded-full bg-accent dark:bg-accent-dark text-white flex items-center justify-center"
            >
              ↑
            </Link>

            <button
              onClick={() => setDark(!dark)}
              title="Toggle dark mode"
              className="w-9 h-9 rounded-full border border-border dark:border-border-dark bg-page dark:bg-page-dark text-ink dark:text-ink-dark"
            >
              ◐
            </button>

            <div className="w-9 h-9 rounded-full bg-accentSoft dark:bg-accentSoft-dark flex items-center justify-center text-sm font-bold text-accent dark:text-accent-dark">
              {profile?.username
                ? profile.username[0].toUpperCase()
                : user
                ? '•'
                : '?'}
            </div>

          </div>

        </header>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { useAuth } from './context/AuthContext';

export default function ContributorAuth({ children }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

const handleGoogleSignIn = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    console.error(err);
    setError('Sign-in failed. Please try again.');
  }
};

  const claimUsername = async () => {
    const name = username.trim();
    if (!name) return;
    setChecking(true);
    setError('');

    try {
      const usernameRef = doc(db, 'usernames', name.toLowerCase());
      const profileRef = doc(db, 'profiles', user.uid);

      await runTransaction(db, async (tx) => {
        const taken = await tx.get(usernameRef);
        if (taken.exists()) throw new Error('That username is already taken.');

        tx.set(usernameRef, { uid: user.uid });
        tx.set(profileRef, {
          username: name,
          email: user.email,
          displayName: user.displayName,
          createdAt: Date.now(),
        });
      });

      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Could not save that username.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) return null;

  // 1. Not signed in
  if (!user) {
    return (
      <div className="max-w-sm mx-auto mt-14 text-center rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm p-8">
        <h2 className="text-lg font-bold text-ink dark:text-ink-dark mb-2">Sign in to upload</h2>
        <p className="text-sm text-sub dark:text-sub-dark mb-5">
          We ask uploaders to sign in so other students know who shared a note and can find more from them.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-border dark:border-border-dark py-2.5 font-semibold text-ink dark:text-ink-dark"
        >
          <span
            className="w-4 h-4 rounded-full"
            style={{ background: 'conic-gradient(#4285F4 0 25%, #34A853 25% 50%, #FBBC05 50% 75%, #EA4335 75% 100%)' }}
          />
          Continue with Google
        </button>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>
    );
  }

  // 2. Signed in, but this is their first-ever sign-in — no username saved yet
  if (!profile?.username) {
    return (
      <div className="max-w-sm mx-auto mt-14 text-center rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm p-8">
        <h2 className="text-lg font-bold text-ink dark:text-ink-dark mb-2">Pick your username</h2>
        <p className="text-sm text-sub dark:text-sub-dark mb-4">
          Signed in as {user.email}. Choose a username once — it's saved to your account and used on
          everything you upload from now on.
        </p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. ritik_23"
          className="w-full rounded-lg border border-border dark:border-border-dark bg-page dark:bg-page-dark px-3 py-2 text-sm text-ink dark:text-ink-dark outline-none mb-3"
        />
        <button
          onClick={claimUsername}
          disabled={checking}
          className="w-full rounded-lg bg-accent dark:bg-accent-dark text-white font-bold py-2.5"
        >
          {checking ? 'Saving…' : 'Save and continue'}
        </button>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>
    );
  }

  // 3. Fully signed in with a username — render whatever was passed in (the upload form)
  return children;
}

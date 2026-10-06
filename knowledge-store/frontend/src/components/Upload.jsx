import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './context/AuthContext';
import ContributorAuth from './ContributorAuth';

const CATEGORIES = [
  'Java',
  'Discrete Mathematics',
  'DSA',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'System Design',
  'Python',
  'Spring Boot',
  'C',
  'C++',
  'Design Pattern',
  'Others',
  'Go'
];

function UploadForm() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError('Please add a title and choose a file.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(import.meta.env.VITE_UPLOAD_SERVER_URL, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload server rejected the file.');
      const data = await res.json();

      // The backend already grants Drive's "anyone with the link" permission
      // before returning — see server/main.py.
      await addDoc(collection(db, 'notes'), {
        title: title.trim(),
        category,
        uploaderUid: user.uid,
        uploaderUsername: profile.username,
        fileId: data.fileId,
        fileLink: data.fileLink,
        downloadLink: data.downloadLink,
        createdAt: serverTimestamp(),
      });

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Something went wrong uploading your note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-6">
      <div className="flex items-center justify-between rounded-lg bg-accentSoft dark:bg-accentSoft-dark px-4 py-2.5 text-sm text-ink dark:text-ink-dark mb-5">
        <span>
          Signed in as <b className="text-accent dark:text-accent-dark">{profile.username}</b>
        </span>
      </div>

      <label className="block border-2 border-dashed border-border dark:border-border-dark rounded-xl text-center py-8 mb-4 cursor-pointer text-sub dark:text-sub-dark">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="text-2xl mb-1">📄</div>
        {file ? file.name : <span><b className="text-accent dark:text-accent-dark">Choose a PDF</b> or drag it here</span>}
      </label>

      <label className="block text-sm font-semibold text-ink dark:text-ink-dark mb-1.5">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Java — Mid Semester Questions"
        className="w-full rounded-lg border border-border dark:border-border-dark bg-page dark:bg-page-dark px-3 py-2 text-sm text-ink dark:text-ink-dark outline-none mb-4"
      />

      <label className="block text-sm font-semibold text-ink dark:text-ink-dark mb-1.5">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-lg border border-border dark:border-border-dark bg-page dark:bg-page-dark px-3 py-2 text-sm text-ink dark:text-ink-dark outline-none mb-5"
      >
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-accent dark:bg-accent-dark text-white font-bold py-3"
      >
        {submitting ? 'Uploading…' : 'Upload note'}
      </button>
    </form>
  );
}

export default function Upload() {
  return (
    <div className="px-4 pb-16">
      <ContributorAuth>
        <UploadForm />
      </ContributorAuth>
    </div>
  );
}

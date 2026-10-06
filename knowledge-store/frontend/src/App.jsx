import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import NotePage from './components/NotePage';
import Upload from './components/Upload';
import PrivacyPolicy from './components/PrivacyPolicy';

export default function App() {
  const [category, setCategory] = useState('');
  const [personName, setPersonName] = useState('');
  const [dark, setDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-page dark:bg-page-dark">
        <Header
          category={category}
          setCategory={setCategory}
          personName={personName}
          setPersonName={setPersonName}
          dark={dark}
          setDark={setDark}
        />
        <Routes>
          <Route path="/" element={<Dashboard category={category} personName={personName} />} />
          <Route path="/note/:id" element={<NotePage />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        </Routes>
      </div>
    </AuthProvider>
  );
}
